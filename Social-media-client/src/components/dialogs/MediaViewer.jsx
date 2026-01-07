import React, { useState } from 'react';
import {
  Dialog,
  IconButton,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import ForwardDialog from './ForwardDialog';
import {
  Close as CloseIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Download as DownloadIcon,
  Forward as ForwardIcon,
} from '@mui/icons-material';
import moment from 'moment';

const MediaViewer = ({ open, onClose, media, currentIndex, onNavigate }) => {
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  
  if (!media || media.length === 0) return null;

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia?.type?.startsWith('video/');

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < media.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentMedia.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `media_${currentMedia._id}${isVideo ? '.mp4' : '.jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleForward = () => {
    setForwardDialogOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') handlePrev(e);
    if (e.key === 'ArrowRight') handleNext(e);
    if (e.key === 'Escape') onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'rgba(0, 0, 0, 0.95)',
          backgroundImage: 'none',
        }
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Close button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'white',
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
          zIndex: 2,
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Download button */}
      <IconButton
        onClick={handleDownload}
        sx={{
          position: 'absolute',
          top: 16,
          right: 128,
          color: 'white',
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
          zIndex: 2,
        }}
      >
        <DownloadIcon />
      </IconButton>

      {/* Forward button */}
      <IconButton
        onClick={handleForward}
        sx={{
          position: 'absolute',
          top: 16,
          right: 72,
          color: 'white',
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
          zIndex: 2,
        }}
      >
        <ForwardIcon />
      </IconButton>

      {/* Media info */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          color: 'white',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          padding: '8px 16px',
          borderRadius: '8px',
        }}
      >
        <Avatar
          src={currentMedia?.sender?.avatar?.url}
          alt={currentMedia?.sender?.name}
          sx={{ width: 32, height: 32 }}
        />
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {currentMedia?.sender?.name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {moment(currentMedia?.createdAt).format('MMM D, YYYY h:mm A')}
          </Typography>
        </Box>
      </Box>

      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <IconButton
          onClick={handlePrev}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
            zIndex: 2,
          }}
        >
          <PrevIcon sx={{ fontSize: 40 }} />
        </IconButton>
      )}

      {currentIndex < media.length - 1 && (
        <IconButton
          onClick={handleNext}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
            zIndex: 2,
          }}
        >
          <NextIcon sx={{ fontSize: 40 }} />
        </IconButton>
      )}

      {/* Media content */}
      <Box
        onClick={onClose}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 20px 20px',
        }}
      >
        {isVideo ? (
          <video
            src={currentMedia.url}
            controls
            autoPlay
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <img
            src={currentMedia.url}
            alt="Media"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        )}
      </Box>

      {/* Counter */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          padding: '8px 16px',
          borderRadius: '16px',
          zIndex: 2,
        }}
      >
        <Typography variant="body2">
          {currentIndex + 1} / {media.length}
        </Typography>
      </Box>

      {/* Forward Dialog */}
      <ForwardDialog
        open={forwardDialogOpen}
        onClose={() => setForwardDialogOpen(false)}
        messageId={currentMedia?.messageId}
      />
    </Dialog>
  );
};

export default MediaViewer;
