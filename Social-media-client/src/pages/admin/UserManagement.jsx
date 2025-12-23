import { useFetchData } from "6pp";
import { Avatar, Skeleton, TextField, Box, InputAdornment } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
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
    width: 120,
  },
  {
    field: "avatar",
    headerName: "Avatar",
    headerClassName: "table-header",
    width: 80,
    renderCell: (params) => (
      <Avatar alt={params.row.name} src={params.row.avatar} sx={{ width: 35, height: 35 }} />
    ),
  },

  {
    field: "name",
    headerName: "Name",
    headerClassName: "table-header",
    width: 150,
  },
  {
    field: "username",
    headerName: "Username",
    headerClassName: "table-header",
    width: 130,
  },
  {
    field: "friends",
    headerName: "Friends",
    headerClassName: "table-header",
    width: 80,
  },
  {
    field: "groups",
    headerName: "Groups",
    headerClassName: "table-header",
    width: 200,
  },
];

const UserManagement = () => {
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
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const url = debouncedSearch 
          ? `${server}/api/v1/admin/users?search=${encodeURIComponent(debouncedSearch)}`
          : `${server}/api/v1/admin/users`;
          
        const { data } = await axios.get(url, { withCredentials: true });
        
        const transformedRows = data.users.map((i) => ({
          ...i,
          id: i._id,
          avatar: transformImage(i.avatar, 50),
        }));
        
        setRows(transformedRows);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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
              placeholder="Search users by name or username..."
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
            heading={"All Users"}
            columns={columns}
            rows={rows}
            loading={loading}
            headerStyle={{ background: "#234e4d", color: "#ffd600" }}
            rowStyle={{ background: "#a3e6b3" }}
          />
        </Box>
      )}
    </AdminLayout>
  );
};

export default UserManagement;
