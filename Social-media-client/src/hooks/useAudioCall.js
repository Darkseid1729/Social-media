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

export const useAudioCall = () => {
  const socket = getSocket();
  const [callState, setCallState] = useState("idle");
  const [callInfo, setCallInfo] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
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

  // Prefetch ICE / TURN credentials as early as possible
  useEffect(() => {
    loadIceServers().then((servers) => { iceServersRef.current = servers; });
  }, []);

  // ── Mute toggle ─────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  }, []);

  // ── Speaker / earpiece toggle ────────────────────────────────────
  const toggleSpeaker = useCallback(() => {
    setSpeakerOn((prev) => {
      const next = !prev;
      // setSinkId: 'default' = speaker, 'communications' = earpiece
      const sinkId = next ? "default" : "communications";
      remoteAudiosRef.current.forEach((audioEl) => {
        if (typeof audioEl.setSinkId === "function") {
          audioEl.setSinkId(sinkId).catch(() => {});
        }
      });
      return next;
    });
  }, []);

  // ── Cleanup ─────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
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
        }
        audioEl.srcObject = e.streams[0];
      };

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => peer.addTrack(t, localStreamRef.current));
      }

      peersRef.current.set(remoteUserId, peer);
      return peer;
    },
    [socket]
  );

  // ── Acquire microphone + ensure ICE servers are loaded ─────────
  const acquireMic = useCallback(async () => {
    // Run both in parallel — by the time mic is granted and call starts,
    // TURN creds will be fetched and iceServersRef will be populated.
    const [stream, servers] = await Promise.all([
      localStreamRef.current
        ? Promise.resolve(localStreamRef.current)
        : navigator.mediaDevices.getUserMedia({ audio: true, video: false }),
      loadIceServers(),
    ]);
    localStreamRef.current = stream;
    iceServersRef.current = servers;
    return stream;
  }, []);

  // ── Start call ──────────────────────────────────────────────────
  const startCall = useCallback(
    async ({ chatId, to, members, isGroup, groupName }) => {
      try {
        await acquireMic();
        socket.emit(CALL_INITIATED, {
          chatId,
          to: isGroup ? undefined : to,
          members: isGroup ? members : undefined,
          isGroup: !!isGroup,
        });
        setCallState("calling");
        setCallInfo({
          chatId,
          to,
          isGroup: !!isGroup,
          groupName: groupName || "Group Call",
          toName: null,
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

      // Ensure mic is available (caller already has it, safety net for edge cases)
      if (!localStreamRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          localStreamRef.current = stream;
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
          socket.emit(WEBRTC_OFFER, { callId, offer, toUserId: userId });
        } catch (e) {
          console.error("Error creating offer:", e);
        }
      }

      setCallState("active");
      setCallInfo((prev) => (prev ? { ...prev, callId } : prev));
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
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          localStreamRef.current = stream;
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
    const handleCallRejoin = async ({ callId, chatId, isGroup, participants: parts }) => {
      console.log("Rejoining call:", callId);
      callIdRef.current = callId;
      setCallInfo({ callId, chatId, isGroup, groupName: "Call" });
      if (parts) setParticipants(parts);

      // Acquire mic
      try {
        if (!localStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          localStreamRef.current = stream;
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
  };
};
