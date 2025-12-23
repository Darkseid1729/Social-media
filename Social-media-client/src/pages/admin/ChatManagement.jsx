import { useFetchData } from "6pp";
import { Avatar, Skeleton, Stack, TextField, Box, InputAdornment, IconButton } from "@mui/material";
import { Search as SearchIcon, ContentCopy as CopyIcon } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import AvatarCard from "../../components/shared/AvatarCard";
import Table from "../../components/shared/Table";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import { transformImage } from "../../lib/features";
import axios from "axios";
import toast from "react-hot-toast";

const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 120,
    renderCell: (params) => {
      const [longPressTimer, setLongPressTimer] = React.useState(null);
      
      const handleCopy = () => {
        navigator.clipboard.writeText(params.row.id);
        toast.success("Chat ID copied!");
      };
      
      const handleTouchStart = () => {
        const timer = setTimeout(handleCopy, 500);
        setLongPressTimer(timer);
      };
      
      const handleTouchEnd = () => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          setLongPressTimer(null);
        }
      };
      
      return (
        <Box
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={handleCopy}
          sx={{ cursor: "pointer", fontSize: "0.75rem" }}
          title="Click to copy ID"
        >
          {params.row.id}
        </Box>
      );
    },
  },
  {
    field: "avatar",
    headerName: "Avatar",
    headerClassName: "table-header",
    width: 80,
    renderCell: (params) => <AvatarCard avatar={params.row.avatar} />,
  },

  {
    field: "name",
    headerName: "Name",
    headerClassName: "table-header",
    width: 150,
  },

  {
    field: "groupChat",
    headerName: "Group",
    headerClassName: "table-header",
    width: 70,
  },
  {
    field: "totalMembers",
    headerName: "Members",
    headerClassName: "table-header",
    width: 80,
  },
  {
    field: "members",
    headerName: "Member List",
    headerClassName: "table-header",
    width: 200,
    renderCell: (params) => (
      <AvatarCard max={100} avatar={params.row.members} />
    ),
  },
  {
    field: "totalMessages",
    headerName: "Messages",
    headerClassName: "table-header",
    width: 90,
  },
  {
    field: "creator",
    headerName: "Created By",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={"0.5rem"}>
        <Avatar alt={params.row.creator.name} src={params.row.creator.avatar} sx={{ width: 30, height: 30 }} />
        <span style={{ fontSize: "0.875rem" }}>{params.row.creator.name}</span>
      </Stack>
    ),
  },
];

const ChatManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data when debounced search changes
  useEffect(() => {
    const fetchChats = async () => {
      setLoading(true);
      try {
        const url = debouncedSearch 
          ? `${server}/api/v1/admin/chats?search=${encodeURIComponent(debouncedSearch)}`
          : `${server}/api/v1/admin/chats`;
          
        const { data } = await axios.get(url, { withCredentials: true });
        
        const transformedRows = data.chats.map((i) => ({
          ...i,
          id: i._id,
          avatar: i.avatar.map((i) => transformImage(i, 50)),
          members: i.members.map((i) => transformImage(i.avatar, 50)),
          creator: {
            name: i.creator.name,
            avatar: transformImage(i.creator.avatar, 50),
          },
        }));
        
        setRows(transformedRows);
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [debouncedSearch]);

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
          <Box sx={{ mb: { xs: 1, sm: 2, md: 3 }, display: "flex", justifyContent: "center", px: { xs: 0.5, sm: 0 } }}>
            <TextField
              placeholder="Search chats by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: "100%",
                maxWidth: { xs: "100%", sm: "600px" },
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
            heading={"All Chats"}
            columns={columns}
            rows={rows}
            loading={loading}
            headerStyle={{ background: "#234e4d", color: "#ffd600" }}
            rowStyle={{ background: "#e6a3a3" }}
          />
        </Box>
      )}
    </AdminLayout>
  );
};

export default ChatManagement;
