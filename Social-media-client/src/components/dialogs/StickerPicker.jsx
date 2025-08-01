import React from "react";
import { Dialog, DialogTitle, Grid, IconButton } from "@mui/material";

// Example sticker URLs (replace with your own)
// Genshin Impact Animated Stickers (local)
const stickers = [
  // Genshin Impact Animated Stickers
  "/Genshin Impact Animated Stickers/hutao-bye_128x128_discord_alpha.gif",
  "/Genshin Impact Animated Stickers/qiqi-observe_128x128px_alpha.gif",
  "/Genshin Impact Animated Stickers/raiden-eating_128x128px_alpha.gif",
  "/Genshin Impact Animated Stickers/sara-command_128x128px_alpha.gif",
  "/Genshin Impact Animated Stickers/shinobu-surprised_128x128px_alpha.gif",
  "/Genshin Impact Animated Stickers/xiao-mask_128x128px_alpha.gif",
  "/Genshin Impact Animated Stickers/xinyan-fire_128x128px_alpha.gif",
  "/Genshin Impact Animated Stickers/yae-smirk_128x128px_alpha.gif",
  "/Genshin Impact Animated Stickers/yanfei-objection_128x128px_alpha.gif",
  "/Genshin Impact Animated Stickers/yunjin-peace_128x128px_alpha.gif",
  // Honkai Star Rail Animated Stickers (actual file names)
  "/Honkai Star Rail Animated Stickers-20250801T212443Z-1-001/Honkai Star Rail Animated Stickers/kafka boom.gif",
  "/Honkai Star Rail Animated Stickers-20250801T212443Z-1-001/Honkai Star Rail Animated Stickers/march 7th ok.gif",
  "/Honkai Star Rail Animated Stickers-20250801T212443Z-1-001/Honkai Star Rail Animated Stickers/asta ok.gif",
  "/Honkai Star Rail Animated Stickers-20250801T212443Z-1-001/Honkai Star Rail Animated Stickers/boothill pinch.gif",
  "/Honkai Star Rail Animated Stickers-20250801T212443Z-1-001/Honkai Star Rail Animated Stickers/clara pleading.gif",
  "/Honkai Star Rail Animated Stickers-20250801T212443Z-1-001/Honkai Star Rail Animated Stickers/feixiao lift.gif",
  "/Honkai Star Rail Animated Stickers-20250801T212443Z-1-001/Honkai Star Rail Animated Stickers/herta cool.gif",
  "/Honkai Star Rail Animated Stickers-20250801T212443Z-1-001/Honkai Star Rail Animated Stickers/jade whip.gif",
  "/Honkai Star Rail Animated Stickers-20250801T212443Z-1-001/Honkai Star Rail Animated Stickers/jingyuan angry.gif",
];

const StickerPicker = ({ open, onClose, onSelect }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Select a Sticker</DialogTitle>
    <Grid container spacing={2} padding={2}>
      {stickers.map((url, idx) => (
        <Grid item key={idx}>
          <IconButton onClick={() => { onSelect(url); onClose(); }}>
            <img src={url} alt="sticker" style={{ width: 64, height: 64 }} />
          </IconButton>
        </Grid>
      ))}
    </Grid>
  </Dialog>
);

export default StickerPicker;
