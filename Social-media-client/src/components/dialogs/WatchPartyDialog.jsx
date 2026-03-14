import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Slider,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";

const formatTime = (seconds = 0) => {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return `${m}:${String(r).padStart(2, "0")}`;
};

const getLiveTarget = (state) => {
  if (!state) return 0;
  if (!state.isPlaying) return Math.max(0, state.position || 0);
  const delta = Math.max(0, (Date.now() - (state.updatedAt || Date.now())) / 1000);
  return Math.max(0, (state.position || 0) + delta * (state.playbackRate || 1));
};

const ensureYouTubeApi = () => {
  if (window.YT?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve();
    };
    const readyCheck = setInterval(() => {
      if (window.YT?.Player) { clearInterval(readyCheck); resolve(); }
    }, 200);
  });
};

const fmtContent = (content = "") => {
  if (!content) return "";
  if (content.startsWith("__GIFT_CARD__:")) return "Gift Card";
  if (/\.(gif|webp|png|jpg)(\?|$)/i.test(content) && content.startsWith("http")) return "Image";
  if (content.includes("youtube.com/watch") || content.includes("youtu.be/")) return "YouTube video";
  return content;
};

const WatchPartyDialog = ({
  open,
  onClose,
  partyState,
  isHost,
  onPlay,
  onPause,
  onSeek,
  onEnd,
  chatMessages = [],
  onSendMessage,
  currentUserId,
}) => {
  const { theme } = useTheme();
  const isLandscape = useMediaQuery("(orientation: landscape) and (max-height: 560px)");
  const isDesktop = useMediaQuery("(min-width: 960px)");
  const isSplitLayout = isLandscape || isDesktop;

  const playerContainerRef = useRef(null);
  const playerRef = useRef(null);
  const syncTimerRef = useRef(null);
  const suppressEmitRef = useRef(false);
  const chatEndRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const playerElementId = useMemo(
    () => `watch-party-player-${Math.random().toString(36).slice(2)}`,
    []
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (!open && playerRef.current) {
      try {
        playerRef.current.destroy?.();
      } catch {
        // noop
      }
      playerRef.current = null;
      setPlayerReady(false);
      setProgress(0);
      setDuration(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !partyState?.videoId) return;
    let cancelled = false;
    const setupPlayer = async () => {
      await ensureYouTubeApi();
      if (cancelled || !playerContainerRef.current) return;
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player(playerElementId, {
          width: "100%",
          height: "100%",
          videoId: partyState.videoId,
          playerVars: { autoplay: 1, controls: 1, rel: 0, modestbranding: 1, playsinline: 1, enablejsapi: 1 },
          events: {
            onReady: (event) => { setPlayerReady(true); setDuration(event.target.getDuration() || 0); },
            onStateChange: () => { if (playerRef.current) setDuration(playerRef.current.getDuration?.() || 0); },
          },
        });
      } else if (playerReady && playerRef.current.getVideoData?.().video_id !== partyState.videoId) {
        suppressEmitRef.current = true;
        playerRef.current.loadVideoById(partyState.videoId, 0);
        setTimeout(() => { suppressEmitRef.current = false; }, 300);
      }
    };
    setupPlayer();
    return () => { cancelled = true; };
  }, [open, partyState?.videoId, playerElementId, playerReady]);

  useEffect(() => {
    if (!open || !playerRef.current || !partyState) return;
    const syncNow = () => {
      const p = playerRef.current;
      if (!p || !p.getCurrentTime) return;
      const iframe = p.getIframe?.();
      if (!iframe || !iframe.isConnected) return;

      const target = getLiveTarget(partyState);
      const current = p.getCurrentTime() || 0;
      if (Math.abs(target - current) > 1.0) {
        suppressEmitRef.current = true;
        p.seekTo(target, true);
        setTimeout(() => { suppressEmitRef.current = false; }, 200);
      }
      const ytState = p.getPlayerState?.();
      const playing = ytState === window.YT?.PlayerState?.PLAYING;
      if (partyState.isPlaying && !playing) {
        suppressEmitRef.current = true; p.playVideo?.();
        setTimeout(() => { suppressEmitRef.current = false; }, 200);
      }
      if (!partyState.isPlaying && playing) {
        suppressEmitRef.current = true; p.pauseVideo?.();
        setTimeout(() => { suppressEmitRef.current = false; }, 200);
      }
      const rate = p.getPlaybackRate?.();
      if (partyState.playbackRate && rate && Math.abs(rate - partyState.playbackRate) > 0.01)
        p.setPlaybackRate?.(partyState.playbackRate);
      setProgress(p.getCurrentTime?.() || 0);
      setDuration(p.getDuration?.() || 0);
    };
    syncNow();
    clearInterval(syncTimerRef.current);
    syncTimerRef.current = setInterval(syncNow, 1000);
    return () => { clearInterval(syncTimerRef.current); };
  }, [open, partyState]);

  useEffect(() => () => clearInterval(syncTimerRef.current), []);

  const handleTogglePlay = () => {
    if (!playerRef.current || suppressEmitRef.current) return;
    const current = playerRef.current.getCurrentTime?.() || 0;
    if (partyState?.isPlaying) { onPause?.(current); } else { onPlay?.(current); }
  };

  const handleSeekCommit = (_, value) => {
    const next = Array.isArray(value) ? value[0] : value;
    setProgress(next);
    onSeek?.(next);
  };

  const handleSendChat = useCallback((e) => {
    e?.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    onSendMessage?.(trimmed);
    setChatInput("");
  }, [chatInput, onSendMessage]);

  const recentMessages = useMemo(
    () => chatMessages.filter((m) => m?.content && m?.sender).slice(-50),
    [chatMessages]
  );

  const ControlsStrip = (
    <Box sx={{ px: 1.5, pt: 0.25, pb: isLandscape ? 0.5 : 1, flexShrink: 0 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.25 }}>
        <Typography variant="caption" sx={{ fontSize: "0.7rem", opacity: 0.7 }}>{formatTime(progress)}</Typography>
        <Typography variant="caption" sx={{ fontSize: "0.7rem", opacity: 0.7 }}>{formatTime(duration)}</Typography>
      </Stack>
      <Slider
        min={0}
        max={Math.max(duration || 0, 1)}
        value={Math.min(progress, Math.max(duration || 0, 1))}
        onChange={(_, v) => setProgress(Array.isArray(v) ? v[0] : v)}
        onChangeCommitted={handleSeekCommit}
        disabled={!playerReady}
        size="small"
        sx={{ py: 0.5, display: "block" }}
      />
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
        <IconButton
          onClick={handleTogglePlay}
          disabled={!playerReady}
          size="small"
          sx={{
            bgcolor: "primary.main",
            color: "#fff",
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
          }}
        >
          {partyState?.isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
        </IconButton>
        <Typography variant="caption" sx={{ opacity: 0.65, fontSize: "0.72rem" }}>
          {isHost ? "Host" : "Shared controls"}
        </Typography>
        {isHost && (
          <Button
            color="error"
            size="small"
            onClick={onEnd}
            sx={{ ml: "auto !important", py: 0, minWidth: 0, fontSize: "0.72rem" }}
          >
            End Party
          </Button>
        )}
      </Stack>
    </Box>
  );

  const ChatPanel = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
        borderTop: isSplitLayout ? "none" : "1px solid rgba(128,128,128,0.15)",
        borderLeft: isSplitLayout ? "1px solid rgba(128,128,128,0.15)" : "none",
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ px: 1.5, py: 0.6, flexShrink: 0 }}>
        <ChatIcon sx={{ fontSize: 14, mr: 0.5, opacity: 0.6 }} />
        <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.8 }}>Live Chat</Typography>
      </Stack>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 1.25,
          pb: 0.5,
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          "&::-webkit-scrollbar": { width: 3 },
          "&::-webkit-scrollbar-thumb": { background: "rgba(128,128,128,0.3)", borderRadius: 2 },
        }}
      >
        {recentMessages.length === 0 && (
          <Typography variant="caption" sx={{ opacity: 0.45, textAlign: "center", mt: 2 }}>
            No messages yet
          </Typography>
        )}
        {recentMessages.map((msg) => {
          const isOwn = msg.sender?._id === currentUserId;
          const content = fmtContent(msg.content);
          return (
            <Box key={msg._id} sx={{ maxWidth: "88%", alignSelf: isOwn ? "flex-end" : "flex-start" }}>
              {!isOwn && (
                <Typography
                  variant="caption"
                  sx={{ display: "block", mb: 0.2, fontSize: "0.6rem", opacity: 0.6 }}
                >
                  {msg.sender?.name}
                </Typography>
              )}
              <Box
                sx={{
                  bgcolor: isOwn ? (theme?.PRIMARY_COLOR || "primary.main") : "rgba(128,128,128,0.15)",
                  borderRadius: isOwn ? "10px 10px 3px 10px" : "10px 10px 10px 3px",
                  px: 1.25,
                  py: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    wordBreak: "break-word",
                    fontSize: isLandscape ? "0.7rem" : "0.77rem",
                    lineHeight: isLandscape ? 1.2 : 1.3,
                    color: isOwn ? "#fff" : "text.primary",
                  }}
                >
                  {content}
                </Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={chatEndRef} />
      </Box>

      {onSendMessage && (
        <Box
          component="form"
          onSubmit={handleSendChat}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.25,
            py: 0.75,
            flexShrink: 0,
            borderTop: "1px solid rgba(128,128,128,0.12)",
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } }}
            sx={{ "& .MuiInputBase-root": { borderRadius: "18px", fontSize: "0.8rem" } }}
            inputProps={{ maxLength: 500 }}
          />
          <IconButton type="submit" size="small" disabled={!chatInput.trim()} sx={{ color: "primary.main" }}>
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen={isLandscape}
      sx={{ "& .MuiDialog-container": { alignItems: "flex-start" } }}
      PaperProps={{
        sx: {
          m: 0,
          borderRadius: isLandscape ? 0 : "0 0 12px 12px",
          width: "100%",
          maxWidth: isLandscape ? "100vw" : { xs: "100vw", sm: "min(900px, 96vw)" },
          maxHeight: isLandscape ? "100dvh" : "85dvh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Title bar */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{ px: 2, py: 0.75, borderBottom: "1px solid rgba(128,128,128,0.15)", flexShrink: 0 }}
      >
        <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1 }}>
          Watch Party
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Body */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: isSplitLayout ? "row" : "column",
          overflow: "hidden",
        }}
      >
        {/* Video + controls column */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: isSplitLayout ? "0 0 74%" : "0 0 auto",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <Box
            sx={
              isSplitLayout
                ? { flex: "1 1 auto", minHeight: 0, bgcolor: "#000", overflow: "hidden" }
                : { width: "100%", aspectRatio: "16/9", bgcolor: "#000", overflow: "hidden", flexShrink: 0 }
            }
          >
            <Box ref={playerContainerRef} id={playerElementId} sx={{ width: "100%", height: "100%" }} />
          </Box>
          {ControlsStrip}
        </Box>

        {/* Chat column */}
        <Box
          sx={{
            flex: isSplitLayout ? "1 1 26%" : "1 1 auto",
            display: "flex",
            flexDirection: "column",
            minHeight: isSplitLayout ? 0 : 150,
            maxHeight: isSplitLayout ? "none" : 280,
            maxWidth: isSplitLayout ? 320 : "none",
            overflow: "hidden",
          }}
        >
          {ChatPanel}
        </Box>
      </Box>
    </Dialog>
  );
};

export default WatchPartyDialog;
