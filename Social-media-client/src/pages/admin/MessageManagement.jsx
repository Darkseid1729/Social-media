import { Avatar, Box, Stack, Skeleton } from "@mui/material";
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

  useErrors([
    {
      isError: !!error,
      error: error,
    },
  ]);

  const fetchPage = useCallback(async (page, pageSize) => {
    try {
      setLoading(true);
      setError(null);
      const url = `${server}/api/v1/admin/messages?page=${page + 1}&limit=${pageSize}`;
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
    fetchPage(paginationModel.page, paginationModel.pageSize);
  }, [fetchPage, paginationModel.page, paginationModel.pageSize]);

  return (
    <AdminLayout>
      {loading ? (
        <Skeleton height={"100vh"} sx={{ bgcolor: "#1a2e2b" }} />
      ) : (
        <div
          style={{
            background: "#1a2e2b",
            minHeight: "100vh",
            padding: "2rem",
          }}
        >
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
