import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon, Reply as ReplyIcon } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const ReplyInputPreview = ({ replyTo, onClose }) => {
  const { theme } = useTheme();

  if (!replyTo) return null;

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        margin: '0 16px',
        marginBottom: '8px',
        backgroundColor: theme.SUBTLE_BG_10,
        borderLeft: `3px solid ${theme.PRIMARY_COLOR}`,
        borderRadius: '0 8px 8px 0',
        position: 'relative',
      }}
    >
      <ReplyIcon 
        sx={{ 
          fontSize: 16, 
          color: theme.PRIMARY_COLOR,
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
            fontSize: '0.75rem',
            display: 'block',
            lineHeight: 1.2,
          }}
        >
          Replying to {replyTo.sender?.name || 'Unknown User'}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: theme.TEXT_SECONDARY,
            fontSize: '0.8rem',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {replyTo.content 
            ? truncateText(replyTo.content, 30)
            : replyTo.attachments?.length > 0 
              ? '📎 Attachment'
              : '💬 Message'
          }
        </Typography>
      </Box>
      
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          padding: '2px',
          minWidth: '20px',
          minHeight: '20px',
          color: theme.TEXT_SECONDARY,
          backgroundColor: theme.SUBTLE_BG_20,
          '&:hover': {
            backgroundColor: theme.SUBTLE_BG_30,
            color: theme.TEXT_PRIMARY,
          },
        }}
      >
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
};

export default ReplyInputPreview;