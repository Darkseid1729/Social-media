import React, { useRef, useState } from "react";
import { Dialog, DialogContent, IconButton, Typography, Button, Stack } from "@mui/material";
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from "../../context/ThemeContext";
import { useSetWallpaperMutation } from "../../redux/api/api";

const WallpaperDialog = ({ open, onClose, chatId, onSuccess }) => {
  const { theme } = useTheme();
  const [wallpaperFile, setWallpaperFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [setWallpaper] = useSetWallpaperMutation();
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setWallpaperFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!wallpaperFile) return setError("Please select an image.");
    if (!chatId || chatId === 'null') {
      setError("Invalid chat. Please try again from a valid chat window.");
      return;
    }
    setIsUploading(true);
    setError("");
    try {
      await setWallpaper({ chatId, file: wallpaperFile }).unwrap();
      setWallpaperFile(null);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err?.data?.message || "Failed to set wallpaper");
    }
    setIsUploading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{
        bgcolor: theme.LIGHT_BG,
        borderRadius: 3,
        minWidth: { xs: 280, sm: 350 },
        minHeight: 220,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: theme.TEXT_SECONDARY, zIndex: 2 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mb: 2, color: theme.TEXT_PRIMARY }}>
          Change Chat Wallpaper
        </Typography>
        <form onSubmit={handleUpload} style={{ width: '100%' }}>
          <Stack spacing={2} alignItems="center">
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoLibraryIcon />}
              sx={{ bgcolor: theme.BUTTON_ACCENT, color: theme.TEXT_ON_ACCENT }}
              disabled={isUploading}
            >
              Select Image
              <input
                type="file"
                accept="image/*"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </Button>
            {wallpaperFile && (
              <Typography variant="body2" sx={{ color: theme.TEXT_SECONDARY }}>
                {wallpaperFile.name}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: theme.PRIMARY_COLOR, color: theme.TEXT_ON_ACCENT }}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Set Wallpaper"}
            </Button>
            {error && <Typography color="error" variant="caption">{error}</Typography>}
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WallpaperDialog;
