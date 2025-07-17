import React from "react";
import { Dialog, DialogContent, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const ImageDialog = ({ open, onClose, imageUrl, alt = "Image Preview" }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogContent
      sx={{
        position: 'relative',
        p: 1,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 350,
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
      >
        <CloseIcon />
      </IconButton>
      <img
        src={imageUrl}
        alt={alt}
        style={{ maxWidth: '100%', maxHeight: 520, borderRadius: 16, marginTop: 24 }}
      />
    </DialogContent>
  </Dialog>
);

export default ImageDialog;
