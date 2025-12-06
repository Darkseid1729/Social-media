import React from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  VolumeUp as VolumeUpIcon,
  Repeat as RepeatIcon,
  Shuffle as ShuffleIcon,
  QueueMusic as QueueMusicIcon,
} from '@mui/icons-material';
import { useMusicPlayer } from '../../context/MusicPlayerContext';
import { useTheme } from '../../context/ThemeContext';

const MusicPlayerDialog = () => {
  const {
    currentSong,
    isPlaying,
    queue,
    currentIndex,
    volume,
    duration,
    currentTime,
    isRepeat,
    isShuffle,
    isPlayerDialogOpen,
    togglePlay,
    handleNext,
    handlePrevious,
    changeVolume,
    seekTo,
    toggleRepeat,
    toggleShuffle,
    setIsPlayerDialogOpen,
    playSong,
    removeFromQueue,
  } = useMusicPlayer();
  const { theme } = useTheme();

  const [showQueue, setShowQueue] = React.useState(false);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (event, newValue) => {
    seekTo((newValue / 100) * duration);
  };

  const handleVolumeChange = (event, newValue) => {
    changeVolume(newValue);
  };

  return (
    <Dialog
      open={isPlayerDialogOpen}
      onClose={() => setIsPlayerDialogOpen(false)}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: theme.DIALOG_BG || theme.LIGHT_BG,
          color: theme.TEXT_PRIMARY,
          maxHeight: '65vh',
          maxWidth: '340px',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        {/* Close Button */}
        <IconButton
          size="small"
          onClick={() => setIsPlayerDialogOpen(false)}
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            color: theme.TEXT_PRIMARY,
            zIndex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            '&:hover': { backgroundColor: 'rgba(0,0,0,0.8)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* Album Art / Thumbnail - Smaller */}
        {currentSong && (
          <Box
            sx={{
              width: '100%',
              paddingTop: '45%',
              position: 'relative',
              backgroundColor: theme.SUBTLE_BG_20,
            }}
          >
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>
        )}

        <Box sx={{ padding: '16px' }}>
          {/* Song Info */}
          {currentSong && (
            <>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  color: theme.TEXT_PRIMARY,
                  marginBottom: '2px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  lineHeight: 1.3,
                }}
              >
                {currentSong.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.8rem',
                  color: theme.TEXT_SECONDARY,
                  marginBottom: '12px',
                }}
              >
                {currentSong.channelTitle}
              </Typography>
            </>
          )}

          {/* Progress Bar */}
          <Box sx={{ marginBottom: '6px' }}>
            <Slider
              value={duration > 0 ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              sx={{
                color: theme.PRIMARY_COLOR,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: theme.TEXT_SECONDARY }}>
                {formatTime(currentTime)}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.TEXT_SECONDARY }}>
                {formatTime(duration)}
              </Typography>
            </Box>
          </Box>

          {/* Playback Controls */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              marginTop: '12px',
              marginBottom: '12px',
            }}
          >
            <IconButton
              size="small"
              onClick={toggleShuffle}
              sx={{ color: isShuffle ? theme.PRIMARY_COLOR : theme.TEXT_SECONDARY }}
            >
              <ShuffleIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handlePrevious} sx={{ color: theme.TEXT_PRIMARY }}>
              <SkipPreviousIcon sx={{ fontSize: 28 }} />
            </IconButton>
            <IconButton
              onClick={togglePlay}
              sx={{
                color: 'white',
                backgroundColor: theme.PRIMARY_COLOR,
                width: 48,
                height: 48,
                '&:hover': { backgroundColor: theme.PRIMARY_COLOR, transform: 'scale(1.05)' },
              }}
            >
              {isPlaying ? <PauseIcon sx={{ fontSize: 28 }} /> : <PlayArrowIcon sx={{ fontSize: 28 }} />}
            </IconButton>
            <IconButton size="small" onClick={handleNext} sx={{ color: theme.TEXT_PRIMARY }}>
              <SkipNextIcon sx={{ fontSize: 28 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={toggleRepeat}
              sx={{ color: isRepeat ? theme.PRIMARY_COLOR : theme.TEXT_SECONDARY }}
            >
              <RepeatIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Volume Control */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <VolumeUpIcon sx={{ color: theme.TEXT_SECONDARY }} />
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              sx={{
                color: theme.PRIMARY_COLOR,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
              }}
            />
          </Box>

          {/* Queue Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              onClick={() => setShowQueue(!showQueue)}
              sx={{ color: theme.TEXT_SECONDARY }}
            >
              <QueueMusicIcon />
              <Typography variant="caption" sx={{ marginLeft: '8px' }}>
                Queue ({queue.length})
              </Typography>
            </IconButton>
          </Box>

          {/* Queue List */}
          {showQueue && queue.length > 0 && (
            <Box
              sx={{
                maxHeight: '200px',
                overflowY: 'auto',
                marginTop: '16px',
                borderTop: `1px solid ${theme.SUBTLE_BG_20}`,
              }}
            >
              <List dense>
                {queue.map((song, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      backgroundColor: index === currentIndex ? theme.SUBTLE_BG_10 : 'transparent',
                      borderRadius: '8px',
                      marginBottom: '4px',
                    }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => removeFromQueue(index)}
                        sx={{ color: theme.TEXT_SECONDARY }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemButton onClick={() => playSong(song, queue, index)}>
                      <ListItemText
                        primary={song.title}
                        secondary={song.channelTitle}
                        primaryTypographyProps={{
                          sx: {
                            fontSize: '0.85rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: theme.TEXT_PRIMARY,
                          },
                        }}
                        secondaryTypographyProps={{
                          sx: {
                            fontSize: '0.75rem',
                            color: theme.TEXT_SECONDARY,
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Box>
    </Dialog>
  );
};

export default MusicPlayerDialog;
