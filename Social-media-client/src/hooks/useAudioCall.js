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
  const [participants, setParticipants] = useState([]); // list of { userId, userName }
  const [muted, setMuted] = useState(false);

  // For group calls: one peer per remote participant  { odbc -> RTCPeerConnection }
  const peersRef = useRef(new Map());
  const localStreamRef = useRef(null);
  const remoteAudiosRef = useRef(new Map()); // odbc -> <audio> element (created dynamically)
  const callIdRef = useRef(null);

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
  }, []);

  // ── Create a peer connection to a specific remote user ──────────
  const createPeerFor = useCallback(
    (callId, remoteUserId) => {
      // Don't duplicate
      if (peersRef.current.has(remoteUserId)) return peersRef.current.get(remoteUserId);

      const peer = new RTCPeerConnection(ICE_SERVERS);

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
        // Create or reuse an audio element for this remote user
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

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => peer.addTrack(t, localStreamRef.current));
      }

      peersRef.current.set(remoteUserId, peer);
      return peer;
    },
    [socket]
  );

  // ── Acquire microphone ──────────────────────────────────────────
  const acquireMic = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    localStreamRef.current = stream;
    return stream;
  }, []);

  // ── Start call (works for 1-on-1 and group) ────────────────────
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
          toName: null, // will be populated for 1-on-1 via CALL_ID callback
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

  // ── Socket listeners ────────────────────────────────────────────
  useEffect(() => {
    // Server sends back callId to the caller
    const handleCallId = ({ callId, participants: parts }) => {
      callIdRef.current = callId;
      if (parts) setParticipants(parts);
      setCallInfo((prev) => (prev ? { ...prev, callId } : prev));
    };

    // Incoming call (receiver side)
    const handleIncoming = (data) => {
      if (callState !== "idle") {
        socket.emit(CALL_REJECTED, { callId: data.callId });
        return;
      }
      callIdRef.current = data.callId;
      setCallState("incoming");
      setCallInfo(data);
    };

    // Someone accepted — server tells us to create a peer connection with them
    const handleAccepted = async ({ callId, userId, shouldCreateOffer }) => {
      callIdRef.current = callId;

      if (shouldCreateOffer && userId) {
        // We need to initiate the WebRTC connection to this user
        const peer = createPeerFor(callId, userId);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit(WEBRTC_OFFER, { callId, offer, toUserId: userId });
      }

      setCallState("active");
      setCallInfo((prev) => (prev ? { ...prev, callId } : prev));
    };

    const handleRejected = ({ userId }) => {
      // If it's a group call and one person rejected, just remove them
      if (callInfo?.isGroup && userId) {
        setParticipants((prev) => prev.filter((p) => p.userId !== userId));
        return;
      }
      cleanup();
    };

    const handleEnded = ({ userId }) => {
      // If group call and one person left, just close their peer
      if (userId && peersRef.current.has(userId)) {
        peersRef.current.get(userId)?.close();
        peersRef.current.delete(userId);
        const audioEl = remoteAudiosRef.current.get(userId);
        if (audioEl) { audioEl.srcObject = null; audioEl.remove(); }
        remoteAudiosRef.current.delete(userId);
        setParticipants((prev) => prev.filter((p) => p.userId !== userId));
        // If no peers left, end call
        if (peersRef.current.size === 0) cleanup();
        return;
      }
      cleanup();
    };

    const handleOffer = async ({ callId, offer, fromUserId }) => {
      const peer = createPeerFor(callId, fromUserId);
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit(WEBRTC_ANSWER, { callId, answer, toUserId: fromUserId });
    };

    const handleAnswer = async ({ answer, fromUserId }) => {
      const peer = peersRef.current.get(fromUserId);
      if (!peer) return;
      await peer.setRemoteDescription(new RTCSessionDescription(answer));
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

    // Participant list update (for group calls)
    const handleParticipantsUpdate = ({ participants: parts }) => {
      if (parts) setParticipants(parts);
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
    };
  }, [socket, createPeerFor, cleanup, callState, callInfo?.isGroup]);

  return {
    callState,
    callInfo,
    participants,
    muted,
    toggleMute,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  };
};
