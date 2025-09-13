import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Reply as ReplyIcon } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const ReplyDisplay = ({ replyTo, onClick }) => {
  const { theme } = useTheme();

  if (!replyTo) return null;

  const truncateText = (text, maxLength = 35) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        marginBottom: '6px',
        backgroundColor: theme.SUBTLE_BG_10,
        borderLeft: `3px solid ${theme.PRIMARY_COLOR}`,
        borderRadius: '0 6px 6px 0',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        maxWidth: '80%',
        '&:hover': onClick ? {
          backgroundColor: theme.SUBTLE_BG_20,
          transform: 'translateX(2px)',
        } : {},
      }}
    >
      <ReplyIcon 
        sx={{ 
          fontSize: 14, 
          color: theme.TEXT_SECONDARY,
          transform: 'scaleX(-1)',
          flexShrink: 0,
        }} 
      />
      
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: theme.PRIMARY_COLOR,
            fontWeight: 600,
            fontSize: '0.7rem',
            display: 'block',
            lineHeight: 1.2,
          }}
        >
          {replyTo.sender?.name || 'Unknown User'}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: theme.TEXT_SECONDARY,
            fontSize: '0.75rem',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {replyTo.content 
            ? truncateText(replyTo.content)
            : replyTo.attachments?.length > 0 
              ? '📎 Attachment'
              : '💬 Message'
          }
        </Typography>
      </Box>
    </Box>
  );
};

export default ReplyDisplay;