import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const ConfirmDialog = ({
  open,
  confirmBoxRef,
  icon = <InfoOutlinedIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />,
  title = "Confirm",
  message = "Are you sure?",
  onConfirm,
  onCancel,
  confirmText = "Yes",
  cancelText = "No",
  ...boxProps
}) => {
  if (!open) return null;
  return (
    <Box
      ref={confirmBoxRef}
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        p: 4,
        borderRadius: 3,
        boxShadow: 24,
        zIndex: 9999,
        minWidth: 320,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        ...boxProps.sx,
      }}
      {...boxProps}
    >
      {icon}
      <Typography variant="h6" fontWeight={600} mb={1} color="primary.main">
        {title}
      </Typography>
      <Typography variant="body1" mb={2} color="text.secondary" align="center">
        {message}
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center">
        <Button variant="contained" color="primary" onClick={onConfirm} sx={{ minWidth: 90 }}>
          {confirmText}
        </Button>
        <Button variant="outlined" color="secondary" onClick={onCancel} sx={{ minWidth: 90 }}>
          {cancelText}
        </Button>
      </Stack>
    </Box>
  );
};

export default ConfirmDialog;
