import React, { useEffect } from 'react';
import {
  Dialog,
  Box,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const VideoPreviewDialog = ({ open, onClose, videoId }) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');

  // Handle back button on mobile
  useEffect(() => {
    const handleBackButton = (e) => {
      if (open) {
        e.preventDefault();
        onClose();
      }
    };

    if (open) {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handleBackButton);
    }

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [open, onClose]);

  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const handleOpenYouTube = () => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.DIALOG_BG || theme.LIGHT_BG,
          borderRadius: 2,
          maxWidth: isMobile ? '95%' : 640,
          position: 'relative',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box
        sx={{
          position: 'relative',
          paddingTop: '56.25%', // 16:9 aspect ratio
          width: '100%',
          backgroundColor: '#000',
          cursor: 'pointer',
        }}
        onClick={handleOpenYouTube}
      >
        <img
          src={thumbnailUrl}
          alt="Video thumbnail"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        
        {/* Play icon overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 0, 0, 0.9)',
            borderRadius: '50%',
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'translate(-50%, -50%) scale(1.1)',
            },
          }}
        >
          <PlayArrowIcon sx={{ color: 'white', fontSize: 48 }} />
        </Box>
      </Box>
    </Dialog>
  );
};

export default VideoPreviewDialog;
