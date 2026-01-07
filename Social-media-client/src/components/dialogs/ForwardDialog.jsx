import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import React, { useState, useMemo } from "react";
import { useMyChatsQuery, useForwardMessageMutation } from "../../redux/api/api";
import toast from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";

const ForwardDialog = ({ open, onClose, messageId }) => {
  const { theme } = useTheme();
  const [selectedChats, setSelectedChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: chatsData, isLoading } = useMyChatsQuery("");
  const [forwardMessage, { isLoading: isForwarding }] = useForwardMessageMutation();

  const chats = useMemo(() => chatsData?.chats || [], [chatsData]);

  // Filter chats based on search
  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter((chat) =>
      chat.name.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  const handleToggle = (chatId) => {
    setSelectedChats((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleForward = async () => {
    if (selectedChats.length === 0) {
      toast.error("Please select at least one chat");
      return;
    }

    if (selectedChats.length > 10) {
      toast.error("You can forward to maximum 10 chats at a time");
      return;
    }

    try {
      const result = await forwardMessage({
        messageId,
        targetChatIds: selectedChats,
      }).unwrap();

      toast.success(result.message || "Message forwarded successfully");
      setSelectedChats([]);
      setSearchQuery("");
      onClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to forward message");
    }
  };

  const handleClose = () => {
    setSelectedChats([]);
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: theme.DIALOG_BG,
          color: theme.TEXT_PRIMARY,
        },
      }}
    >
      <DialogTitle sx={{ color: theme.PRIMARY_COLOR }}>
        Forward Message
      </DialogTitle>
      <DialogContent>
        {/* Search Box */}
        <TextField
          fullWidth
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              color: theme.TEXT_PRIMARY,
              "& fieldset": {
                borderColor: theme.TEXT_SECONDARY,
              },
              "&:hover fieldset": {
                borderColor: theme.PRIMARY_COLOR,
              },
              "&.Mui-focused fieldset": {
                borderColor: theme.PRIMARY_COLOR,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.TEXT_SECONDARY }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Chat List */}
        {isLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : filteredChats.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ textAlign: "center", py: 3, color: theme.TEXT_SECONDARY }}
          >
            {searchQuery ? "No chats found" : "No chats available"}
          </Typography>
        ) : (
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {filteredChats.map((chat) => (
              <ListItem key={chat._id} disablePadding>
                <ListItemButton
                  onClick={() => handleToggle(chat._id)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    "&:hover": {
                      bgcolor: theme.SUBTLE_BG_20,
                    },
                  }}
                >
                  <Checkbox
                    edge="start"
                    checked={selectedChats.includes(chat._id)}
                    tabIndex={-1}
                    disableRipple
                    sx={{
                      color: theme.TEXT_SECONDARY,
                      "&.Mui-checked": {
                        color: theme.PRIMARY_COLOR,
                      },
                    }}
                  />
                  {!chat.groupChat && (
                    <ListItemAvatar>
                      <Avatar
                        src={Array.isArray(chat.avatar) ? chat.avatar[0] : chat.avatar}
                        alt={chat.name}
                        sx={{
                          bgcolor: theme.PRIMARY_COLOR,
                        }}
                      >
                        {chat.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                  )}
                  <ListItemText
                    primary={chat.name}
                    secondary={
                      chat.groupChat
                        ? `${chat.members.length} members`
                        : "Personal chat"
                    }
                    primaryTypographyProps={{
                      color: theme.PROFILE_USERNAME_COLOR,
                      fontWeight: 600,
                    }}
                    secondaryTypographyProps={{
                      color: theme.TEXT_SECONDARY,
                    }}
                    sx={{
                      ml: chat.groupChat ? 0 : undefined,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        {selectedChats.length > 0 && (
          <Typography
            variant="caption"
            sx={{ mt: 1, display: "block", color: theme.TEXT_SECONDARY }}
          >
            {selectedChats.length} chat{selectedChats.length > 1 ? "s" : ""} selected
            {selectedChats.length >= 10 && " (maximum reached)"}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleClose}
          sx={{ color: theme.TEXT_SECONDARY }}
          disabled={isForwarding}
        >
          Cancel
        </Button>
        <Button
          onClick={handleForward}
          variant="contained"
          disabled={selectedChats.length === 0 || isForwarding}
          sx={{
            background: theme.BUTTON_ACCENT,
            color: theme.TEXT_ON_ACCENT,
            "&:hover": {
              background: theme.BUTTON_ACCENT,
              opacity: 0.9,
            },
            "&:disabled": {
              bgcolor: theme.SUBTLE_BG_20,
              color: theme.TEXT_SECONDARY,
            },
          }}
        >
          {isForwarding ? (
            <CircularProgress size={24} />
          ) : (
            `Forward${selectedChats.length > 0 ? ` (${selectedChats.length})` : ""}`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ForwardDialog;
