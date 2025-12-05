import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Dialog, DialogTitle, Input, Grid, IconButton } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { server } from "../../constants/config";

const GifPicker = ({ open, onClose, onSelect }) => {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());

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

  // Load trending GIFs when dialog opens
  useEffect(() => {
    if (open && gifs.length === 0 && search.trim().length === 0) {
      fetchTrendingGifs();
    }
  }, [open]);

  const fetchTrendingGifs = useCallback(async () => {
    setLoading(true);
    setLoadedImages(new Set());
    
    try {
      const { data } = await axios.get(
        `${server}/api/v1/gif/trending`,
        { 
          params: { limit: 12 },
          withCredentials: true 
        }
      );
      
      if (data.success && Array.isArray(data.gifs)) {
        setGifs(data.gifs);
      } else {
        setGifs([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching trending GIFs:', err);
      setGifs([]);
      setLoading(false);
    }
  }, []);

  const fetchGifs = useCallback(async (query) => {
    if (query.trim().length === 0) {
      setGifs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadedImages(new Set()); // Reset loaded images when searching
    
    try {
      const { data } = await axios.get(
        `${server}/api/v1/gif/search`,
        { 
          params: { query, limit: 16 },
          withCredentials: true 
        }
      );
      
      if (data.success && Array.isArray(data.gifs)) {
        setGifs(data.gifs);
      } else {
        setGifs([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error searching GIFs:', err);
      setGifs([]);
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    
    // Only search if user has typed at least 2 characters
    if (value.trim().length >= 2) {
      setDebounceTimeout(
        setTimeout(() => {
          fetchGifs(value);
        }, 800) // Increased debounce time to save API calls
      );
    } else if (value.trim().length === 0) {
      // Show trending GIFs when search is cleared
      fetchTrendingGifs();
    } else {
      // Clear results if less than 2 characters
      setGifs([]);
      setLoading(false);
    }
  }, [debounceTimeout, fetchGifs, fetchTrendingGifs]);

  const handleImageLoad = useCallback((gifId) => {
    setLoadedImages(prev => new Set([...prev, gifId]));
  }, []);

  const memoizedGifs = useMemo(() => gifs, [gifs]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth={false}
      PaperProps={{
        sx: {
          maxWidth: 480,
          width: '100%',
          maxHeight: 520,
          minHeight: 320,
          borderRadius: 3,
          overflow: 'hidden',
          background: theme?.DIALOG_BG || theme?.LIGHT_BG,
          color: theme?.TEXT_PRIMARY,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, color: theme?.TEXT_PRIMARY }}>
        {search.trim().length === 0 ? 'Trending GIFs' : 'Search GIFs'}
      </DialogTitle>
      <Input
        autoFocus
        fullWidth
        placeholder="Type to search GIFs..."
        value={search}
        onChange={handleSearch}
        sx={{ margin: "0.5rem 1rem 0.5rem 1rem", color: theme?.TEXT_PRIMARY }}
      />
      <div style={{ overflowY: 'auto', maxHeight: 340, padding: '0 1rem 1rem 1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: theme?.TEXT_SECONDARY }}>
            {search.trim().length === 0 ? 'Loading trending GIFs...' : 'Searching GIFs...'}
          </div>
        ) : gifs.length === 0 && search.trim().length > 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: theme?.TEXT_SECONDARY }}>
            No GIFs found. Try a different search term.
          </div>
        ) : (
          <Grid container spacing={2}>
            {memoizedGifs.map((gif) => (
              <Grid item xs={6} sm={4} key={gif.id}>
                <IconButton
                  onClick={() => {
                    onSelect(gif.fullUrl); // Send full GIF URL
                    onClose();
                  }}
                  sx={{ 
                    padding: 0,
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'scale(1.05)',
                      transition: 'transform 0.2s ease-in-out',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <img
                    src={gif.previewUrl} // Shows animated GIF preview
                    alt={gif.title}
                    loading="lazy"
                    onLoad={() => handleImageLoad(gif.id)}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      borderRadius: 8,
                      height: 120,
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'opacity 0.3s ease-in-out',
                      opacity: loadedImages.has(gif.id) ? 1 : 0.5,
                      cursor: 'pointer'
                    }}
                  />
                </IconButton>
              </Grid>
            ))}
          </Grid>
        )}
      </div>
    </Dialog>
  );
};

export default GifPicker;
