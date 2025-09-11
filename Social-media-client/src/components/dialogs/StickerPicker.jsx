
import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, Grid, IconButton, Tabs, Tab, Box } from "@mui/material";
import SwipeableViews from 'react-swipeable-views';

const manifestUrl = "/assets/stickerManifest.json";

const StickerPicker = ({ open, onClose, onSelect }) => {
  const [manifest, setManifest] = useState({});
  const [character, setCharacter] = useState("");
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    fetch(manifestUrl)
      .then((res) => res.json())
      .then((data) => {
        setManifest(data);
        const chars = Object.keys(data);
        if (chars.length > 0) {
          setCharacter(chars[0]);
        }
      });
  }, []);

  const handleTabChange = (event, newValue) => {
    const chars = Object.keys(manifest);
    setTabIndex(newValue);
    setCharacter(chars[newValue]);
  };

  const handleSwipeIndexChange = (index) => {
    const chars = Object.keys(manifest);
    setTabIndex(index);
    setCharacter(chars[index]);
  };

  const chars = Object.keys(manifest);
  const stickers = character ? manifest[character] : [];

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxWidth: 600,
          width: '95vw',
          '@media (max-width: 600px)': {
            maxWidth: '90vw',
            minWidth: 0,
            width: '90vw',
          },
        }
      }}
    >
      <DialogTitle
        sx={{
          fontSize: { xs: 14, sm: 16 },
          padding: { xs: '8px 10px', sm: '12px 16px' },
        }}
      >
        Select a Sticker
      </DialogTitle>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          width: '100%',
          px: { xs: 1, sm: 1 },
          py: { xs: 0.5, sm: 0.5 },
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="character tabs"
          TabIndicatorProps={{ style: { height: 2 } }}
          sx={{
            minHeight: 36,
            height: 36,
            '& .MuiTab-root': {
              minWidth: 60,
              padding: '6px 8px',
              fontSize: 12,
              '@media (max-width: 600px)': {
                minWidth: 50,
                fontSize: 11,
                padding: '4px 6px',
              },
            },
          }}
        >
          {chars.map((char, idx) => (
            <Tab key={char} label={char} sx={{ textTransform: 'none' }} />
          ))}
        </Tabs>
      </Box>
      <SwipeableViews
        index={tabIndex}
        onChangeIndex={handleSwipeIndexChange}
        enableMouseEvents
        style={{ 
          minHeight: 'auto'
        }}
      >
        {chars.map((char, tabIdx) => (
          <div
            key={char}
            style={{
              maxHeight: 250,
              overflow: 'auto',
              padding: '8px'
            }}
          >
            <Grid
              container
              spacing={{ xs: 1, sm: 1.5 }}
              sx={{
                '@media (max-width: 600px)': {
                  padding: 0,
                },
              }}
            >
            {manifest[char] && manifest[char].map((file, idx) => (
              <Grid
                item
                key={idx}
                xs={4} sm={3} md={2} lg={2}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <IconButton
                  onClick={() => { onSelect(file); onClose(); }}
                  sx={{
                    padding: 1,
                    '@media (max-width: 600px)': {
                      padding: 0.5,
                    },
                  }}
                >
                  <img
                    src={file}
                    alt={file}
                    loading="lazy"
                    style={{
                      width: window.innerWidth <= 600 ? 70 : 100,
                      height: window.innerWidth <= 600 ? 70 : 100,
                      objectFit: 'contain',
                      borderRadius: 6,
                    }}
                  />
                </IconButton>
              </Grid>
            ))}
            </Grid>
          </div>
        ))}
      </SwipeableViews>
    </Dialog>
  );
};

export default StickerPicker;
