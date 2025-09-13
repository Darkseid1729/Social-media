import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Dialog, DialogTitle, Input, Grid, IconButton } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";

const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY; // Giphy API key from .env
const TENOR_API_KEY = import.meta.env.VITE_TENOR_API_KEY; // Tenor API key from .env

const GifPicker = ({ open, onClose, onSelect }) => {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());

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
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=12&rating=g`
      );
      if (!res.ok) throw new Error('Giphy error');
      const data = await res.json();
      if (!Array.isArray(data.data)) throw new Error('Giphy error');
      setGifs(data.data.map(gif => ({
        id: gif.id,
        previewUrl: gif.images.fixed_height_small_still.url,
        fullUrl: gif.images.fixed_height.url,
        title: gif.title
      })));
      setLoading(false);
    } catch (err) {
      // Fallback to Tenor trending
      try {
        const res = await fetch(
          `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=12&contentfilter=high`
        );
        if (!res.ok) throw new Error('Tenor error');
        const data = await res.json();
        if (!Array.isArray(data.results)) throw new Error('Tenor error');
        setGifs(data.results.map(gif => ({
          id: gif.id,
          previewUrl: gif.media_formats.tinygif?.url || gif.media_formats.gif.url,
          fullUrl: gif.media_formats.gif.url,
          title: gif.content_description || 'GIF'
        })));
        setLoading(false);
      } catch (err2) {
        setGifs([]);
        setLoading(false);
      }
    }
  }, [GIPHY_API_KEY, TENOR_API_KEY]);

  const fetchGifs = useCallback(async (query) => {
    if (query.trim().length === 0) {
      setGifs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadedImages(new Set()); // Reset loaded images when searching
    
    try {
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(query)}&api_key=${GIPHY_API_KEY}&limit=16&rating=g`
      );
      if (!res.ok) throw new Error('Giphy error');
      const data = await res.json();
      if (!Array.isArray(data.data)) throw new Error('Giphy error');
      setGifs(data.data.map(gif => ({
        id: gif.id,
        // Use smaller preview image for faster loading, full GIF for selection
        previewUrl: gif.images.fixed_height_small_still.url,
        fullUrl: gif.images.fixed_height.url,
        title: gif.title
      })));
      setLoading(false);
    } catch (err) {
      // Fallback to Tenor
      try {
        const res = await fetch(
          `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=16&contentfilter=high`
        );
        if (!res.ok) throw new Error('Tenor error');
        const data = await res.json();
        if (!Array.isArray(data.results)) throw new Error('Tenor error');
        setGifs(data.results.map(gif => ({
          id: gif.id,
          // Use smaller preview image for faster loading
          previewUrl: gif.media_formats.tinygif?.url || gif.media_formats.gif.url,
          fullUrl: gif.media_formats.gif.url,
          title: gif.content_description || 'GIF'
        })));
        setLoading(false);
      } catch (err2) {
        setGifs([]);
        setLoading(false);
      }
    }
  }, [GIPHY_API_KEY, TENOR_API_KEY]);

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
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }}
                >
                  <img
                    src={gif.previewUrl} // Show static preview first
                    alt={gif.title}
                    loading="lazy"
                    onLoad={() => handleImageLoad(gif.id)}
                    onMouseEnter={(e) => {
                      // Show animated GIF on hover
                      e.target.src = gif.fullUrl;
                    }}
                    onMouseLeave={(e) => {
                      // Return to static preview when not hovering
                      e.target.src = gif.previewUrl;
                    }}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      borderRadius: 8,
                      maxHeight: 100, // Reduced height for faster loading
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'opacity 0.3s ease-in-out',
                      opacity: loadedImages.has(gif.id) ? 1 : 0.7,
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
