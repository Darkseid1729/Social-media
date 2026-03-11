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
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  AutoFixHigh as AiIcon,
  Send as SendIcon,
  Visibility as PreviewIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import { server } from "../../constants/config";
import toast from "react-hot-toast";
import axios from "axios";

const AiAnimationDialog = ({ open, onClose, onSend, chatId }) => {
  const { theme } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe the animation you want");
      return;
    }

    setLoading(true);
    setGeneratedHtml("");
    const toastId = toast.loading("Generating animation...");

    try {
      const { data } = await axios.post(
        `${server}/api/v1/bot/generate-animation`,
        { prompt: prompt.trim() },
        { withCredentials: true }
      );

      if (data.success && data.html) {
        setGeneratedHtml(data.html);
        toast.success("Animation generated! Preview or send it.", { id: toastId });
      } else {
        toast.error("Failed to generate animation", { id: toastId });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to generate animation";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!generatedHtml) return;

    // Create an HTML file blob and send it as attachment
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const fileName = `ai-animation-${Date.now()}.html`;
    const file = new File([blob], fileName, { type: "text/html" });

    onSend(file);
    handleClose();
  };

  const handleClose = () => {
    setPrompt("");
    setGeneratedHtml("");
    setPreviewOpen(false);
    onClose();
  };

  const isDark = theme?.mode === "dark" || theme?.palette?.mode === "dark";

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: isDark ? "#1e1e2e" : "#fff",
            color: isDark ? "#e0e0e0" : "#222",
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AiIcon sx={{ color: "#a855f7" }} />
            <Typography variant="h6" fontWeight={700}>
              AI Animation Creator
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
            Describe the animation you want and AI will generate an HTML animation file for you.
          </Typography>

          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            placeholder='e.g. "A starry night sky with shooting stars and twinkling effects"'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            inputProps={{ maxLength: 500 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
              },
            }}
          />

          <Typography
            variant="caption"
            sx={{ display: "block", textAlign: "right", mt: 0.5, opacity: 0.5 }}
          >
            {prompt.length}/500
          </Typography>

          {generatedHtml && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: "12px",
                bgcolor: isDark ? "rgba(168,85,247,0.1)" : "rgba(168,85,247,0.05)",
                border: "1px solid",
                borderColor: isDark ? "rgba(168,85,247,0.3)" : "rgba(168,85,247,0.2)",
              }}
            >
              <Typography variant="body2" sx={{ color: "#a855f7", fontWeight: 600, mb: 1 }}>
                Animation Ready!
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {(new Blob([generatedHtml]).size / 1024).toFixed(1)} KB HTML file
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          {generatedHtml && (
            <>
              <Button
                startIcon={<PreviewIcon />}
                onClick={() => setPreviewOpen(true)}
                variant="outlined"
                sx={{ borderRadius: "10px", textTransform: "none" }}
              >
                Preview
              </Button>
              <Button
                startIcon={<SendIcon />}
                onClick={handleSend}
                variant="contained"
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  bgcolor: "#a855f7",
                  "&:hover": { bgcolor: "#9333ea" },
                }}
              >
                Send
              </Button>
            </>
          )}
          {!generatedHtml && (
            <Button
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AiIcon />}
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              variant="contained"
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                bgcolor: "#a855f7",
                "&:hover": { bgcolor: "#9333ea" },
              }}
            >
              {loading ? "Generating..." : "Generate Animation"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: "80vh",
            borderRadius: "16px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1,
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Animation Preview
          </Typography>
          <IconButton onClick={() => setPreviewOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, flex: 1 }}>
          {generatedHtml && (
            <iframe
              srcDoc={generatedHtml}
              title="AI Animation Preview"
              sandbox="allow-scripts"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AiAnimationDialog;
