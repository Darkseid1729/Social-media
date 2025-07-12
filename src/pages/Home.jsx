import React from "react";
import AppLayout from "../components/layout/AppLayout";
import { Box, Typography } from "@mui/material";

const Home = () => {
  const { theme } = useTheme();
  return (
    <Box bgcolor={undefined} sx={{ background: theme.LIGHT_BG, height: "100%" }}>
      <Typography p={"2rem"} variant="h5" textAlign={"center"}>
        Select a friend to chat
      </Typography>
    </Box>
  );
};

export default AppLayout()(Home);
