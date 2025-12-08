import React from 'react';
import { Box, IconButton, Typography, Slider, useMediaQuery } from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon,
  MusicNote as MusicNoteIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useTheme } from '../../context/ThemeContext';
import { getSocket } from '../../socket';
import { NEW_MESSAGE } from '../../constants/events';
import { useLocation } from 'react-router-dom';

const MiniMusicPlayer = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    handleNext,
    handlePrevious,
    setIsPlayerDialogOpen,
    playSong,
    playerRef,
  } = useMusicPlayer();
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const location = useLocation();
  const socket = getSocket();

  if (!currentSong) return null;

  const handleShare = (e) => {
    e.stopPropagation();
    
    // Check if socket is available
    if (!socket) {
      console.warn('Socket not available');
      return;
    }
    
    // Extract chatId from current location path
    const pathParts = location.pathname.split('/');
    const chatIndex = pathParts.indexOf('chat');
    const chatId = chatIndex !== -1 && pathParts[chatIndex + 1] ? pathParts[chatIndex + 1] : null;
    
    if (!chatId) {
      console.warn('No chat is currently open');
      return;
    }

    // Format the share message with song details
    const videoUrl = `https://www.youtube.com/watch?v=${currentSong.videoId}`;
    const shareMessage = `🎵 ${currentSong.title}\n${videoUrl}`;
    
    // Emit the message via socket
    socket.emit(NEW_MESSAGE, { 
      chatId, 
      members: [], // Will be filled by backend based on chatId
      message: shareMessage
    });
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClose = (e) => {
    e.stopPropagation();
    // Stop the video and clear the song
    playSong(null);
    if (playerRef?.current && playerRef.current.stopVideo) {
      try {
        playerRef.current.stopVideo();
      } catch (err) {
        console.log('Error stopping video:', err);
      }
    }
  };

  // Desktop: Show rotating music icon
  if (!isMobile) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: '4.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999,
        }}
      >
        {/* Rotating icon container */}
        <Box
          onClick={() => setIsPlayerDialogOpen(true)}
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: theme.PRIMARY_COLOR,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
            animation: 'rotate 3s linear infinite',
            '@keyframes rotate': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(360deg)' },
            },
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            },
          }}
        >
          <MusicNoteIcon sx={{ color: 'white', fontSize: 28 }} />
        </Box>
        {/* Close button - non-rotating */}
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            minWidth: 20,
            backgroundColor: theme.TEXT_PRIMARY,
            color: theme.LIGHT_BG,
            '&:hover': {
              backgroundColor: theme.TEXT_PRIMARY,
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 12 }} />
        </IconButton>
      </Box>
    );
  }

  // Mobile: Show full mini header
  return (
    <Box
      sx={{
        position: 'fixed',
        top: '4rem',
        left: 0,
        right: 0,
        height: 60,
        backgroundColor: theme.DIALOG_BG || theme.LIGHT_BG,
        borderBottom: `1px solid ${theme.SUBTLE_BG_20}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: '12px',
        zIndex: 999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        cursor: 'pointer',
      }}
      onClick={() => setIsPlayerDialogOpen(true)}
    >
      {/* Progress Bar at Bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: theme.SUBTLE_BG_20,
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: theme.PRIMARY_COLOR,
            transition: 'width 0.3s ease',
          }}
        />
      </Box>

      {/* Thumbnail */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '6px',
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: theme.SUBTLE_BG_20,
        }}
      >
        <img
          src={currentSong.thumbnail}
          alt={currentSong.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </Box>

      {/* Song Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: theme.TEXT_PRIMARY,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {currentSong.title}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: theme.TEXT_SECONDARY,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {currentSong.channelTitle}
        </Typography>
      </Box>

      {/* Time */}
      <Typography
        sx={{
          fontSize: '0.75rem',
          color: theme.TEXT_SECONDARY,
          flexShrink: 0,
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {formatTime(currentTime)} / {formatTime(duration)}
      </Typography>

      {/* Controls */}
      <Box sx={{ display: 'flex', gap: '4px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        <IconButton size="small" onClick={handlePrevious} sx={{ color: theme.TEXT_PRIMARY }}>
          <SkipPreviousIcon />
        </IconButton>
        <IconButton
          onClick={togglePlay}
          sx={{
            color: theme.TEXT_PRIMARY,
            backgroundColor: theme.PRIMARY_COLOR,
            '&:hover': { backgroundColor: theme.PRIMARY_COLOR },
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton size="small" onClick={handleNext} sx={{ color: theme.TEXT_PRIMARY }}>
          <SkipNextIcon />
        </IconButton>
        <IconButton size="small" onClick={handleShare} sx={{ color: theme.TEXT_PRIMARY }}>
          <ShareIcon />
        </IconButton>
      </Box>

      {/* Expand/Close */}
      <Box sx={{ display: 'flex', gap: '4px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        <IconButton
          size="small"
          onClick={() => setIsPlayerDialogOpen(true)}
          sx={{ color: theme.TEXT_SECONDARY }}
        >
          <ExpandLessIcon />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: theme.TEXT_SECONDARY }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default MiniMusicPlayer;
