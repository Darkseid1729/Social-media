import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, IconButton, Box, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DownloadIcon from "@mui/icons-material/Download";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { transformImage } from "../../lib/features";

const clampIndex = (i, len) => (len === 0 ? 0 : (i + len) % len);

import { forwardRef } from "react";
const Slide = forwardRef(({ src, direction }, ref) => {
  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 })
  };

  return (
    <motion.img
      key={src}
      ref={ref}
      src={src}
      alt="preview"
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.2, ease: "easeOut" }}
      style={{
        maxWidth: "92vw",
        maxHeight: "80vh",
        borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        objectFit: "contain",
        userSelect: "none",
      }}
      draggable={false}
    />
  );
});

const ImageLightboxDialog = ({ open, images = [], initialIndex = 0, onClose }) => {
  const { theme } = useTheme();
  const [index, setIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0); // -1 left, +1 right
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const total = images.length;

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const normalized = images.map((item) => {
    const url = item?.url || item;
    const isGif = typeof url === "string" && url.toLowerCase().endsWith(".gif");
    // Use a larger transform for non-GIFs for better quality in lightbox
    return isGif ? url : transformImage(url, 1280);
  });

  const currentSrc = normalized[clampIndex(index, total)];

  const neighbors = useMemo(() => {
    if (total < 2) return [];
    const prevSrc = normalized[clampIndex(index - 1, total)];
    const nextSrc = normalized[clampIndex(index + 1, total)];
    return [prevSrc, nextSrc].filter(Boolean);
  }, [normalized, index, total]);

  useEffect(() => {
    neighbors.forEach((n) => {
      const img = new Image();
      img.src = n;
    });
  }, [neighbors]);

  const handlePrev = () => {
    if (total <= 1) return;
    setDirection(-1);
    setIndex((i) => clampIndex(i - 1, total));
  };
  const handleNext = () => {
    if (total <= 1) return;
    setDirection(1);
    setIndex((i) => clampIndex(i + 1, total));
  };

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const x = e.changedTouches[0].clientX;
    const y = e.changedTouches[0].clientY;
    const dx = x - touchStartX.current;
    const dy = y - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;

    if (Math.abs(dx) > 60 && Math.abs(dy) < 40) {
      if (dx < 0) handleNext();
      else handlePrev();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          backgroundColor: "rgba(0,0,0,0.96)",
          display: "flex",
        },
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1,
          zIndex: 2,
          background: "linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0))",
        }}
      >
        <Typography variant="body2" sx={{ color: "#fff", ml: 1 }}>
          {total > 0 ? `${clampIndex(index, total) + 1} / ${total}` : ""}
        </Typography>
        <Box>
          {currentSrc && (
            <IconButton
              aria-label="download"
              size="small"
              component="a"
              href={currentSrc}
              target="_blank"
              download
              sx={{ color: "#fff" }}
            >
              <DownloadIcon />
            </IconButton>
          )}
          <IconButton aria-label="close" onClick={onClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Slider area */}
      <Box
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          px: { xs: 2, sm: 4 },
        }}
      >
        {/* Prev/Next controls */}
        {total > 1 && (
          <>
            <IconButton
              aria-label="previous"
              onClick={handlePrev}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.35)",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              aria-label="next"
              onClick={handleNext}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#fff",
                backgroundColor: "rgba(0,0,0,0.35)",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}

        {/* Animated slide */}
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          {currentSrc && <Slide src={currentSrc} direction={direction} />}
        </AnimatePresence>
      </Box>
    </Dialog>
  );
};

export default ImageLightboxDialog;
