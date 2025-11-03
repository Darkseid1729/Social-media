import React, { useState, memo } from "react";
import { Box } from "@mui/material";
import { transformImage } from "../../lib/features";
import ImageLightboxDialog from "./ImageLightboxDialog";

/**
 * Responsive image grid for message attachments
 * - 1 image: large preview
 * - 2 images: 2 columns
 * - 3 images: 2 columns, last spans full width
 * - 4 images: 2x2 grid
 * - >4 images: show first 4 with "+N" overlay on the last
 */
const ImageGrid = ({ images = [] }) => {
  const [lightbox, setLightbox] = useState({ open: false, index: 0 });

  if (!images.length) return null;

  const count = images.length;
  const visible = images.slice(0, 4);

  const handleOpen = (index) => setLightbox({ open: true, index });
  const handleClose = () => setLightbox({ open: false, index: 0 });

  // Grid template
  const gridTemplateColumns = count === 1 ? "1fr" : "repeat(2, 1fr)";

  return (
    <>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns,
          gap: 0.5,
          width: "100%",
          maxWidth: count === 1 ? { xs: 220, sm: 320 } : { xs: 260, sm: 420 },
          // Set base row height; items can span to create layout variants
          gridAutoRows: { xs: 90, sm: 120 },
        }}
      >
        {visible.map((att, idx) => {
          const url = att.url || att; // support array of strings or objects
          const isGif = url.toLowerCase().endsWith(".gif");
          const thumb = isGif ? url : transformImage(url, 400);

          // Layout rules
          let sx = {
            position: "relative",
            cursor: "pointer",
            borderRadius: 1,
            overflow: "hidden",
            boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
          };

          if (count === 1) {
            // Big single preview - constrained to fit in message
            sx = {
              ...sx,
              gridColumn: "1 / -1",
              height: { xs: 160, sm: 220 },
              maxHeight: { xs: 200, sm: 280 },
            };
          } else if (count === 3 && idx === 2) {
            // Last spans full width
            sx = {
              ...sx,
              gridColumn: "1 / -1",
              height: { xs: 120, sm: 160 },
            };
          } else {
            // Default tile size
            sx = {
              ...sx,
              height: { xs: 100, sm: 140 },
            };
          }

          const extraCount = count > 4 && idx === 3 ? count - 4 : 0;

          return (
            <Box key={idx} sx={sx} onClick={() => handleOpen(idx)}>
              <Box
                component="img"
                src={thumb}
                alt={`attachment-${idx + 1}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  userSelect: "none",
                }}
                loading="lazy"
                draggable={false}
              />

              {extraCount > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 600,
                    fontSize: { xs: 20, sm: 24 },
                  }}
                >
                  +{extraCount}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Full-screen lightbox with slider for multiple images */}
      <ImageLightboxDialog
        open={lightbox.open}
        onClose={handleClose}
        images={images}
        initialIndex={lightbox.index}
      />
    </>
  );
};

export default memo(ImageGrid);
