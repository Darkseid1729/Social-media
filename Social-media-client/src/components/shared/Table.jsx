import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Container, Paper, Typography } from "@mui/material";
import { useTheme } from "../../context/ThemeContext";

const Table = ({ rows, columns, heading, rowHeight = 52, headerStyle = {}, rowStyle = {} }) => {
  const { theme } = useTheme();
  return (
    <Container
      sx={{
        height: "100vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "1rem 4rem",
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
            margin: "2rem",
            textTransform: "uppercase",
          }}
        >
          {heading}
        </Typography>
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={rowHeight}
          style={{
            height: "80%",
          }}
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
          }}
        />
      </Paper>
    </Container>
  );
};

export default Table;
