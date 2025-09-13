import React from 'react';
import { Box, IconButton, Popover } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const ReactionPicker = ({ open, anchorEl, onClose, onReactionSelect }) => {
  const { theme } = useTheme();

  const handleReactionClick = (emoji) => {
    onReactionSelect(emoji);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      PaperProps={{
        sx: {
          backgroundColor: theme.LIGHT_BG,
          border: `1px solid ${theme.SUBTLE_BG_20}`,
          borderRadius: 2,
          padding: '8px',
          boxShadow: '0 4px 12px 0 rgba(0,0,0,0.15)',
        }
      }}
    >
      <Box sx={{ display: 'flex', gap: '4px' }}>
        {REACTION_EMOJIS.map((emoji) => (
          <IconButton
            key={emoji}
            onClick={() => handleReactionClick(emoji)}
            sx={{
              fontSize: '20px',
              padding: '8px',
              minWidth: '40px',
              height: '40px',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: theme.SUBTLE_BG_10,
                transform: 'scale(1.2)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {emoji}
          </IconButton>
        ))}
      </Box>
    </Popover>
  );
};

export default ReactionPicker;