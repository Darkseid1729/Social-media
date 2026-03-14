import { useCallback, useEffect, useRef, useState } from "react";
import { getSocket } from "../socket";
import {
  WATCH_PARTY_CREATE,
  WATCH_PARTY_JOIN,
  WATCH_PARTY_CONTROL,
  WATCH_PARTY_STATE_REQUEST,
  WATCH_PARTY_STATE_UPDATE,
  WATCH_PARTY_END,
  WATCH_PARTY_ENDED,
  WATCH_PARTY_ERROR,
} from "../constants/events";

export const useWatchParty = (chatId) => {
  const socket = getSocket();
  const [partyState, setPartyState] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const myActionRef = useRef(null);

  const createParty = useCallback(
    ({ videoId }) => {
      if (!chatId || !videoId) return;
      socket.emit(WATCH_PARTY_CREATE, { chatId, videoId });
    },
    [socket, chatId]
  );

  const endParty = useCallback(() => {
    if (!chatId) return;
    socket.emit(WATCH_PARTY_END, { chatId });
  }, [socket, chatId]);

  const joinParty = useCallback(() => {
    if (!chatId) return;
    socket.emit(WATCH_PARTY_JOIN, { chatId });
    socket.emit(WATCH_PARTY_STATE_REQUEST, { chatId });
  }, [socket, chatId]);

  const sendControl = useCallback(
    ({ action, currentTime, playbackRate, videoId }) => {
      if (!chatId || !action) return;
      const actionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      myActionRef.current = actionId;
      socket.emit(WATCH_PARTY_CONTROL, {
        chatId,
        action,
        currentTime,
        playbackRate,
        videoId,
        clientActionId: actionId,
      });
    },
    [socket, chatId]
  );

  useEffect(() => {
    if (!chatId) {
      setPartyState(null);
      setIsDialogOpen(false);
      return;
    }

    const handleStateUpdate = ({ chatId: incomingChatId, state }) => {
      if (incomingChatId !== chatId || !state) return;
      setPartyState(state);
      setIsDialogOpen(true);
    };

    const handleEnded = ({ chatId: incomingChatId }) => {
      if (incomingChatId !== chatId) return;
      setPartyState(null);
      setIsDialogOpen(false);
    };

    const handleError = ({ chatId: incomingChatId, message }) => {
      if (incomingChatId && incomingChatId !== chatId) return;
      setErrorMessage(message || "Watch party error");
    };

    const handleConnect = () => {
      joinParty();
    };

    socket.on(WATCH_PARTY_STATE_UPDATE, handleStateUpdate);
    socket.on(WATCH_PARTY_ENDED, handleEnded);
    socket.on(WATCH_PARTY_ERROR, handleError);
    socket.on("connect", handleConnect);

    // Re-sync whenever chat changes or after reconnect.
    joinParty();

    return () => {
      socket.off(WATCH_PARTY_STATE_UPDATE, handleStateUpdate);
      socket.off(WATCH_PARTY_ENDED, handleEnded);
      socket.off(WATCH_PARTY_ERROR, handleError);
      socket.off("connect", handleConnect);
    };
  }, [socket, chatId, joinParty]);

  return {
    partyState,
    isDialogOpen,
    setIsDialogOpen,
    errorMessage,
    clearError: () => setErrorMessage(""),
    createParty,
    joinParty,
    endParty,
    sendControl,
  };
};
