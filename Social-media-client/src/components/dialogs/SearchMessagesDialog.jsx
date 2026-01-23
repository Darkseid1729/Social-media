import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  InputAdornment,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from "@mui/icons-material";
import { useTheme } from "../../context/ThemeContext";
import axios from "axios";
import { server } from "../../constants/config";
import toast from "react-hot-toast";
import moment from "moment";

const SearchMessagesDialog = ({ open, onClose, chatId, onMessageClick }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSelectedIndex(-1);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const { data } = await axios.get(
        `${server}/api/v1/chat/search/${chatId}?search=${encodeURIComponent(query)}`,
        { withCredentials: true }
      );
      setSearchResults(data.messages || []);
      setSelectedIndex(data.messages?.length > 0 ? 0 : -1);
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error.response?.data?.message || "Search failed");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateNext = () => {
    if (selectedIndex < searchResults.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      handleResultClick(searchResults[newIndex]);
    }
  };

  const handleNavigatePrev = () => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      handleResultClick(searchResults[newIndex]);
    }
  };

  const handleResultClick = (message) => {
    if (onMessageClick) {
      onMessageClick(message._id);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedIndex(-1);
    onClose();
  };

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} style={{ backgroundColor: theme.searchHighlight || "#ffeb3b", fontWeight: "bold" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: theme.dialogBackground,
          color: theme.text,
          borderRadius: "12px",
          maxHeight: "80vh",
        },
      }}
    >
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${theme.divider}`,
          backgroundColor: theme.paper,
        }}
      >
        <Typography variant="h6" sx={{ flexGrow: 1, color: theme.text }}>
          Search Messages
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: theme.text }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 2, backgroundColor: theme.paper }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="Search in this chat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.textSecondary }} />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
            sx: {
              backgroundColor: theme.inputBackground,
              color: theme.text,
              borderRadius: "20px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.divider,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.primary,
              },
            },
          }}
          sx={{
            "& .MuiInputBase-input::placeholder": {
              color: theme.textSecondary,
              opacity: 1,
            },
          }}
        />

        {searchResults.length > 0 && (
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="body2" sx={{ color: theme.textSecondary }}>
              {searchResults.length} {searchResults.length === 1 ? "result" : "results"} found
              {selectedIndex >= 0 && ` (${selectedIndex + 1}/${searchResults.length})`}
            </Typography>
            <Box>
              <IconButton
                size="small"
                onClick={handleNavigatePrev}
                disabled={selectedIndex <= 0}
                sx={{ color: theme.text }}
              >
                <ArrowUpIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleNavigateNext}
                disabled={selectedIndex >= searchResults.length - 1}
                sx={{ color: theme.text }}
              >
                <ArrowDownIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      <DialogContent sx={{ p: 0, backgroundColor: theme.background }}>
        {searchResults.length > 0 ? (
          <List sx={{ py: 0 }}>
            {searchResults.map((message, index) => (
              <React.Fragment key={message._id}>
                <ListItem
                  button
                  onClick={() => {
                    setSelectedIndex(index);
                    handleResultClick(message);
                  }}
                  selected={selectedIndex === index}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: theme.selectedBackground || theme.hover,
                    },
                    "&:hover": {
                      backgroundColor: theme.hover,
                    },
                    py: 2,
                  }}
                >
                  <Avatar
                    src={message.sender?.avatar}
                    sx={{ mr: 2, width: 40, height: 40 }}
                  >
                    {message.sender?.name?.[0]}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ color: theme.text, fontWeight: 600 }}>
                          {message.sender?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.textSecondary }}>
                          {moment(message.createdAt).format("MMM D, h:mm A")}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.textSecondary,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {highlightText(message.content, searchQuery)}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < searchResults.length - 1 && (
                  <Divider sx={{ backgroundColor: theme.divider }} />
                )}
              </React.Fragment>
            ))}
          </List>
        ) : searchQuery && !loading ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              color: theme.textSecondary,
            }}
          >
            <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1">No messages found</Typography>
            <Typography variant="body2">Try different keywords</Typography>
          </Box>
        ) : !searchQuery ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              color: theme.textSecondary,
            }}
          >
            <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body1">Search messages in this chat</Typography>
            <Typography variant="body2">Type to start searching...</Typography>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default SearchMessagesDialog;
