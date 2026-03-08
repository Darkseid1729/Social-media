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

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useAudioCall = () => {
  const socket = getSocket();
  // "idle" | "calling" | "incoming" | "active"
  const [callState, setCallState] = useState("idle");
  const [callInfo, setCallInfo] = useState(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const callIdRef = useRef(null);

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    peerRef.current?.close();
    peerRef.current = null;
    callIdRef.current = null;
    setCallState("idle");
    setCallInfo(null);
  }, []);

  const createPeer = useCallback(
    (callId) => {
      const peer = new RTCPeerConnection(ICE_SERVERS);

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit(WEBRTC_ICE_CANDIDATE, { callId, candidate: e.candidate });
        }
      };

      peer.ontrack = (e) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = e.streams[0];
        }
      };

      peerRef.current = peer;
      return peer;
    },
    [socket]
  );

  // ── Outgoing call ──────────────────────────────────────────────
  const startCall = useCallback(
    async ({ chatId, to }) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        localStreamRef.current = stream;
        socket.emit(CALL_INITIATED, { chatId, to });
        setCallState("calling");
        setCallInfo({ to, chatId });
      } catch (err) {
        console.error("Microphone access denied:", err);
      }
    },
    [socket]
  );

  // ── Accept incoming call ────────────────────────────────────────
  const acceptCall = useCallback(
    async ({ callId }) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        localStreamRef.current = stream;
        callIdRef.current = callId;

        const peer = createPeer(callId);
        stream.getTracks().forEach((t) => peer.addTrack(t, stream));

        socket.emit(CALL_ACCEPTED, { callId });
        setCallState("active");
      } catch (err) {
        console.error("Microphone access denied:", err);
      }
    },
    [createPeer, socket]
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

  // ── Socket listeners ────────────────────────────────────────────
  useEffect(() => {
    // Server sends back callId to the caller
    const handleCallId = ({ callId }) => {
      callIdRef.current = callId;
      setCallInfo((prev) => (prev ? { ...prev, callId } : prev));
    };

    const handleIncoming = (data) => {
      // If already in a call, auto-reject
      if (callState !== "idle") {
        socket.emit(CALL_REJECTED, { callId: data.callId });
        return;
      }
      callIdRef.current = data.callId;
      setCallState("incoming");
      setCallInfo(data);
    };

    const handleAccepted = async ({ callId }) => {
      // Caller side: create peer and send offer
      const stream = localStreamRef.current;
      if (!stream) return;
      const peer = createPeer(callId);
      stream.getTracks().forEach((t) => peer.addTrack(t, stream));

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      socket.emit(WEBRTC_OFFER, { callId, offer });
      callIdRef.current = callId;
      setCallState("active");
      setCallInfo((prev) => (prev ? { ...prev, callId } : prev));
    };

    const handleRejected = () => cleanup();
    const handleEnded = () => cleanup();

    const handleOffer = async ({ callId, offer }) => {
      const peer = peerRef.current;
      if (!peer) return;
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit(WEBRTC_ANSWER, { callId, answer });
    };

    const handleAnswer = async ({ answer }) => {
      const peer = peerRef.current;
      if (!peer) return;
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
    };

    const handleIce = async ({ candidate }) => {
      const peer = peerRef.current;
      if (!peer) return;
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        // ICE candidate errors are non-fatal
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

    return () => {
      socket.off("CALL_ID", handleCallId);
      socket.off(CALL_INITIATED, handleIncoming);
      socket.off(CALL_ACCEPTED, handleAccepted);
      socket.off(CALL_REJECTED, handleRejected);
      socket.off(CALL_ENDED, handleEnded);
      socket.off(WEBRTC_OFFER, handleOffer);
      socket.off(WEBRTC_ANSWER, handleAnswer);
      socket.off(WEBRTC_ICE_CANDIDATE, handleIce);
    };
  }, [socket, createPeer, cleanup, callState]);

  return {
    callState,
    callInfo,
    remoteAudioRef,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  };
};
