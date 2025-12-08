import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Close as CloseIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { parseYouTubeUrl } from '../../utils/linkUtils';
import VideoPreviewDialog from '../dialogs/VideoPreviewDialog';

const YouTubeInputPreview = ({ videoUrl, onClose }) => {
  const { theme } = useTheme();
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!videoUrl) return null;

  const { isYoutube, videoId } = parseYouTubeUrl(videoUrl);

  if (!isYoutube || !videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

  const handlePreviewClick = (e) => {
    e.stopPropagation();
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: '4px 8px',
          marginBottom: '4px',
          position: 'relative',
        }}
      >
        {/* Large Thumbnail */}
        <Box
          onClick={handlePreviewClick}
          sx={{
            position: 'relative',
            width: '100%',
            maxWidth: 280,
            height: 158,
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: theme.SUBTLE_BG_20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            '&:hover': {
              transform: 'scale(1.02)',
              transition: 'transform 0.2s ease-in-out',
            },
          }}
        >
          <img
            src={thumbnailUrl}
            alt="YouTube video"
            style={{
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
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <PlayArrowIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>

          {/* Close button */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            size="small"
            sx={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
              },
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      <VideoPreviewDialog
        open={previewOpen}
        onClose={handleClosePreview}
        videoId={videoId}
      />
    </>
  );
};

export default YouTubeInputPreview;
