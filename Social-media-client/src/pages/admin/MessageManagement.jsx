import { Avatar, Box, Stack, Skeleton, TextField, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import RenderAttachment from "../../components/shared/RenderAttachment";
import Table from "../../components/shared/Table";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import { fileFormat, transformImage } from "../../lib/features";

const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "attachments",
    headerName: "Attachments",
    headerClassName: "table-header",
    width: 200,
    renderCell: (params) => {
      const { attachments } = params.row;

      return attachments?.length > 0
        ? attachments.map((i) => {
            const url = i.url;
            const file = fileFormat(url);

            return (
              <Box>
                <a
                  href={url}
                  download
                  target="_blank"
                  style={{
                    color: "black",
                  }}
                >
                  {RenderAttachment(file, url)}
                </a>
              </Box>
            );
          })
        : "No Attachments";
    },
  },

  {
    field: "content",
    headerName: "Content",
    headerClassName: "table-header",
    width: 400,
  },
  {
    field: "sender",
    headerName: "Sent By",
    headerClassName: "table-header",
    width: 200,
    renderCell: (params) => (
      <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
        <Avatar alt={params.row.sender.name} src={params.row.sender.avatar} />
        <span>{params.row.sender.name}</span>
      </Stack>
    ),
  },
  {
    field: "sendTo",
    headerName: "Send To",
    headerClassName: "table-header",
    width: 300,
    renderCell: (params) => (
      <span>{params.row.sendTo}</span>
    ),
  },
  {
    field: "chat",
    headerName: "Chat",
    headerClassName: "table-header",
    width: 220,
  },
  {
    field: "groupChat",
    headerName: "Group Chat",
    headerClassName: "table-header",
    width: 100,
  },
  {
    field: "createdAt",
    headerName: "Time",
    headerClassName: "table-header",
    width: 250,
  },
];

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
        <div
          style={{
            background: "#1a2e2b",
            minHeight: "100vh",
            padding: "2rem",
          }}
        >
          <Box sx={{ mb: 3, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <TextField
              placeholder="Search messages by content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                flex: 1,
                minWidth: "300px",
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
                minWidth: "300px",
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
          
          <Table
            heading={"All Messages"}
            columns={columns}
            rows={rows}
            rowHeight={200}
            headerStyle={{ background: "#234e4d", color: "#ffd600" }}
            rowStyle={{ background: "#a3c7e6" }}
            serverPagination
            loading={loading}
            rowCount={rowCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[25, 50, 100, 200]}
          />
        </div>
      )}
    </AdminLayout>
  );
};

export default MessageManagement;
