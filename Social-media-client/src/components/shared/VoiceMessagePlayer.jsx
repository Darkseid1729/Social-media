import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Mic as MicIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";

const WAVEFORM_BARS = 40;

const VoiceMessagePlayer = ({ url }) => {
  const { theme } = useTheme();
  const audioRef = useRef(null);
  const animFrameRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformData, setWaveformData] = useState([]);

  // Generate pseudo-waveform from audio data
  useEffect(() => {
    const generateWaveform = async () => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Fix for Infinity duration in webm files
        if (audioBuffer.duration && Number.isFinite(audioBuffer.duration)) {
          setDuration(audioBuffer.duration);
        }
        
        const rawData = audioBuffer.getChannelData(0);
        const samplesPerBar = Math.floor(rawData.length / WAVEFORM_BARS);
        const bars = [];
        for (let i = 0; i < WAVEFORM_BARS; i++) {
          let sum = 0;
          for (let j = 0; j < samplesPerBar; j++) {
            sum += Math.abs(rawData[i * samplesPerBar + j]);
          }
          bars.push(sum / samplesPerBar);
        }
        // Normalize to 0-1
        const max = Math.max(...bars, 0.01);
        setWaveformData(bars.map((v) => v / max));
        audioContext.close();
      } catch {
        // Fallback: generate random-ish waveform
        const fallback = [];
        for (let i = 0; i < WAVEFORM_BARS; i++) {
          fallback.push(0.2 + Math.random() * 0.8);
        }
        setWaveformData(fallback);
      }
    };
    generateWaveform();
  }, [url]);

  // Track playing progress via requestAnimationFrame for smoothness
  const tickProgress = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
    animFrameRef.current = requestAnimationFrame(tickProgress);
  }, []);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      cancelAnimationFrame(animFrameRef.current);
    } else {
      audio.play();
      animFrameRef.current = requestAnimationFrame(tickProgress);
    }
    setIsPlaying(!isPlaying);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const d = audioRef.current.duration;
      if (d && d !== Infinity && !isNaN(d)) {
        setDuration(d);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    cancelAnimationFrame(animFrameRef.current);
  };

  // Seek by clicking on the waveform
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    if (audioRef.current && duration) {
      audioRef.current.currentTime = pct * duration;
      setCurrentTime(pct * duration);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const progressPct = duration > 0 && duration !== Infinity ? (currentTime / duration) * 100 : 0;
  const playedBars = Math.floor((progressPct / 100) * WAVEFORM_BARS);

  const formatTime = (t) => {
    if (!t || isNaN(t)) return "0:00";
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minWidth: { xs: 200, sm: 280 },
        maxWidth: { xs: 260, sm: 340 },
        py: 0.5,
      }}
    >
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Play/Pause Button */}
      <IconButton
        onClick={handlePlayPause}
        sx={{
          bgcolor: theme.PRIMARY_COLOR || "#25D366",
          color: "#fff",
          width: 36,
          height: 36,
          flexShrink: 0,
          "&:hover": { bgcolor: theme.BUTTON_ACCENT || "#128C7E" },
          transition: "all 0.2s",
        }}
      >
        {isPlaying ? (
          <PauseIcon sx={{ fontSize: 20 }} />
        ) : (
          <PlayIcon sx={{ fontSize: 20 }} />
        )}
      </IconButton>

      {/* Waveform + Duration */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.3 }}>
        {/* Waveform Bars */}
        <Box
          onClick={handleSeek}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            height: 28,
            cursor: "pointer",
            position: "relative",
          }}
        >
          {waveformData.map((h, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                height: `${Math.max(h * 100, 12)}%`,
                minHeight: 3,
                borderRadius: 4,
                bgcolor:
                  i < playedBars
                    ? theme.PRIMARY_COLOR || "#25D366"
                    : (theme.SUBTLE_BG_30 || "rgba(255,255,255,0.3)"),
                transition: "background-color 0.15s",
              }}
            />
          ))}
        </Box>

        {/* Time */}
        <Box sx={{ display: "flex", justifyContent: "space-between", px: 0.2 }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.68rem",
              color: theme.TEXT_SECONDARY || "rgba(255,255,255,0.6)",
              lineHeight: 1,
            }}
          >
            {formatTime(isPlaying || currentTime > 0 ? currentTime : duration)}
          </Typography>
          {duration > 0 && duration !== Infinity && (currentTime > 0 || isPlaying) && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.68rem",
                color: theme.TEXT_SECONDARY || "rgba(255,255,255,0.6)",
                lineHeight: 1,
              }}
            >
              -{formatTime(duration - currentTime)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Mic icon badge */}
      <MicIcon
        sx={{
          fontSize: 16,
          color: theme.PRIMARY_COLOR || "#25D366",
          flexShrink: 0,
          opacity: 0.7,
        }}
      />
    </Box>
  );
};

export default memo(VoiceMessagePlayer);
