import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, IconButton } from '@mui/material';
import { OpenInNew as OpenInNewIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { fetchLinkPreview, parseYouTubeUrl } from '../../utils/linkUtils';

const LinkPreview = ({ url, inline = false }) => {
  const { theme } = useTheme();
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreview = async () => {
      setLoading(true);
      const previewData = await fetchLinkPreview(url);
      setPreview(previewData);
      setLoading(false);
    };

    if (url) {
      loadPreview();
    }
  }, [url]);

  const handleClick = () => {
    if (preview?.url) {
      window.open(preview.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          padding: 1,
          borderRadius: 1,
          backgroundColor: theme.SUBTLE_BG_10,
          color: theme.TEXT_SECONDARY,
          fontSize: '0.875rem',
          maxWidth: inline ? 'none' : 320,
          margin: inline ? '0 4px' : '8px 0'
        }}
      >
        Loading preview...
      </Box>
    );
  }

  if (!preview) {
    // Fallback: just show clickable link
    return (
      <Box
        component="span"
        onClick={handleClick}
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
        {url}
      </Box>
    );
  }

  if (inline) {
    // Inline link rendering
    return (
      <Box
        component="span"
        onClick={handleClick}
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
        {preview.title || url}
      </Box>
    );
  }

  // Full preview card
  return (
    <Card
      onClick={handleClick}
      sx={{
        maxWidth: 320,
        margin: '8px 0',
        cursor: 'pointer',
        backgroundColor: theme.LIGHT_BG,
        border: `1px solid ${theme.SUBTLE_BG_20}`,
        '&:hover': {
          backgroundColor: theme.SUBTLE_BG_10,
          transform: 'translateY(-1px)',
          boxShadow: `0 4px 12px 0 ${theme.SUBTLE_BG_20}`
        },
        transition: 'all 0.2s ease-in-out'
      }}
    >
      {preview.thumbnail && (
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="160"
            image={preview.thumbnail}
            alt={preview.title}
            sx={{ objectFit: 'cover' }}
          />
          {preview.type === 'youtube' && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '50%',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PlayArrowIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
          )}
        </Box>
      )}
      
      <CardContent sx={{ padding: '12px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: theme.TEXT_PRIMARY,
                fontSize: '0.9rem',
                lineHeight: 1.3,
                marginBottom: '4px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {preview.title}
            </Typography>
            
            {preview.description && (
              <Typography
                variant="body2"
                sx={{
                  color: theme.TEXT_SECONDARY,
                  fontSize: '0.8rem',
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {preview.description}
              </Typography>
            )}
            
            <Typography
              variant="caption"
              sx={{
                color: theme.TEXT_SECONDARY,
                fontSize: '0.75rem',
                marginTop: '4px',
                display: 'block'
              }}
            >
              {new URL(preview.url).hostname}
            </Typography>
          </Box>
          
          <IconButton
            size="small"
            sx={{
              marginLeft: 1,
              color: theme.TEXT_SECONDARY,
              '&:hover': {
                backgroundColor: theme.SUBTLE_BG_10
              }
            }}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LinkPreview;