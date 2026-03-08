import { useState, useRef, useCallback, useEffect } from "react";
import { getSocket } from "../socket";
import {
  CALL_INITIATED,
  CALL_ACCEPTED,
  CALL_REJECTED,
  CALL_ENDED,
  WEBRTC_OFFER,
  WEBRTC_ANSWER,
  WEBRTC_ICE_CANDIDATE,
} from "../constants/events";
import { server } from "../constants/config";

// STUN-only fallback used until TURN credentials are loaded
const STUN_ONLY = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

// Module-level cache — fetched once, shared across all hook instances.
// Fetches from our own backend so the Metered API key never reaches the client.
let _iceCache = null;

const loadIceServers = async () => {
  if (_iceCache) return _iceCache;
  try {
    const res = await fetch(`${server}/api/v1/chat/turn-credentials`, {
      credentials: "include", // send auth cookie
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    _iceCache = await res.json();
  } catch (err) {
    console.warn("Failed to fetch TURN credentials, falling back to STUN only:", err);
    _iceCache = STUN_ONLY;
  }
  return _iceCache;
};

// Patch SDP offer to prioritize OPUS codec and cap audio bandwidth.
// This reduces latency and jitter on slow/mobile networks.
const patchSdpForVoice = (sdp) => {
  const lines = sdp.split("\r\n");
  const result = [];

  // Find the OPUS payload type
  let opusPayload = null;
  for (const line of lines) {
    const m = line.match(/^a=rtpmap:(\d+) opus\/48000/i);
    if (m) { opusPayload = m[1]; break; }
  }

  let inAudioSection = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("m=audio")) inAudioSection = true;
    else if (line.startsWith("m=")) inAudioSection = false;

    result.push(line);

    // After the m=audio line, insert bandwidth cap
    if (inAudioSection && line.startsWith("m=audio")) {
      result.push("b=AS:32"); // 32 kbps max for audio
    }

    // Add OPUS-specific fmtp for low-latency voice if not already present
    if (opusPayload && line === `a=rtpmap:${opusPayload} opus/48000/2`) {
      // cbr=0: allow variable bitrate (adapts to network)
      // useinbandfec=1: forward error correction (recovers from packet loss)
      // minptime=10: minimum packet duration 10ms (lower latency than default 20ms)
      if (!lines.some((l) => l.startsWith(`a=fmtp:${opusPayload}`))) {
        result.push(`a=fmtp:${opusPayload} minptime=10;useinbandfec=1;cbr=0`);
      }
    }
  }
  return result.join("\r\n");
};

// Servo-stabilised OLA pitch shifter.
//
// Root cause of the previous "fast-forward" bug:
//   For pitch > 1 the analysis hop (hopA = HS * pitch) > synthesis hop (HS).
//   Each grain cycle consumes MORE input than arrives → the analysis buffer
//   drains in ~70 ms, after which no new grains can be produced and the
//   remaining audio is crammed into the last few ms of outBuf → "fast-forward".
//
// Fix — servo feedback on hopA:
//   hopA = HS * pitch * (1 + error * 0.1)
//   where error = (currentLag - targetLag) / targetLag.
//   When lag falls below target → hopA is reduced slightly (read slower → buffer refills).
//   When lag rises above target → hopA increases slightly (read faster → buffer drains).
//   At steady state lag ≈ targetLag and hopA ≈ HS * pitch.
//   The pitch deviation from the servo term is < 1 cent — imperceptible in speech.
const OLA_WORKLET_CODE = `
class SolaShifter extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{ name: 'pitch', defaultValue: 1.0, minValue: 0.25, maxValue: 4.0, automationRate: 'k-rate' }];
  }
  constructor() {
    super();
    this.G      = 1024;       // grain size (~23 ms @ 44100 Hz)
    this.HS     = 256;        // synthesis hop (4× Hann overlap)
    this.SIZE   = 65536;      // ring buffer — must be power of 2
    this.MASK   = 65535;
    this.TARGET = this.G * 4; // target analysis lag = 4 grains (~93 ms)
    this.inBuf  = new Float32Array(this.SIZE);
    this.outBuf = new Float32Array(this.SIZE);
    this.inWr   = 0;     // samples written to inBuf (absolute index)
    this.inRdF  = 0.0;   // float analysis read pointer (sub-sample accurate)
    this.outWr  = 0;     // where next grain is accumulated (absolute)
    this.outRd  = 0;     // next output sample to read (absolute)
    this.timer  = 0;     // samples until next grain trigger
    this.filled = 0;     // total input samples seen
    this.ready  = false;
    this.NORM   = 0.5;   // Hann 4× overlap normalisation factor
    this.win = new Float32Array(this.G);
    for (let i = 0; i < this.G; i++)
      this.win[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / this.G);
  }
  process(inputs, outputs, parameters) {
    const inp = inputs[0]?.[0];
    const out = outputs[0]?.[0];
    if (!inp || !out) return true;
    const pitch = parameters.pitch[0] ?? 1.0;

    // Always accumulate input
    for (let i = 0; i < inp.length; i++) {
      this.inBuf[this.inWr & this.MASK] = inp[i];
      this.inWr++;
    }
    this.filled += inp.length;

    // Silence during initial pre-fill (TARGET + one extra grain for safety)
    if (!this.ready) {
      if (this.filled < this.TARGET + this.G) {
        for (let i = 0; i < out.length; i++) out[i] = 0;
        return true;
      }
      this.inRdF = this.inWr - this.TARGET;
      this.outWr = 0;
      this.outRd = 0;
      this.ready = true;
    }

    // Generate output sample by sample
    for (let i = 0; i < out.length; i++) {
      if (this.timer <= 0) {
        const lag = this.inWr - this.inRdF;
        // Servo: nudge hopA so lag stays near TARGET.
        // Gain 0.1 → steady-state pitch error < 1 cent.
        const err  = (lag - this.TARGET) / this.TARGET;
        const hopA = this.HS * pitch * (1.0 + err * 0.1);

        if (lag >= this.G) {
          const base = this.outWr;
          const rd   = this.inRdF;
          const norm = this.NORM;
          for (let j = 0; j < this.G; j++) {
            const p  = rd + j;
            const pi = p | 0;
            const pf = p - pi;
            const s  = this.inBuf[ pi      & this.MASK] * (1 - pf)
                     + this.inBuf[(pi + 1) & this.MASK] * pf;
            this.outBuf[(base + j) & this.MASK] += s * this.win[j] * norm;
          }
          this.inRdF += hopA;
          this.outWr += this.HS;
        }
        this.timer = this.HS;
      }
      this.timer--;
      const ri = this.outRd & this.MASK;
      out[i] = this.outBuf[ri];
      this.outBuf[ri] = 0;   // clear after reading (ring-buffer reuse)
      this.outRd++;
    }
    return true;
  }
}
registerProcessor('sola-shifter', SolaShifter);
`;

/**
 * Build a Web Audio API processing chain for voice effects.
 * Returns { stream, ctx } — stream is the processed MediaStream, ctx is the AudioContext.
 * A DynamicsCompressorNode is inserted at the start of EVERY chain (including "normal")
 * so loud peaks are automatically tamed regardless of which effect is selected.
 */
const applyVoiceEffect = async (rawStream, effect) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const source = ctx.createMediaStreamSource(rawStream);
  const dest = ctx.createMediaStreamDestination();

  // ── Dynamics compressor — always first in chain ─────────────────
  // Automatically reduces loud spikes (shouting) while keeping quiet
  // speech audible. Think of it as an "auto-volume leveller".
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -24; // start compressing at –24 dBFS
  comp.knee.value      = 30;  // soft knee — gradual onset
  comp.ratio.value     = 12;  // 12:1 heavy ratio for shout prevention
  comp.attack.value    = 0.003; // 3 ms fast attack — catches transients
  comp.release.value   = 0.25; // 250 ms release — natural fade-back
  source.connect(comp);
  // 'comp' is now the entry point for all effect chains below.

  if (effect === "normal") {
    // Pass-through — compressor is the only processing
    comp.connect(dest);
    return { stream: dest.stream, ctx };
  }

  switch (effect) {
    case "robot": {
      // Ring modulation with 50 Hz sine → robotic buzz
      const osc = ctx.createOscillator();
      const gainMod = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 50;
      gainMod.gain.value = 0;
      osc.connect(gainMod.gain);
      comp.connect(gainMod);
      gainMod.connect(dest);
      osc.start();
      break;
    }
    case "deep": {
      // Low-shelf boost at 250 Hz (+14 dB) + low-pass at 3500 Hz → deep/bass voice
      const lowShelf = ctx.createBiquadFilter();
      lowShelf.type = "lowshelf";
      lowShelf.frequency.value = 250;
      lowShelf.gain.value = 14;
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 3500;
      comp.connect(lowShelf);
      lowShelf.connect(lowpass);
      lowpass.connect(dest);
      break;
    }
    case "echo": {
      // Gated trail echo — the echo gate closes during silence so only the
      // tail of each spoken word echoes, not continuous ambient noise.
      // Topology: comp → dryGain → dest
      //           comp → delayGain → delay ↔ feedbackGain (loop) → delay → dest
      //           comp → analyser (read energy to drive delayGain in worklet)
      //
      // The gate cuts the wet signal when RMS < threshold, so pauses between
      // words are clean. Result: each word leaves a fading echo trail —
      // perceptually very close to "last word echoes".
      const GATE_CODE = `
class EchoGate extends AudioWorkletProcessor {
  constructor() {
    super();
    this.rms = 0;
    this.port.onmessage = () => {};
  }
  process(inputs, outputs, parameters) {
    const inp = inputs[0]?.[0];
    const out = outputs[0]?.[0];
    if (!inp || !out) return true;
    let sum = 0;
    for (let i = 0; i < inp.length; i++) sum += inp[i] * inp[i];
    const rms = Math.sqrt(sum / inp.length);
    // Smooth the RMS (10ms attack, 300ms release at 128-sample blocks)
    this.rms = rms > this.rms ? rms * 0.8 + this.rms * 0.2
                              : rms * 0.05 + this.rms * 0.95;
    // Gate threshold: -40 dBFS = 0.01 linear
    const gateOpen = this.rms > 0.01 ? 1 : 0;
    for (let i = 0; i < out.length; i++) out[i] = inp[i] * gateOpen;
    return true;
  }
}
registerProcessor('echo-gate', EchoGate);
`;
      const gblob = new Blob([GATE_CODE], { type: "application/javascript" });
      const gurl = URL.createObjectURL(gblob);
      await ctx.audioWorklet.addModule(gurl);
      URL.revokeObjectURL(gurl);

      const gate = new AudioWorkletNode(ctx, "echo-gate");
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.35;          // 350ms — one "word length" behind
      const feedbackGain = ctx.createGain();
      feedbackGain.gain.value = 0.3;         // each repeat is 30% of previous → ~2 audible repeats
      const wetGain = ctx.createGain();
      wetGain.gain.value = 0.7;

      // Gate sits between comp and the wet chain so echoes only trail live speech
      comp.connect(gate);
      gate.connect(delay);
      delay.connect(feedbackGain);
      feedbackGain.connect(delay);  // feedback loop
      delay.connect(wetGain);
      wetGain.connect(dest);
      comp.connect(dest);           // dry pass-through (unaffected by gate)
      break;
    }
    case "phone": {
      // Narrow band-pass (300–3400 Hz) + mild distortion → telephone effect
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 1700;
      bandpass.Q.value = 1.8;
      const waveshaper = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i * 2) / 256 - 1;
        curve[i] = ((Math.PI + 80) * x) / (Math.PI + 80 * Math.abs(x));
      }
      waveshaper.curve = curve;
      comp.connect(bandpass);
      bandpass.connect(waveshaper);
      waveshaper.connect(dest);
      break;
    }
    case "alien": {
      // Ring modulation with 250 Hz sawtooth → alien / shifter effect
      const osc = ctx.createOscillator();
      const gainMod = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = 250;
      gainMod.gain.value = 0;
      osc.connect(gainMod.gain);
      comp.connect(gainMod);
      gainMod.connect(dest);
      osc.start();
      break;
    }
    case "female": {
      // Formant-preserving pitch shift UP +4 semitones (×1.25) via servo-OLA.
      const blob = new Blob([OLA_WORKLET_CODE], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      const shifter = new AudioWorkletNode(ctx, "sola-shifter", { parameterData: { pitch: 1.25 } });
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 180;
      hp.Q.value = 0.7;
      const presence = ctx.createBiquadFilter();
      presence.type = "peaking";
      presence.frequency.value = 3200;
      presence.Q.value = 0.9;
      presence.gain.value = 6;
      const air = ctx.createBiquadFilter();
      air.type = "highshelf";
      air.frequency.value = 6000;
      air.gain.value = 3;
      comp.connect(shifter);
      shifter.connect(hp);
      hp.connect(presence);
      presence.connect(air);
      air.connect(dest);
      break;
    }
    case "male": {
      // Formant-preserving pitch shift DOWN −5 semitones (×0.749) via OLA.
      const blob = new Blob([OLA_WORKLET_CODE], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      const shifter = new AudioWorkletNode(ctx, "sola-shifter", { parameterData: { pitch: 0.749 } });
      const chest = ctx.createBiquadFilter();
      chest.type = "lowshelf";
      chest.frequency.value = 200;
      chest.gain.value = 10;
      const body = ctx.createBiquadFilter();
      body.type = "peaking";
      body.frequency.value = 400;
      body.Q.value = 1.2;
      body.gain.value = 5;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 4500;
      lp.Q.value = 0.7;
      comp.connect(shifter);
      shifter.connect(chest);
      chest.connect(body);
      body.connect(lp);
      lp.connect(dest);
      break;
    }
    case "baby": {
      // +12 semitones (×2.0 = one full octave up) via servo-OLA.
      // Babies have F0 ~400–600 Hz vs adult ~120 Hz → roughly ×4,
      // but ×2 (one octave) already sounds convincingly baby-like
      // without being cartoonishly chipmunk-pitched.
      const blob = new Blob([OLA_WORKLET_CODE], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);
      const shifter = new AudioWorkletNode(ctx, "sola-shifter", { parameterData: { pitch: 1.60 } });
      // Aggressive bass cut — babies have no chest resonance
      const bassHP = ctx.createBiquadFilter();
      bassHP.type = "highpass";
      bassHP.frequency.value = 300;
      bassHP.Q.value = 0.9;
      // Nasal / cranial resonance — baby voices are thin and middy
      const nasal = ctx.createBiquadFilter();
      nasal.type = "peaking";
      nasal.frequency.value = 1200;
      nasal.Q.value = 1.5;
      nasal.gain.value = 7;
      // Soft high-frequency rolloff — baby voice sounds slightly muffled up top
      const softLP = ctx.createBiquadFilter();
      softLP.type = "lowpass";
      softLP.frequency.value = 7000;
      softLP.Q.value = 0.6;
      comp.connect(shifter);
      shifter.connect(bassHP);
      bassHP.connect(nasal);
      nasal.connect(softLP);
      softLP.connect(dest);
      break;
    }
    default:
      comp.connect(dest);
  }

  return { stream: dest.stream, ctx };
};

export const useAudioCall = () => {
  const socket = getSocket();
  const [callState, setCallState] = useState("idle");
  const [callInfo, setCallInfo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const speakerOnRef = useRef(true);
  useEffect(() => { speakerOnRef.current = speakerOn; }, [speakerOn]);
  const [callEndReason, setCallEndReason] = useState(null); // "offline" | "rejected" | "ended" | "no_members" | etc.

  // ── Refs to avoid stale closures inside socket handlers ─────────
  const callStateRef = useRef(callState);
  const callInfoRef = useRef(callInfo);
  useEffect(() => { callStateRef.current = callState; }, [callState]);
  useEffect(() => { callInfoRef.current = callInfo; }, [callInfo]);

  const peersRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const remoteAudiosRef = useRef(new Map());
  const callIdRef = useRef(null);
  const iceServersRef = useRef(STUN_ONLY); // updated once TURN creds load

  const [voiceEffect, setVoiceEffect] = useState("normal");
  const voiceEffectRef = useRef("normal");
  useEffect(() => { voiceEffectRef.current = voiceEffect; }, [voiceEffect]);
  const rawMicRef = useRef(null);
  const audioCtxRef = useRef(null);

  // Prefetch ICE / TURN credentials as early as possible
  useEffect(() => {
    loadIceServers().then((servers) => { iceServersRef.current = servers; });
  }, []);

  // Re-route audio if a Bluetooth device is connected / disconnected mid-call
  useEffect(() => {
    const handleDeviceChange = () => {
      resolveSinkId(speakerOnRef.current).then((sinkId) =>
        applySinkIdRef.current(sinkId)
      );
    };
    navigator.mediaDevices?.addEventListener("devicechange", handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [resolveSinkId]);

  // ── Mute toggle ─────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      // Mute the raw mic track — it feeds the processing chain even with an effect active
      const stream = rawMicRef.current || localStreamRef.current;
      if (stream) {
        stream.getAudioTracks().forEach((track) => { track.enabled = !next; });
      }
      return next;
    });
  }, []);

  // ── Apply a sinkId to all active remote audio elements ───────────
  const applySinkId = useCallback(async (sinkId) => {
    const promises = [];
    remoteAudiosRef.current.forEach((audioEl) => {
      if (typeof audioEl.setSinkId === "function") {
        promises.push(audioEl.setSinkId(sinkId).catch(() => {}));
      }
    });
    await Promise.all(promises);
  }, []);
  const applySinkIdRef = useRef(applySinkId);
  applySinkIdRef.current = applySinkId;

  // ── Resolve the best sinkId for the desired output mode ──────────
  // On mobile browsers setSinkId may not exist, but when it does:
  // - speaker ON  → prefer Bluetooth/headset if connected, else 'default'
  // - speaker OFF → prefer earpiece ('communications'), else 'default'
  const resolveSinkId = useCallback(async (wantSpeaker) => {
    if (!navigator.mediaDevices?.enumerateDevices) return wantSpeaker ? "default" : "communications";
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const outputs = devices.filter((d) => d.kind === "audiooutput");
      if (wantSpeaker) {
        // Prefer any Bluetooth or headset device
        const bt = outputs.find((d) =>
          /bluetooth|headset|airpod|headphone|earphone|wireless/i.test(d.label)
        );
        return bt ? bt.deviceId : "default";
      } else {
        // Prefer earpiece
        const ear = outputs.find((d) =>
          /earpiece|receiver|ear speaker/i.test(d.label)
        );
        return ear ? ear.deviceId : "communications";
      }
    } catch {
      return wantSpeaker ? "default" : "communications";
    }
  }, []);

  // ── Speaker / earpiece toggle ────────────────────────────────────
  const toggleSpeaker = useCallback(() => {
    setSpeakerOn((prev) => {
      const next = !prev;
      speakerOnRef.current = next;
      resolveSinkId(next).then((sinkId) => applySinkIdRef.current(sinkId));
      return next;
    });
  }, [resolveSinkId]);

  // ── Cleanup ─────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    rawMicRef.current?.getTracks().forEach((t) => t.stop());
    rawMicRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
    remoteAudiosRef.current.forEach((el) => {
      el.srcObject = null;
      el.remove();
    });
    remoteAudiosRef.current.clear();
    callIdRef.current = null;
    setCallState("idle");
    setCallInfo(null);
    setParticipants([]);
    setMuted(false);
    setSpeakerOn(true);
    setVoiceEffect("normal");
    // Don't clear callEndReason here — let consumer read it after cleanup
  }, []);
  const cleanupRef = useRef(cleanup);
  cleanupRef.current = cleanup;

  // ── Create a peer connection to a specific remote user ──────────
  const createPeerFor = useCallback(
    (callId, remoteUserId) => {
      if (peersRef.current.has(remoteUserId)) return peersRef.current.get(remoteUserId);

      const peer = new RTCPeerConnection({ iceServers: iceServersRef.current });

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit(WEBRTC_ICE_CANDIDATE, {
            callId,
            candidate: e.candidate,
            toUserId: remoteUserId,
          });
        }
      };

      peer.ontrack = (e) => {
        let audioEl = remoteAudiosRef.current.get(remoteUserId);
        if (!audioEl) {
          audioEl = document.createElement("audio");
          audioEl.autoplay = true;
          audioEl.style.display = "none";
          document.body.appendChild(audioEl);
          remoteAudiosRef.current.set(remoteUserId, audioEl);
          // Route to the correct output device (Bluetooth / earpiece / speaker)
          // as soon as the element is created, using the current speakerOn state.
          resolveSinkId(speakerOnRef.current).then((sinkId) => {
            if (typeof audioEl.setSinkId === "function") {
              audioEl.setSinkId(sinkId).catch(() => {});
            }
          });
        }
        audioEl.srcObject = e.streams[0];
      };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => peer.addTrack(t, localStreamRef.current));
      }

      // Cap audio sender to 32 kbps — OPUS voice is excellent at this rate
      // and prevents flooding slow/mobile connections.
      peer.getSenders().forEach((sender) => {
        if (sender.track?.kind === "audio") {
          const params = sender.getParameters();
          if (!params.encodings || params.encodings.length === 0) {
            params.encodings = [{}];
          }
          params.encodings[0].maxBitrate = 32000; // 32 kbps
          sender.setParameters(params).catch(() => {});
        }
      });

      peersRef.current.set(remoteUserId, peer);
      return peer;
    },
    [socket]
  );

  // ── Acquire microphone + ensure ICE servers are loaded ─────────
  const acquireMic = useCallback(async () => {
    const [rawStream, servers] = await Promise.all([
      rawMicRef.current
        ? Promise.resolve(rawMicRef.current)
        : navigator.mediaDevices.getUserMedia({
            audio: {
              // Voice-optimised constraints — reduce latency on slow networks
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
              channelCount: 1,        // mono — halves bandwidth vs stereo
              sampleRate: 16000,      // 16 kHz is sufficient for voice (OPUS will use it)
              sampleSize: 16,
            },
            video: false,
          }),
      loadIceServers(),
    ]);
    rawMicRef.current = rawStream;
    iceServersRef.current = servers;

    // (Re)build the voice effect processing chain
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    const { stream: processedStream, ctx } = await applyVoiceEffect(rawStream, voiceEffectRef.current);
    audioCtxRef.current = ctx;
    localStreamRef.current = processedStream;
    return processedStream;
  }, []);
  const acquireMicRef = useRef(acquireMic);
  acquireMicRef.current = acquireMic;

  // ── Start call ──────────────────────────────────────────────────
  const startCall = useCallback(
    async ({ chatId, to, members, isGroup, groupName, toName, toAvatar }) => {
      try {
        await acquireMic();
        socket.emit(CALL_INITIATED, {
          chatId,
          to: isGroup ? undefined : to,
          members: isGroup ? members : undefined,
          isGroup: !!isGroup,
          groupName: isGroup ? (groupName || "Group Call") : undefined,
        });
        setCallState("calling");
        setCallInfo({
          chatId,
          to,
          isGroup: !!isGroup,
          groupName: groupName || "Group Call",
          toName: toName || null,
          toAvatar: toAvatar || null,
        });
      } catch (err) {
        console.error("Microphone access denied:", err);
      }
    },
    [socket, acquireMic]
  );

  // ── Accept incoming call ────────────────────────────────────────
  const acceptCall = useCallback(
    async ({ callId }) => {
      try {
        await acquireMic();
        callIdRef.current = callId;
        socket.emit(CALL_ACCEPTED, { callId });
        setCallState("active");
      } catch (err) {
        console.error("Microphone access denied:", err);
      }
    },
    [socket, acquireMic]
  );

  // ── Reject incoming call ────────────────────────────────────────
  const rejectCall = useCallback(
    ({ callId }) => {
      socket.emit(CALL_REJECTED, { callId });
      cleanup();
    },
    [socket, cleanup]
  );

  // ── End active call ─────────────────────────────────────────────
  const endCall = useCallback(
    ({ callId }) => {
      socket.emit(CALL_ENDED, { callId });
      cleanup();
    },
    [socket, cleanup]
  );

  const changeVoiceEffect = useCallback(async (newEffect) => {
    setVoiceEffect(newEffect);
    voiceEffectRef.current = newEffect;
    if (!rawMicRef.current) return; // no active call

    // Close the old processing chain
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    // Build the new chain
    const { stream: processedStream, ctx } = await applyVoiceEffect(rawMicRef.current, newEffect);
    audioCtxRef.current = ctx;
    localStreamRef.current = processedStream;

    // Replace the audio track in all active peer connections (no renegotiation required)
    const [newTrack] = processedStream.getAudioTracks();
    if (newTrack) {
      peersRef.current.forEach((peer) => {
        peer.getSenders().forEach((sender) => {
          if (sender.track?.kind === "audio") {
            sender.replaceTrack(newTrack).catch(() => {});
          }
        });
      });
    }
  }, []);

  // ── Socket listeners (stable — no callState/callInfo in deps) ───
  useEffect(() => {
    // Server sends back callId to the caller
    const handleCallId = ({ callId, participants: parts }) => {
      callIdRef.current = callId;
      if (parts) setParticipants(parts);
      setCallInfo((prev) => (prev ? { ...prev, callId } : prev));
    };

    // Incoming call (receiver side)
    const handleIncoming = (data) => {
      // Read from ref — never stale
      if (callStateRef.current !== "idle") {
        socket.emit(CALL_REJECTED, { callId: data.callId });
        return;
      }
      callIdRef.current = data.callId;
      setCallState("incoming");
      setCallInfo(data);
    };

    // Someone accepted — server tells us to create a peer connection
    const handleAccepted = async ({ callId, userId, shouldCreateOffer }) => {
      callIdRef.current = callId;

      // Flip UI to active immediately — don't wait for async signalling
      setCallState("active");
      setCallInfo((prev) => (prev ? { ...prev, callId } : prev));

      // Ensure mic is available (caller already has it, safety net for edge cases)
      if (!localStreamRef.current) {
        try {
          await acquireMicRef.current();
        } catch (e) {
          console.error("Failed to acquire mic in handleAccepted:", e);
        }
      }

      if (shouldCreateOffer && userId) {
        // Close any stale peer for this user (e.g. after reconnection)
        if (peersRef.current.has(userId)) {
          peersRef.current.get(userId).close();
          peersRef.current.delete(userId);
          const oldAudio = remoteAudiosRef.current.get(userId);
          if (oldAudio) { oldAudio.srcObject = null; oldAudio.remove(); }
          remoteAudiosRef.current.delete(userId);
        }
        const peer = createPeerFor(callId, userId);
        try {
          const offer = await peer.createOffer();
          await peer.setLocalDescription(offer);
          // Patch SDP: prioritize OPUS and set 32 kbps bandwidth limit
          const patchedOffer = {
            ...offer,
            sdp: patchSdpForVoice(offer.sdp),
          };
          socket.emit(WEBRTC_OFFER, { callId, offer: patchedOffer, toUserId: userId });
        } catch (e) {
          console.error("Error creating offer:", e);
        }
      }
    };

    const handleRejected = ({ callId, userId }) => {
      if (callInfoRef.current?.isGroup && userId) {
        setParticipants((prev) => prev.filter((p) => p.userId !== userId));
        return;
      }
      setCallEndReason("rejected");
      cleanupRef.current();
    };

    const handleEnded = ({ callId, userId, reason }) => {
      if (userId && peersRef.current.has(userId)) {
        peersRef.current.get(userId)?.close();
        peersRef.current.delete(userId);
        const audioEl = remoteAudiosRef.current.get(userId);
        if (audioEl) { audioEl.srcObject = null; audioEl.remove(); }
        remoteAudiosRef.current.delete(userId);
        setParticipants((prev) => prev.filter((p) => p.userId !== userId));
        if (peersRef.current.size === 0) {
          setCallEndReason(reason || "ended");
          cleanupRef.current();
        }
        return;
      }
      setCallEndReason(reason || "ended");
      cleanupRef.current();
    };

    const handleOffer = async ({ callId, offer, fromUserId }) => {
      // Ensure mic is available before creating peer
      if (!localStreamRef.current) {
        try {
          await acquireMicRef.current();
        } catch (e) {
          console.error("Failed to acquire mic in handleOffer:", e);
        }
      }

      // Close any stale peer before creating a fresh one
      if (peersRef.current.has(fromUserId)) {
        peersRef.current.get(fromUserId).close();
        peersRef.current.delete(fromUserId);
        const oldAudio = remoteAudiosRef.current.get(fromUserId);
        if (oldAudio) { oldAudio.srcObject = null; oldAudio.remove(); }
        remoteAudiosRef.current.delete(fromUserId);
      }

      const peer = createPeerFor(callId, fromUserId);
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit(WEBRTC_ANSWER, { callId, answer, toUserId: fromUserId });
      } catch (e) {
        console.error("Error handling offer:", e);
      }
    };

    const handleAnswer = async ({ answer, fromUserId }) => {
      const peer = peersRef.current.get(fromUserId);
      if (!peer) return;
      // Only accept answer if we're waiting for one (sent an offer)
      if (peer.signalingState !== "have-local-offer") return;
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (e) {
        console.error("Error setting remote description:", e);
      }
    };

    const handleIce = async ({ candidate, fromUserId }) => {
      const peer = peersRef.current.get(fromUserId);
      if (!peer) return;
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        // ICE candidate errors are non-fatal
      }
    };

    const handleParticipantsUpdate = ({ participants: parts }) => {
      if (parts) setParticipants(parts);
    };

    // Callee is offline or call setup failed
    const handleCallFailed = ({ reason }) => {
      console.warn("Call failed:", reason);
      setCallEndReason(reason || "failed");
      cleanupRef.current();
    };

    // Reconnection: server tells us we're still in a call after refresh
    const handleCallRejoin = async ({ callId, chatId, isGroup, participants: parts, groupName, toName, toAvatar, callStartedAt }) => {
      console.log("Rejoining call:", callId);
      callIdRef.current = callId;
      setCallInfo({ callId, chatId, isGroup, groupName: groupName || "Call", toName: toName || null, toAvatar: toAvatar || null, callStartedAt: callStartedAt || null });
      if (parts) setParticipants(parts);

      // Acquire mic
      try {
        if (!localStreamRef.current) {
          await acquireMicRef.current();
        }
      } catch (e) {
        console.error("Failed to acquire mic on rejoin:", e);
        setCallEndReason("Microphone unavailable");
        cleanupRef.current();
        return;
      }

      setCallState("active");
      // Server's CHECK_ACTIVE_CALL handler already notifies others via
      // CALL_USER_RECONNECTED — others will get shouldCreateOffer from
      // the CALL_ACCEPTED handler that the server triggers
      socket.emit(CALL_ACCEPTED, { callId });
    };

    // Other user temporarily disconnected (reconnecting)
    const handleUserDisconnected = ({ callId, userId }) => {
      // Close the stale peer — the connection is dead anyway
      if (peersRef.current.has(userId)) {
        peersRef.current.get(userId).close();
        peersRef.current.delete(userId);
        const audioEl = remoteAudiosRef.current.get(userId);
        if (audioEl) { audioEl.srcObject = null; audioEl.remove(); }
        remoteAudiosRef.current.delete(userId);
      }
    };

    // Other user reconnected — clean stale peer (server will trigger
    // new offer via CALL_ACCEPTED)
    const handleUserReconnected = ({ callId, userId, userName }) => {
      if (peersRef.current.has(userId)) {
        peersRef.current.get(userId).close();
        peersRef.current.delete(userId);
        const audioEl = remoteAudiosRef.current.get(userId);
        if (audioEl) { audioEl.srcObject = null; audioEl.remove(); }
        remoteAudiosRef.current.delete(userId);
      }
    };

    socket.on("CALL_ID", handleCallId);
    socket.on(CALL_INITIATED, handleIncoming);
    socket.on(CALL_ACCEPTED, handleAccepted);
    socket.on(CALL_REJECTED, handleRejected);
    socket.on(CALL_ENDED, handleEnded);
    socket.on(WEBRTC_OFFER, handleOffer);
    socket.on(WEBRTC_ANSWER, handleAnswer);
    socket.on(WEBRTC_ICE_CANDIDATE, handleIce);
    socket.on("CALL_PARTICIPANTS", handleParticipantsUpdate);
    socket.on("CALL_FAILED", handleCallFailed);
    socket.on("CALL_REJOIN", handleCallRejoin);
    socket.on("CALL_USER_DISCONNECTED", handleUserDisconnected);
    socket.on("CALL_USER_RECONNECTED", handleUserReconnected);

    // Ask server if we're in a call (handles page refresh / reconnect).
    // Only emit when socket is already connected — otherwise the
    // "connect" handler below will fire and emit it once.
    const emitCheckActiveCall = () => socket.emit("CHECK_ACTIVE_CALL");
    if (socket.connected) {
      emitCheckActiveCall();
    }
    socket.on("connect", emitCheckActiveCall);

    return () => {
      socket.off("CALL_ID", handleCallId);
      socket.off(CALL_INITIATED, handleIncoming);
      socket.off(CALL_ACCEPTED, handleAccepted);
      socket.off(CALL_REJECTED, handleRejected);
      socket.off(CALL_ENDED, handleEnded);
      socket.off(WEBRTC_OFFER, handleOffer);
      socket.off(WEBRTC_ANSWER, handleAnswer);
      socket.off(WEBRTC_ICE_CANDIDATE, handleIce);
      socket.off("CALL_PARTICIPANTS", handleParticipantsUpdate);
      socket.off("CALL_FAILED", handleCallFailed);
      socket.off("CALL_REJOIN", handleCallRejoin);
      socket.off("CALL_USER_DISCONNECTED", handleUserDisconnected);
      socket.off("CALL_USER_RECONNECTED", handleUserReconnected);
      socket.off("connect", emitCheckActiveCall);
    };
  }, [socket, createPeerFor]);

  return {
    callState,
    callInfo,
    participants,
    muted,
    toggleMute,
    speakerOn,
    toggleSpeaker,
    callEndReason,
    clearCallEndReason: () => setCallEndReason(null),
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    voiceEffect,
    changeVoiceEffect,
  };
};
