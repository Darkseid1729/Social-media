import React, { useState, useCallback, useMemo, useEffect } from "react";
import { 
  Dialog, 
  DialogTitle, 
  Input, 
  Grid, 
  IconButton, 
  Box, 
  Typography,
  Chip,
  Stack,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "../../context/ThemeContext";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import axios from "axios";
import { server } from "../../constants/config";

const YouTubeSearchDialog = ({ open, onClose, onSelect }) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [search, setSearch] = useState("");
  const [videos, setVideos] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("any");

  // Handle back button on mobile
  useEffect(() => {
    const handleBackButton = (e) => {
      if (open) {
        e.preventDefault();
        onClose();
      }
    };

    if (open) {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handleBackButton);
    }

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [open, onClose]);

  // Filters for video search
  const filters = [
    { label: "All", value: "any" },
    { label: "Music", value: "music" },
    { label: "Gaming", value: "gaming" },
    { label: "Sports", value: "sports" },
    { label: "News", value: "news" },
    { label: "Education", value: "education" }
  ];

  // Load trending videos when dialog opens
  useEffect(() => {
    if (open && videos.length === 0 && search.trim().length === 0) {
      fetchTrendingVideos();
    }
  }, [open]);

  const fetchTrendingVideos = useCallback(async () => {
    setLoading(true);
    
    try {
      const videoCategoryId = getCategoryId(selectedFilter);
      const params = {
        maxResults: 12
      };
      
      if (videoCategoryId) {
        params.categoryId = videoCategoryId;
      }
      
      const { data } = await axios.get(
        `${server}/api/v1/youtube/trending`,
        { 
          params,
          withCredentials: true 
        }
      );
      
      if (data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      } else {
        setVideos([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trending videos:', err);
      setVideos([]);
      setLoading(false);
    }
  }, [selectedFilter]);

  const fetchVideos = useCallback(async (query) => {
    if (query.trim().length === 0) {
      fetchTrendingVideos();
      return;
    }
    
    setLoading(true);
    
    try {
      const videoCategoryId = getCategoryId(selectedFilter);
      const params = {
        query,
        maxResults: 16
      };
      
      if (videoCategoryId) {
        params.categoryId = videoCategoryId;
      }
      
      const { data } = await axios.get(
        `${server}/api/v1/youtube/search`,
        { 
          params,
          withCredentials: true 
        }
      );
      
      if (data.success && Array.isArray(data.videos)) {
        setVideos(data.videos);
      } else {
        setVideos([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setVideos([]);
      setLoading(false);
    }
  }, [selectedFilter, fetchTrendingVideos]);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    
    setDebounceTimeout(
      setTimeout(() => {
        fetchVideos(value);
      }, 500)
    );
  }, [debounceTimeout, fetchVideos]);

  const handleFilterChange = useCallback((filterValue) => {
    setSelectedFilter(filterValue);
    // Re-fetch with new filter
    if (search.trim().length > 0) {
      fetchVideos(search);
    } else {
      fetchTrendingVideos();
    }
  }, [search, fetchVideos, fetchTrendingVideos]);

  // Helper function to get category ID
  const getCategoryId = (filter) => {
    const categoryMap = {
      music: '10',
      gaming: '20',
      sports: '17',
      news: '25',
      education: '27'
    };
    return categoryMap[filter] || null;
  };

  // Format duration from ISO 8601 format (PT1H2M10S) to readable format
  const formatDuration = (duration) => {
    if (!duration || duration === 'N/A') return 'N/A';
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'N/A';
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    if (hours) {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
  };

  // Format views count
  const formatViews = (views) => {
    if (!views || views === 'N/A') return 'N/A';
    const num = parseInt(views);
    if (isNaN(num)) return 'N/A';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const memoizedVideos = useMemo(() => 
    videos.map(video => ({
      ...video,
      duration: formatDuration(video.duration),
      views: formatViews(video.views)
    }))
  , [videos]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth={false}
      PaperProps={{
        sx: {
          maxWidth: isMobile ? 360 : 560,
          width: isMobile ? '90%' : '100%',
          maxHeight: isMobile ? 500 : 600,
          minHeight: isMobile ? 320 : 380,
          borderRadius: 3,
          overflow: 'hidden',
          background: theme?.DIALOG_BG || theme?.LIGHT_BG,
          color: theme?.TEXT_PRIMARY,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, color: theme?.TEXT_PRIMARY }}>
        {search.trim().length === 0 ? 'Trending Videos' : 'Search YouTube'}
      </DialogTitle>
      
      <Input
        autoFocus
        fullWidth
        placeholder="Search YouTube videos..."
        value={search}
        onChange={handleSearch}
        sx={{ margin: "0.5rem 1rem 0.5rem 1rem", color: theme?.TEXT_PRIMARY }}
      />

      {/* Filter Chips */}
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          padding: '0.5rem 1rem', 
          overflowX: 'auto',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { 
            background: theme?.SUBTLE_BG_20,
            borderRadius: 3
          }
        }}
      >
        {filters.map((filter) => (
          <Chip
            key={filter.value}
            label={filter.label}
            onClick={() => handleFilterChange(filter.value)}
            variant={selectedFilter === filter.value ? "filled" : "outlined"}
            size="small"
            sx={{
              borderColor: theme?.SUBTLE_BG_20,
              color: selectedFilter === filter.value ? theme?.TEXT_ON_ACCENT : theme?.TEXT_SECONDARY,
              backgroundColor: selectedFilter === filter.value ? theme?.PRIMARY_COLOR : 'transparent',
              '&:hover': {
                backgroundColor: selectedFilter === filter.value ? theme?.PRIMARY_COLOR : theme?.SUBTLE_BG_10,
              }
            }}
          />
        ))}
      </Stack>

      <div style={{ overflowY: 'auto', maxHeight: isMobile ? 320 : 420, padding: '0.5rem 1rem 1rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: theme?.TEXT_SECONDARY }}>
            {search.trim().length === 0 ? 'Loading trending videos...' : 'Searching videos...'}
          </div>
        ) : videos.length === 0 && search.trim().length > 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: theme?.TEXT_SECONDARY }}>
            No videos found. Try a different search term.
          </div>
        ) : (
          <Grid container spacing={1.5}>
            {memoizedVideos.map((video) => (
              <Grid item xs={6} sm={4} key={video.id}>
                <Box
                  onClick={() => {
                    onSelect(video.url);
                    onClose();
                  }}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: theme?.SUBTLE_BG_10,
                    '&:hover': {
                      transform: 'scale(1.03)',
                      transition: 'transform 0.2s ease-in-out',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  {/* Thumbnail with play icon and duration */}
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                    {/* Play icon overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <PlayArrowIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    {/* Duration badge */}
                    <Typography
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '2px 4px',
                        borderRadius: 1,
                        fontSize: '0.65rem',
                        fontWeight: 600
                      }}
                    >
                      {video.duration}
                    </Typography>
                  </Box>
                  
                  {/* Video info - compact */}
                  <Box sx={{ padding: '6px 8px' }}>
                    <Typography
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: theme?.TEXT_PRIMARY,
                        lineHeight: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        marginBottom: '4px'
                      }}
                    >
                      {video.title}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.65rem',
                        color: theme?.TEXT_SECONDARY,
                        lineHeight: 1.1,
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {video.channelTitle}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.6rem',
                        color: theme?.TEXT_SECONDARY,
                        marginTop: '2px'
                      }}
                    >
                      {video.views} views
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </Dialog>
  );
};

export default YouTubeSearchDialog;
