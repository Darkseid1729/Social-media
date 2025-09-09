
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select a Sticker</DialogTitle>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          maxWidth: '100vw',
          '@media (max-width: 600px)': {
            padding: 0,
          },
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="character tabs"
          TabIndicatorProps={{ style: { height: 3 } }}
          sx={{
            minHeight: 36,
            height: 36,
            '& .MuiTab-root': {
              minWidth: 80,
              padding: '6px 8px',
              fontSize: 13,
              '@media (max-width: 600px)': {
                minWidth: 60,
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
        style={{ minHeight: 200 }}
      >
        {chars.map((char, tabIdx) => (
          <Grid
            container
            key={char}
            spacing={1.5}
            padding={1.5}
            sx={{
              '@media (max-width: 600px)': {
                padding: '4px',
              },
            }}
          >
            {manifest[char] && manifest[char].map((file, idx) => (
              <Grid
                item
                key={idx}
                xs={3} sm={2} md={2} lg={1}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <IconButton
                  onClick={() => { onSelect(file); onClose(); }}
                  sx={{
                    padding: 0.5,
                    '@media (max-width: 600px)': {
                      padding: 0.25,
                    },
                  }}
                >
                  <img
                    src={file}
                    alt={file}
                    loading="lazy"
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: 'contain',
                      borderRadius: 6,
                      '@media (max-width: 600px)': {
                        width: 36,
                        height: 36,
                      },
                    }}
                  />
                </IconButton>
              </Grid>
            ))}
          </Grid>
        ))}
      </SwipeableViews>
    </Dialog>
  );
};

export default StickerPicker;
