import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Container, Paper, Typography } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";

const Table = ({
  rows,
  columns,
  heading,
  rowHeight = 52,
  headerStyle = {},
  rowStyle = {},
  // Optional server-side pagination props
  serverPagination = false,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions = [10, 25, 50, 100],
  loading = false,
}) => {
  const { theme } = useTheme();
  return (
    <Container
      sx={{
        height: "auto",
        maxHeight: "100%",
        py: 0,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: { xs: "0.25rem", sm: "0.5rem 1rem", md: "0.75rem 2rem" },
          borderRadius: "1rem",
          margin: "auto",
          width: "100%",
          overflow: "hidden",
          height: "100%",
          boxShadow: "none",
        }}
      >
        <Typography
          textAlign={"center"}
          variant="h4"
          sx={{
            margin: { xs: "0.25rem", sm: "0.5rem", md: "1rem" },
            textTransform: "uppercase",
            fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2.125rem" },
          }}
        >
          {heading}
        </Typography>
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={rowHeight}
          style={{
            height: "70vh",
          }}
          loading={loading}
          paginationMode={serverPagination ? "server" : "client"}
          rowCount={serverPagination ? rowCount : undefined}
          paginationModel={serverPagination ? paginationModel : undefined}
          onPaginationModelChange={serverPagination ? onPaginationModelChange : undefined}
          pageSizeOptions={pageSizeOptions}
          sx={{
            border: "none",
            ".table-header": {
              bgcolor: headerStyle.background || theme.SURFACE_BG,
              color: headerStyle.color || "white",
            },
            ".MuiDataGrid-row": {
              bgcolor: rowStyle.background || "inherit",
              color: rowStyle.color || "inherit",
            },
            ".MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              whiteSpace: "normal !important",
              wordWrap: "break-word !important",
            },
            ".MuiDataGrid-columnHeaders": {
              fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
            },
          }}
        />
      </Paper>
    </Container>
  );
};

export default Table;
