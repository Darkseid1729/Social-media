import { Avatar, Box, Stack, Skeleton, TextField, InputAdornment, Typography, Dialog, DialogContent, IconButton, Badge, Link, Chip } from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon, ChevronLeft, ChevronRight, Image as ImageIcon, Gif as GifIcon, EmojiEmotions as StickerIcon } from "@mui/icons-material";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import RenderAttachment from "../../components/shared/RenderAttachment";
import Table from "../../components/shared/Table";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import { fileFormat, transformImage } from "../../lib/features";
import toast from "react-hot-toast";

const AttachmentViewer = ({ attachments, open, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % attachments.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + attachments.length) % attachments.length);
  };

  if (!attachments || attachments.length === 0) return null;

  const currentAttachment = attachments[currentIndex];
  const url = currentAttachment.url;
  const file = fileFormat(url);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent sx={{ bgcolor: "#1a2e2b", position: "relative", p: 2 }}>
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "#ffd600", zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
        
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
          {attachments.length > 1 && (
            <IconButton onClick={handlePrev} sx={{ color: "#ffd600" }}>
              <ChevronLeft sx={{ fontSize: 40 }} />
            </IconButton>
          )}
          
          <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
            {file === "image" || url.endsWith('.gif') ? (
              <img
                src={url}
                alt="Attachment"
                style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain" }}
              />
            ) : file === "video" ? (
              <video src={url} controls style={{ maxWidth: "100%", maxHeight: "500px" }} />
            ) : file === "audio" ? (
              <audio src={url} controls />
            ) : (
              <Typography color="#fff">File attachment</Typography>
            )}
          </Box>
          
          {attachments.length > 1 && (
            <IconButton onClick={handleNext} sx={{ color: "#ffd600" }}>
              <ChevronRight sx={{ fontSize: 40 }} />
            </IconButton>
          )}
        </Box>
        
        <Typography align="center" sx={{ mt: 2, color: "#87d485ff" }}>
          {currentIndex + 1} / {attachments.length}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

const MessageManagement = () => {
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 50 });
  const [searchQuery, setSearchQuery] = useState("");
  const [chatIdFilter, setChatIdFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedChatId, setDebouncedChatId] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);

  const handleOpenViewer = (attachments) => {
    setSelectedAttachments(attachments);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setSelectedAttachments([]);
  };

  const columnsWithViewer = useMemo(() => [
    {
      field: "id",
      headerName: "ID",
      headerClassName: "table-header",
      width: 120,
    },
    {
      field: "attachments",
      headerName: "Attachments",
      headerClassName: "table-header",
      width: 120,
      renderCell: (params) => {
        const { attachments } = params.row;

        if (!attachments || attachments.length === 0) {
          return "No Attachments";
        }

        const firstAttachment = attachments[0];
        const url = firstAttachment.url;
        const file = fileFormat(url);

        // If only one attachment, show it directly but make it clickable
        if (attachments.length === 1) {
          return (
            <Box 
              onClick={() => handleOpenViewer(attachments)}
              sx={{ display: "inline-block", cursor: "pointer" }}
            >
              {RenderAttachment(file, url)}
            </Box>
          );
        }

        // If multiple attachments, show icon with badge and open dialog on click
        return (
          <Box 
            onClick={() => handleOpenViewer(attachments)}
            sx={{ cursor: "pointer", position: "relative", display: "inline-block" }}
          >
            <Badge 
              badgeContent={attachments.length} 
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  bgcolor: "#ffd600",
                  color: "#000",
                  fontWeight: "bold"
                }
              }}
            >
              {file === "image" || url.endsWith('.gif') ? (
                <ImageIcon sx={{ fontSize: 40, color: "#234e4d" }} />
              ) : (
                RenderAttachment(file, url)
              )}
            </Badge>
          </Box>
        );
      },
    },
    {
      field: "content",
      headerName: "Content",
      headerClassName: "table-header",
      width: 350,
      renderCell: (params) => {
        // Check deletedAt field - it will have a date object/string when deleted, null when not
        const isDeleted = Boolean(params.row.deletedAt);
        const content = params.row.content || "";
        
        // Check if content is a GIF or sticker URL
        const isGiphyGif = content.includes('giphy.com') || content.includes('tenor.com');
        const isSticker = content.includes('cloudinary.com') && (content.includes('/stickers/') || content.includes('sticker'));
        const isYouTube = content.includes('youtube.com') || content.includes('youtu.be');
        
        // Extract URL from content if it contains one
        const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[0] : null;
        
        return (
          <Box sx={{ width: "100%", py: 1 }}>
            {isDeleted ? (
              <Typography
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.5,
                  px: 1,
                  bgcolor: "#ffe6e6",
                  borderRadius: 1,
                  color: "#ff0000",
                  fontWeight: "600",
                  fontStyle: "italic",
                  border: "1px solid #ff0000",
                  overflowWrap: "break-word",
                }}
              >
                {content || "[Deleted Message]"}
              </Typography>
            ) : (
              <>
                {/* Show media type indicator */}
                {(isGiphyGif || isSticker || isYouTube) && (
                  <Box sx={{ mb: 0.5 }}>
                    {isGiphyGif && (
                      <Chip
                        icon={<GifIcon />}
                        label="GIF"
                        size="small"
                        sx={{ 
                          bgcolor: "#9c27b0", 
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "0.7rem",
                          height: "20px",
                          mr: 0.5
                        }}
                      />
                    )}
                    {isSticker && (
                      <Chip
                        icon={<StickerIcon />}
                        label="Sticker"
                        size="small"
                        sx={{ 
                          bgcolor: "#ff9800", 
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "0.7rem",
                          height: "20px",
                          mr: 0.5
                        }}
                      />
                    )}
                    {isYouTube && (
                      <Chip
                        label="YouTube"
                        size="small"
                        sx={{ 
                          bgcolor: "#ff0000", 
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "0.7rem",
                          height: "20px"
                        }}
                      />
                    )}
                  </Box>
                )}
                
                {/* Show content with clickable link if URL exists */}
                {url ? (
                  <Box>
                    <Link
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: "#1976d2",
                        textDecoration: "none",
                        wordBreak: "break-all",
                        fontSize: "0.875rem",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      {url}
                    </Link>
                    {/* Show additional text if content has more than just the URL */}
                    {content.replace(url, "").trim() && (
                      <Typography
                        sx={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          lineHeight: 1.5,
                          mt: 0.5,
                          fontSize: "0.875rem",
                        }}
                      >
                        {content.replace(url, "").trim()}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography
                    sx={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      lineHeight: 1.5,
                      overflowWrap: "break-word",
                      fontSize: "0.875rem",
                    }}
                  >
                    {content}
                  </Typography>
                )}
              </>
            )}
          </Box>
        );
      },
    },
    {
      field: "sender",
      headerName: "Sent By",
      headerClassName: "table-header",
      width: 100,
      renderCell: (params) => (
        <Stack direction={"row"} spacing={"0.5rem"} alignItems={"center"}>
          <Avatar alt={params.row.sender.name} src={params.row.sender.avatar} sx={{ width: 30, height: 30 }} />
          <span style={{ fontSize: "0.875rem" }}>{params.row.sender.name}</span>
        </Stack>
      ),
    },
    {
      field: "sendTo",
      headerName: "Send To",
      headerClassName: "table-header",
      width: 100,
      renderCell: (params) => (
        <span style={{ fontSize: "0.875rem" }}>{params.row.sendTo}</span>
      ),
    },
    {
      field: "chat",
      headerName: "Chat",
      headerClassName: "table-header",
      width: 120,
    },
    {
      field: "groupChat",
      headerName: "Group",
      headerClassName: "table-header",
      width: 80,
    },
    {
      field: "createdAt",
      headerName: "Time",
      headerClassName: "table-header",
      width: 180,
    },
  ], []);

  useErrors([
    {
      isError: !!error,
      error: error,
    },
  ]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset to page 0 when search changes
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce chat ID filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedChatId(chatIdFilter);
      // Reset to page 0 when filter changes
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [chatIdFilter]);

  const fetchPage = useCallback(async (page, pageSize, search, chatId) => {
    try {
      setLoading(true);
      setError(null);
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const chatIdParam = chatId ? `&chatId=${encodeURIComponent(chatId)}` : "";
      const url = `${server}/api/v1/admin/messages?page=${page + 1}&limit=${pageSize}${searchParam}${chatIdParam}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err?.message || "Failed to load messages");
      }
      const data = await res.json();
      setRowCount(data.totalMessages || 0);
      setRows(
        (data.messages || []).map((i) => ({
          ...i,
          id: i._id,
          sender: {
            name: i.sender?.name,
            avatar: transformImage(i.sender?.avatar, 50),
          },
          sendTo: i.sendTo,
          deletedAt: i.deletedAt,
          createdAt: moment(i.createdAt).format("MMMM Do YYYY, h:mm:ss a"),
        }))
      );
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(paginationModel.page, paginationModel.pageSize, debouncedSearch, debouncedChatId);
  }, [fetchPage, paginationModel.page, paginationModel.pageSize, debouncedSearch, debouncedChatId]);

  return (
    <AdminLayout>
      {loading && !rows.length ? (
        <Skeleton height={"100vh"} sx={{ bgcolor: "#1a2e2b" }} />
      ) : (
        <Box
          sx={{
            background: "#1a2e2b",
            minHeight: "100vh",
            padding: { xs: "0.5rem", sm: "1rem", md: "2rem" },
          }}
        >
          <Box sx={{ mb: { xs: 1, sm: 2, md: 3 }, display: "flex", gap: { xs: 1, sm: 2 }, justifyContent: "center", flexWrap: "wrap", px: { xs: 0.5, sm: 0 } }}>
            <TextField
              placeholder="Search messages by content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                minWidth: { xs: "200px", sm: "300px" },
                maxWidth: "500px",
                bgcolor: "#234e4d",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  "& fieldset": {
                    borderColor: "#ffd600",
                  },
                  "&:hover fieldset": {
                    borderColor: "#ffd600",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#ffd600",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#87d485ff",
                  opacity: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#ffd600" }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              placeholder="Filter by Chat ID..."
              value={chatIdFilter}
              onChange={(e) => setChatIdFilter(e.target.value)}
              sx={{
                flex: 1,
                minWidth: { xs: "200px", sm: "300px" },
                maxWidth: "500px",
                bgcolor: "#234e4d",
                borderRadius: 2,
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  "& fieldset": {
                    borderColor: "#ffd600",
                  },
                  "&:hover fieldset": {
                    borderColor: "#ffd600",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#ffd600",
                  },
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#87d485ff",
                  opacity: 1,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#ffd600" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <AttachmentViewer 
            attachments={selectedAttachments}
            open={viewerOpen}
            onClose={handleCloseViewer}
          />
          
          <Table
            heading={"All Messages"}
            columns={columnsWithViewer}
            rows={rows}
            getRowHeight={() => 'auto'}
            headerStyle={{ background: "#234e4d", color: "#ffd600" }}
            rowStyle={{ background: "#a3c7e6" }}
            serverPagination
            loading={loading}
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[25, 50, 100, 200]}
          />
        </Box>
      )}
    </AdminLayout>
  );
};

export default MessageManagement;
