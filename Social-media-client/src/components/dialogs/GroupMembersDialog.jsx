import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import GroupMembersList from "../specific/GroupMembersList";
import { useTheme } from "../../context/ThemeContext";
import { themes } from "../../constants/themes";

const GroupMembersDialog = ({ open, onClose, members, currentUserId }) => {
  const { themeName } = useTheme();
  const theme = themes[themeName];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: theme.APP_OVERLAY,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: theme.TEXT_PRIMARY,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        Group Members ({members?.length || 0})
        <IconButton
          onClick={onClose}
          sx={{
            color: theme.TEXT_PRIMARY,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <GroupMembersList members={members} currentUserId={currentUserId} showTitle={false} />
      </DialogContent>
    </Dialog>
  );
};

export default GroupMembersDialog;
