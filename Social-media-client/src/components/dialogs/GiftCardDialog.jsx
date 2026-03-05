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
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Divider,
} from "@mui/material";
import { Close as CloseIcon, CardGiftcard as GiftIcon } from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import toast from "react-hot-toast";

const THEMES = [
  { id: "gold",    label: "Gold",    bg: "linear-gradient(135deg,#f7c948 0%,#f0a500 100%)",   text: "#5a3a00" },
  { id: "rose",    label: "Rose",    bg: "linear-gradient(135deg,#ff6b9d 0%,#c83b6e 100%)",   text: "#fff" },
  { id: "ocean",   label: "Ocean",   bg: "linear-gradient(135deg,#43b0f1 0%,#1565c0 100%)",   text: "#fff" },
  { id: "forest",  label: "Forest",  bg: "linear-gradient(135deg,#56ab2f 0%,#1b6a2a 100%)",   text: "#fff" },
  { id: "sunset",  label: "Sunset",  bg: "linear-gradient(135deg,#ff6e40 0%,#c62828 100%)",   text: "#fff" },
  { id: "violet",  label: "Violet",  bg: "linear-gradient(135deg,#a855f7 0%,#6b21a8 100%)",   text: "#fff" },
];

const CURRENCIES = ["$", "₹", "€", "£", "¥"];
const EMOJIS     = ["🎁", "🎂", "🎉", "💝", "🌹", "⭐", "🏆", "❤️", "🥳", "🎊"];

const GiftCardPreview = ({ amount, currency, message, theme: themeId, emoji, fromName }) => {
  const themeObj = THEMES.find(t => t.id === themeId) || THEMES[0];
  return (
    <Box sx={{
      width: "100%",
      maxWidth: 320,
      margin: "0 auto",
      borderRadius: 3,
      background: themeObj.bg,
      color: themeObj.text,
      p: 2.5,
      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* decorative circles */}
      <Box sx={{ position:"absolute", top:-30, right:-30, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.12)" }} />
      <Box sx={{ position:"absolute", bottom:-20, left:-20, width:70, height:70, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }} />

      <Typography variant="h3" sx={{ mb: 0.5, lineHeight: 1 }}>{emoji}</Typography>
      <Typography variant="body2" sx={{ opacity: 0.85, mb: 1, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", fontSize: 11 }}>
        Gift Card
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        {currency}{amount || "0"}
      </Typography>
      {fromName && (
        <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mb: 0.5 }}>
          From: {fromName}
        </Typography>
      )}
      {message && (
        <Typography variant="body2" sx={{ opacity: 0.9, fontStyle: "italic", mt: 1, fontSize: 13 }}>
          "{message}"
        </Typography>
      )}
      <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid rgba(255,255,255,0.25)" }}>
        <Typography variant="caption" sx={{ opacity: 0.7, fontSize: 10 }}>
          Tap card to reveal • Powered by Chat 🎁
        </Typography>
      </Box>
    </Box>
  );
};

const GiftCardDialog = ({ open, onClose, onSend, senderName }) => {
  const { theme } = useTheme();
  const [amount, setAmount]       = useState("");
  const [currency, setCurrency]   = useState("$");
  const [message, setMessage]     = useState("");
  const [cardTheme, setCardTheme] = useState("gold");
  const [emoji, setEmoji]         = useState("🎁");
  const [preview, setPreview]     = useState(false);

  const handleSend = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const payload = {
      amount: parseFloat(amount).toFixed(2),
      currency,
      message: message.trim(),
      theme: cardTheme,
      emoji,
      from: senderName || "Someone",
    };
    onSend(payload);
    // reset
    setAmount("");
    setMessage("");
    setCardTheme("gold");
    setEmoji("🎁");
    setPreview(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: theme.LIGHT_BG,
          color: theme.TEXT_PRIMARY,
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
        <GiftIcon sx={{ color: "#f7c948" }} />
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          Send a Gift Card
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon sx={{ color: theme.TEXT_SECONDARY }} />
        </IconButton>
      </DialogTitle>

      <Divider sx={{ borderColor: theme.SUBTLE_BG_20 }} />

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2.5 }}>

        {/* Amount */}
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          {/* Currency */}
          <ToggleButtonGroup
            value={currency}
            exclusive
            onChange={(_, v) => v && setCurrency(v)}
            size="small"
            sx={{ flexShrink: 0, "& .MuiToggleButton-root": { color: theme.TEXT_SECONDARY, borderColor: theme.SUBTLE_BG_20, px: 1.2 }, "& .Mui-selected": { color: "#f7c948 !important", background: "rgba(247,201,72,0.12) !important" } }}
          >
            {CURRENCIES.map(c => <ToggleButton key={c} value={c}>{c}</ToggleButton>)}
          </ToggleButtonGroup>

          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            inputProps={{ min: 1 }}
            fullWidth
            InputLabelProps={{ style: { color: theme.TEXT_SECONDARY } }}
            InputProps={{ style: { color: theme.TEXT_PRIMARY } }}
            sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.SUBTLE_BG_20 } }}
          />
        </Box>

        {/* Personal message */}
        <TextField
          label="Personal message (optional)"
          multiline
          rows={2}
          value={message}
          onChange={e => setMessage(e.target.value)}
          fullWidth
          inputProps={{ maxLength: 120 }}
          InputLabelProps={{ style: { color: theme.TEXT_SECONDARY } }}
          InputProps={{ style: { color: theme.TEXT_PRIMARY } }}
          sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.SUBTLE_BG_20 } }}
        />

        {/* Theme */}
        <Box>
          <Typography variant="caption" sx={{ color: theme.TEXT_SECONDARY, mb: 1, display: "block" }}>
            Card Theme
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {THEMES.map(t => (
              <Box
                key={t.id}
                onClick={() => setCardTheme(t.id)}
                sx={{
                  width: 48,
                  height: 32,
                  borderRadius: 1.5,
                  background: t.bg,
                  cursor: "pointer",
                  border: cardTheme === t.id ? "2.5px solid #fff" : "2.5px solid transparent",
                  boxShadow: cardTheme === t.id ? "0 0 0 2px #f7c948" : "none",
                  transition: "all 0.2s",
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Emoji */}
        <Box>
          <Typography variant="caption" sx={{ color: theme.TEXT_SECONDARY, mb: 1, display: "block" }}>
            Icon
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {EMOJIS.map(em => (
              <Box
                key={em}
                onClick={() => setEmoji(em)}
                sx={{
                  fontSize: 22,
                  cursor: "pointer",
                  p: 0.5,
                  borderRadius: 1.5,
                  background: emoji === em ? "rgba(247,201,72,0.18)" : "transparent",
                  border: emoji === em ? "1.5px solid #f7c948" : "1.5px solid transparent",
                  lineHeight: 1.4,
                  transition: "all 0.15s",
                }}
              >
                {em}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Preview toggle */}
        <Box>
          <Button
            variant="text"
            size="small"
            onClick={() => setPreview(p => !p)}
            sx={{ color: theme.PRIMARY_COLOR, textTransform: "none", mb: 1 }}
          >
            {preview ? "▾ Hide Preview" : "▸ Show Preview"}
          </Button>
          {preview && (
            <GiftCardPreview
              amount={amount}
              currency={currency}
              message={message}
              theme={cardTheme}
              emoji={emoji}
              fromName={senderName || "You"}
            />
          )}
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: theme.SUBTLE_BG_20 }} />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: theme.TEXT_SECONDARY, textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          startIcon={<GiftIcon />}
          sx={{
            background: "linear-gradient(135deg,#f7c948 0%,#f0a500 100%)",
            color: "#5a3a00",
            fontWeight: 700,
            textTransform: "none",
            borderRadius: 2,
            px: 3,
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
