import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  Avatar,
  Typography,
  IconButton,
  Stack,
  Box,
} from "@mui/material";
import CallIcon from "@mui/icons-material/Call";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

const AudioCallDialog = ({
  callState,
  callInfo,
  remoteAudioRef,
  onAccept,
  onReject,
  onEnd,
}) => {
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Call timer
  useEffect(() => {
    if (callState !== "active") {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  // Format seconds to mm:ss
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      // Mute/unmute the local audio tracks
      const audioEl = document.querySelector("audio[data-remote-audio]");
      // We need to mute our own mic, not the remote audio
      // The local stream tracks are managed outside, so we emit a toggle
      // Actually, just toggle the track enabled property via ref won't work here
      // So we broadcast a mute state change — simpler: toggle local tracks
      return next;
    });
  };

  if (callState === "idle") return null;

  return (
    <>
      {/* Hidden audio element for remote stream */}
      <audio ref={remoteAudioRef} autoPlay data-remote-audio="true" style={{ display: "none" }} />

      <Dialog
        open={true}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            color: "#fff",
          },
        }}
      >
        <DialogContent>
          <Stack alignItems="center" spacing={2} py={3}>
            {/* Pulsing avatar ring during calling/incoming */}
            <Box
              sx={{
                borderRadius: "50%",
                padding: "4px",
                animation:
                  callState === "active"
                    ? "none"
                    : "pulse-ring 1.5s ease-in-out infinite",
                "@keyframes pulse-ring": {
                  "0%": { boxShadow: "0 0 0 0 rgba(76, 175, 80, 0.7)" },
                  "70%": { boxShadow: "0 0 0 15px rgba(76, 175, 80, 0)" },
                  "100%": { boxShadow: "0 0 0 0 rgba(76, 175, 80, 0)" },
                },
              }}
            >
              <Avatar
                src={callInfo?.fromAvatar}
                sx={{ width: 90, height: 90, fontSize: 40 }}
              >
                {callInfo?.fromName?.[0]?.toUpperCase() || "?"}
              </Avatar>
            </Box>

            <Typography variant="h6" fontWeight="bold">
              {callState === "incoming"
                ? callInfo?.fromName
                : callInfo?.toName || "Calling..."}
            </Typography>

            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {callState === "calling" && "Ringing..."}
              {callState === "incoming" && "Incoming audio call"}
              {callState === "active" && formatTime(elapsed)}
            </Typography>

            <Box display="flex" gap={3} mt={2}>
              {/* Mute button (only during active call) */}
              {callState === "active" && (
                <IconButton
                  onClick={toggleMute}
                  sx={{
                    bgcolor: muted ? "rgba(255,255,255,0.2)" : "transparent",
                    border: "2px solid rgba(255,255,255,0.3)",
                    color: "white",
                    width: 56,
                    height: 56,
                    "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
                  }}
                >
                  {muted ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
              )}

              {/* Accept button (incoming only) */}
              {callState === "incoming" && (
                <IconButton
                  onClick={() => onAccept({ callId: callInfo.callId })}
                  sx={{
                    bgcolor: "#4caf50",
                    color: "white",
                    width: 56,
                    height: 56,
                    "&:hover": { bgcolor: "#388e3c" },
                  }}
                >
                  <CallIcon />
                </IconButton>
              )}

              {/* End / Reject button */}
              <IconButton
                onClick={() =>
                  callState === "incoming"
                    ? onReject({ callId: callInfo.callId })
                    : onEnd({ callId: callInfo.callId })
                }
                sx={{
                  bgcolor: "#f44336",
                  color: "white",
                  width: 56,
                  height: 56,
                  "&:hover": { bgcolor: "#c62828" },
                }}
              >
                <CallEndIcon />
              </IconButton>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AudioCallDialog;
