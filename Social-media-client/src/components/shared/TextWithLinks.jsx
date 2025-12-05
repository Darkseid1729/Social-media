import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { parseTextWithUrls } from '../../utils/linkUtils';
import LinkPreview from './LinkPreview';

const TextWithLinks = ({ text, showPreviews = false }) => {
  const { theme } = useTheme();
  const parts = parseTextWithUrls(text);

  if (!text || parts.length === 0) return null;

  const handleLinkClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // If showing previews, separate text and URLs
  if (showPreviews) {
    const textParts = parts.filter(part => part.type === 'text');
    const urlParts = parts.filter(part => part.type === 'url');
    const hasText = textParts.some(part => part.content.trim().length > 0);

    return (
      <Box>
        {/* 1. First render clickable links at the top */}
        {urlParts.length > 0 && (
          <Typography style={{ marginBottom: 6, wordBreak: 'break-word' }}>
            {urlParts.map((urlPart, index) => (
              <React.Fragment key={index}>
                {index > 0 && ' '}
                <Box
                  component="span"
                  onClick={() => handleLinkClick(urlPart.url)}
                  sx={{
                    color: theme.PRIMARY_COLOR || '#1976d2',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    wordBreak: 'break-all',
                    '&:hover': {
                      textDecoration: 'none'
                    }
                  }}
                >
                  {urlPart.content}
                </Box>
              </React.Fragment>
            ))}
          </Typography>
        )}
        
        {/* 2. Then render link previews (embedded player) in the middle */}
        {urlParts.map((urlPart, index) => (
          <LinkPreview key={index} url={urlPart.url} />
        ))}
        
        {/* 3. Finally render text content at the bottom */}
        {hasText && (
          <Typography style={{ marginTop: urlParts.length > 0 ? 6 : 0, wordBreak: 'break-word' }}>
            {textParts.map((part, index) => (
              <span key={index}>{part.content}</span>
            ))}
          </Typography>
        )}
      </Box>
    );
  }

  // Simple inline rendering without previews
  return (
    <Typography style={{ marginBottom: 6, wordBreak: 'break-word' }}>
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.content}</span>;
        } else if (part.type === 'url') {
          return (
            <Box
              key={index}
              component="span"
              onClick={() => handleLinkClick(part.url)}
              sx={{
                color: theme.PRIMARY_COLOR || '#1976d2',
                textDecoration: 'underline',
                cursor: 'pointer',
                wordBreak: 'break-all',
                '&:hover': {
                  textDecoration: 'none'
                }
              }}
            >
              {part.content}
            </Box>
          );
        }
        return null;
      })}
    </Typography>
  );
};

export default TextWithLinks;