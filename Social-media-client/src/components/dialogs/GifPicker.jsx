import React, { useState } from "react";
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

  const fetchGifs = async (query) => {
    if (query.trim().length === 0) {
      setGifs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(query)}&api_key=${GIPHY_API_KEY}&limit=20`
      );
      if (!res.ok) throw new Error('Giphy error');
      const data = await res.json();
      if (!Array.isArray(data.data)) throw new Error('Giphy error');
      setGifs(data.data.map(gif => ({
        id: gif.id,
        url: gif.images.fixed_height.url,
        title: gif.title
      })));
      setLoading(false);
    } catch (err) {
      // Fallback to Tenor
      try {
        const res = await fetch(
          `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=20`
        );
        if (!res.ok) throw new Error('Tenor error');
        const data = await res.json();
        if (!Array.isArray(data.results)) throw new Error('Tenor error');
        setGifs(data.results.map(gif => ({
          id: gif.id,
          url: gif.media_formats.gif.url,
          title: gif.content_description || 'GIF'
        })));
        setLoading(false);
      } catch (err2) {
        setGifs([]);
        setLoading(false);
      }
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    setDebounceTimeout(
      setTimeout(() => {
        fetchGifs(value);
      }, 400)
    );
  };

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
      <DialogTitle sx={{ pb: 1, color: theme?.TEXT_PRIMARY }}>Search GIFs</DialogTitle>
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
            Loading GIFs...
          </div>
        ) : gifs.length === 0 && search.trim().length > 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 0', color: theme?.TEXT_SECONDARY }}>
            No GIFs found. Please check your API keys or network.
          </div>
        ) : (
          <Grid container spacing={2}>
            {gifs.map((gif) => (
              <Grid item xs={6} sm={4} key={gif.id}>
                <IconButton
                  onClick={() => {
                    onSelect(gif.url);
                    onClose();
                  }}
                  sx={{ padding: 0 }}
                >
                  <img
                    src={gif.url}
                    alt={gif.title}
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      borderRadius: 8,
                      maxHeight: 120,
                      objectFit: 'cover',
                      display: 'block',
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
