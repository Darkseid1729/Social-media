import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const YouTubePlayer = ({ videoId, isShorts = false, onClose }) => {
  const { theme } = useTheme();
  
  // YouTube embed URL with proper parameters
  // Use nocookie domain and add more parameters for better compatibility
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: isShorts ? 320 : 560,
        aspectRatio: isShorts ? '9/16' : '16/9',
        backgroundColor: '#000',
        borderRadius: 2,
        overflow: 'hidden',
        margin: '8px 0',
        boxShadow: `0 4px 12px 0 ${theme.SUBTLE_BG_20}`
      }}
    >
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.9)'
            }
          }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
      
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        style={{
          border: 'none',
          display: 'block'
        }}
      />
    </Box>
  );
};

export default YouTubePlayer;
