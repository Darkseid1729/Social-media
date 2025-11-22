import { useFetchData } from "6pp";
import { Avatar, Skeleton, Stack, TextField, Box, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import AvatarCard from "../../components/shared/AvatarCard";
import Table from "../../components/shared/Table";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import { transformImage } from "../../lib/features";
import axios from "axios";

const columns = [
  {
    field: "id",
    headerName: "ID",
    headerClassName: "table-header",
    width: 200,
  },
  {
    field: "avatar",
    headerName: "Avatar",
    headerClassName: "table-header",
    width: 150,
    renderCell: (params) => <AvatarCard avatar={params.row.avatar} />,
  },

  {
    field: "name",
    headerName: "Name",
    headerClassName: "table-header",
    width: 300,
  },

  {
    field: "groupChat",
    headerName: "Group",
    headerClassName: "table-header",
    width: 100,
  },
  {
    field: "totalMembers",
    headerName: "Total Members",
    headerClassName: "table-header",
    width: 120,
  },
  {
    field: "members",
    headerName: "Members",
    headerClassName: "table-header",
    width: 400,
    renderCell: (params) => (
      <AvatarCard max={100} avatar={params.row.members} />
    ),
  },
  {
    field: "totalMessages",
    headerName: "Total Messages",
    headerClassName: "table-header",
    width: 120,
  },
  {
    field: "creator",
    headerName: "Created By",
    headerClassName: "table-header",
    width: 250,
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={"1rem"}>
        <Avatar alt={params.row.creator.name} src={params.row.creator.avatar} />
        <span>{params.row.creator.name}</span>
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
        <div
          style={{
            background: "#1a2e2b",
            minHeight: "100vh",
            padding: "2rem",
          }}
        >
          <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
            <TextField
              placeholder="Search chats by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: "100%",
                maxWidth: "600px",
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
        </div>
      )}
    </AdminLayout>
  );
};

export default ChatManagement;
