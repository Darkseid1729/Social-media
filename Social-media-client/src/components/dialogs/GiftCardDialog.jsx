import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import { Close as CloseIcon, CardGiftcard as GiftIcon } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

const THEMES = [
  { id: "gold",   bg: "linear-gradient(135deg,#f7c948 0%,#f0a500 100%)",  text: "#5a3a00" },
  { id: "rose",   bg: "linear-gradient(135deg,#ff6b9d 0%,#c83b6e 100%)", text: "#fff" },
  { id: "ocean",  bg: "linear-gradient(135deg,#43b0f1 0%,#1565c0 100%)", text: "#fff" },
  { id: "forest", bg: "linear-gradient(135deg,#56ab2f 0%,#1b6a2a 100%)", text: "#fff" },
  { id: "sunset", bg: "linear-gradient(135deg,#ff6e40 0%,#c62828 100%)", text: "#fff" },
  { id: "violet", bg: "linear-gradient(135deg,#a855f7 0%,#6b21a8 100%)", text: "#fff" },
];

// Curated emojis that have full-screen animations in ComboAnimationLayer
const ANIMATION_OPTIONS = [
  // ── Love & Romance ──
  { emoji: "🎉", label: "Party" },
  { emoji: "🎊", label: "Confetti" },
  { emoji: "❤️", label: "Heart" },
  { emoji: "💝", label: "Gift Heart" },
  { emoji: "🥰", label: "In Love" },
  { emoji: "💌", label: "Love Letter" },
  { emoji: "💕", label: "Two Hearts" },
  { emoji: "💖", label: "Sparkle Heart" },
  { emoji: "💗", label: "Growing Heart" },
  { emoji: "💓", label: "Heartbeat" },
  { emoji: "💞", label: "Revolving Hearts" },
  { emoji: "💘", label: "Heart with Arrow" },
  { emoji: "😍", label: "Heart Eyes" },
  { emoji: "😘", label: "Blow Kiss" },
  { emoji: "🫶", label: "Heart Hands" },
  // ── Celebration ──
  { emoji: "✨", label: "Sparkles" },
  { emoji: "⭐", label: "Star" },
  { emoji: "💫", label: "Dizzy Star" },
  { emoji: "🌟", label: "Glowing Star" },
  { emoji: "🎈", label: "Balloon" },
  { emoji: "🎂", label: "Birthday" },
  { emoji: "🏆", label: "Trophy" },
  { emoji: "👑", label: "Crown" },
  { emoji: "🎁", label: "Gift" },
  // ── Fun & Vibes ──
  { emoji: "🔥", label: "Fire" },
  { emoji: "🤩", label: "Star-Struck" },
  { emoji: "😊", label: "Smiling" },
  { emoji: "🤗", label: "Hug" },
  { emoji: "😂", label: "Laughing" },
  { emoji: "🥳", label: "Party Face" },
  { emoji: "💯", label: "100%" },
  { emoji: "👏", label: "Clapping" },
  { emoji: "🙌", label: "Raise Hands" },
  { emoji: "💪", label: "Strong" },
  { emoji: "🌸", label: "Cherry Blossom" },
  { emoji: "🌈", label: "Rainbow" },
  { emoji: "🦋", label: "Butterfly" },
  { emoji: "💎", label: "Diamond" },
  { emoji: "🙇", label: "I'm Sorry" },
];

const CARD_EMOJIS = ["🎁", "🎂", "🎉", "💝", "🌹", "⭐", "🏆", "❤️", "🥳", "🎊"];

const GiftCardDialog = ({ open, onClose, onSend, senderName }) => {
  const { theme } = useTheme();
  const [message,   setMessage]   = useState("");
  const [animation, setAnimation] = useState("🎉");
  const [cardTheme, setCardTheme] = useState("gold");
  const [emoji,     setEmoji]     = useState("🎁");

  const handleSend = () => {
    if (!message.trim()) {
      toast.error("Please write a message for your gift");
      return;
    }
    onSend({ message: message.trim(), animation, theme: cardTheme, emoji, from: senderName || "Someone" });
    setMessage(""); setAnimation("🎉"); setCardTheme("gold"); setEmoji("🎁");
    onClose();
  };

  const selectedThemeObj = THEMES.find(t => t.id === cardTheme) || THEMES[0];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { background: theme.LIGHT_BG, color: theme.TEXT_PRIMARY, borderRadius: 3 } }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <GiftIcon sx={{ color: "#f7c948" }} />
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>Send a Gift Message</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon sx={{ color: theme.TEXT_SECONDARY }} />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: theme.SUBTLE_BG_20 }} />

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2.5 }}>

        {/* Message */}
        <TextField
          label="Your message *"
          multiline
          rows={3}
          value={message}
          onChange={e => setMessage(e.target.value)}
          fullWidth
          placeholder="Write something special…"
          inputProps={{ maxLength: 160 }}
          InputLabelProps={{ style: { color: theme.TEXT_SECONDARY } }}
          InputProps={{ style: { color: theme.TEXT_PRIMARY } }}
          sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.SUBTLE_BG_20 } }}
        />

        {/* Reveal Animation */}
        <Box>
          <Typography variant="caption" sx={{ color: theme.TEXT_SECONDARY, mb: 1, display: "block" }}>
            Reveal Animation (plays when opened)
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {ANIMATION_OPTIONS.map(anim => (
              <Box
                key={anim.emoji}
                onClick={() => setAnimation(anim.emoji)}
                title={anim.label}
                sx={{
                  fontSize: 24,
                  cursor: "pointer",
                  p: 0.6,
                  borderRadius: 1.5,
                  background: animation === anim.emoji ? "rgba(247,201,72,0.18)" : "rgba(255,255,255,0.04)",
                  border: animation === anim.emoji ? "1.5px solid #f7c948" : `1.5px solid ${theme.SUBTLE_BG_20}`,
                  transform: animation === anim.emoji ? "scale(1.2)" : "scale(1)",
                  transition: "all 0.15s",
                  lineHeight: 1.4,
                }}
              >
                {anim.emoji}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Card Theme */}
        <Box>
          <Typography variant="caption" sx={{ color: theme.TEXT_SECONDARY, mb: 1, display: "block" }}>Card Theme</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {THEMES.map(t => (
              <Box
                key={t.id}
                onClick={() => setCardTheme(t.id)}
                sx={{
                  width: 48, height: 32, borderRadius: 1.5, background: t.bg, cursor: "pointer",
                  border: cardTheme === t.id ? "2.5px solid #fff" : "2.5px solid transparent",
                  boxShadow: cardTheme === t.id ? "0 0 0 2px #f7c948" : "none",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Card Icon */}
        <Box>
          <Typography variant="caption" sx={{ color: theme.TEXT_SECONDARY, mb: 1, display: "block" }}>Card Icon</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {CARD_EMOJIS.map(em => (
              <Box
                key={em}
                onClick={() => setEmoji(em)}
                sx={{
                  fontSize: 22, cursor: "pointer", p: 0.5, borderRadius: 1.5, lineHeight: 1.4,
                  background: emoji === em ? "rgba(247,201,72,0.18)" : "transparent",
                  border: emoji === em ? "1.5px solid #f7c948" : "1.5px solid transparent",
                  transition: "all 0.15s",
                }}
              >{em}</Box>
            ))}
          </Box>
        </Box>

        {/* Live Preview (revealed back) */}
        <Box>
          <Typography variant="caption" sx={{ color: theme.TEXT_SECONDARY, display: "block", mb: 0.8 }}>Preview (revealed)</Typography>
          <Box sx={{
            borderRadius: 2,
            background: selectedThemeObj.bg,
            color: selectedThemeObj.text,
            p: 1.8,
            maxWidth: 260,
            position: "relative",
            overflow: "hidden",
          }}>
            <Box sx={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.5 }}>
              <Typography sx={{ fontSize: 22, lineHeight: 1 }}>{emoji}</Typography>
              <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, opacity: 0.8, textTransform: "uppercase" }}>Gift Message</Typography>
            </Box>
            <Typography sx={{ fontSize: 26, lineHeight: 1.1, mb: 0.8 }}>{animation}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 14, wordBreak: "break-word", mb: 0.5 }}>
              {message || "Your message here…"}
            </Typography>
            <Typography sx={{ fontSize: 11, opacity: 0.75 }}>From: {senderName || "You"}</Typography>
          </Box>
        </Box>

      </DialogContent>

      <Divider sx={{ borderColor: theme.SUBTLE_BG_20 }} />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: theme.TEXT_SECONDARY, textTransform: "none" }}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSend}
          startIcon={<GiftIcon />}
          sx={{
            background: "linear-gradient(135deg,#f7c948 0%,#f0a500 100%)",
            color: "#5a3a00", fontWeight: 700, textTransform: "none", borderRadius: 2, px: 3,
            "&:hover": { background: "linear-gradient(135deg,#ffe08a 0%,#f7c948 100%)" },
          }}
        >
          Send Gift 🎁
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GiftCardDialog;
