import {
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  Groups as GroupsIcon,
  ManageAccounts as ManageAccountsIcon,
  Menu as MenuIcon,
  Message as MessageIcon,
  SmartToy as BotIcon,
} from "@mui/icons-material";
import {
  Box,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import React, { useState } from "react";
import { Link as LinkComponent, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { adminLogout } from "../../redux/thunks/admin";
import { useTheme } from "../../context/ThemeContext";

const Link = styled(LinkComponent)(({ theme }) => ({
  textDecoration: "none",
  borderRadius: "2rem",
  padding: "1rem 2rem",
  color: theme.palette.mode === "dark" ? "#fff" : "black",
  background: theme.palette.mode === "dark" ? theme.palette.background.paper : undefined,
  '&:hover': {
    color: theme.palette.mode === "dark" ? "#ffd600" : "rgba(0, 0, 0, 0.54)",
    background: theme.palette.mode === "dark" ? theme.palette.background.default : undefined,
  },
}));

const adminTabs = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <DashboardIcon />,
  },
  {
    name: "Users",
    path: "/admin/users",
    icon: <ManageAccountsIcon />,
  },
  {
    name: "Chats",
    path: "/admin/chats",
    icon: <GroupsIcon />,
  },
  {
    name: "Messages",
    path: "/admin/messages",
    icon: <MessageIcon />,
  },
  {
    name: "Bot",
    path: "/admin/bot",
    icon: <BotIcon />,
  },
];

const Sidebar = ({ w = "100%" }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const logoutHandler = () => {
    dispatch(adminLogout());
  };

  return (
    <Stack width={w} direction={"column"} p={"3rem"} spacing={"3rem"} sx={{ bgcolor: theme.SURFACE_BG, color: "#fff" }}>
      <Typography variant="h5" textTransform={"uppercase"} color="#ffd600">
        Chattu
      </Typography>
      <Stack spacing={"1rem"}>
        {adminTabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            sx={
              location.pathname === tab.path && {
                bgcolor: theme.BUTTON_ACCENT,
                color: "#fff",
                ':hover': { color: "#ffd600" },
              }
            }
          >
            <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
              {tab.icon}
              <Typography color="#ffd600">{tab.name}</Typography>
            </Stack>
          </Link>
        ))}
        <Link onClick={logoutHandler} sx={{ color: "#fff" }}>
          <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
            <ExitToAppIcon />
            <Typography color="#ffd600">Logout</Typography>
          </Stack>
        </Link>
      </Stack>
    </Stack>
  );
};

const AdminLayout = ({ children }) => {
  const { isAdmin } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  const [isMobile, setIsMobile] = useState(false);

  const handleMobile = () => setIsMobile(!isMobile);

  const handleClose = () => setIsMobile(false);

  if (!isAdmin) return <Navigate to="/admin" />;

  return (
    <Grid container minHeight={"100vh"} sx={{ bgcolor: "#49736d", color: "#fff" }}>
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          right: "1rem",
          top: "1rem",
          zIndex: 1300,
        }}
      >
        <IconButton onClick={handleMobile} sx={{ bgcolor: theme.SURFACE_BG, color: "#ffd600" }}>
          {isMobile ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Grid item md={4} lg={3} sx={{ display: { xs: "none", md: "block" }, bgcolor: "#234e4d", color: "#fff" }}>
        <Sidebar />
      </Grid>

      <Grid
        item
        xs={12}
        md={8}
        lg={9}
        sx={{
          bgcolor: "#49736d",
          color: "#fff",
        }}
      >
        {children}
      </Grid>

      <Drawer open={isMobile} onClose={handleClose} PaperProps={{ sx: { bgcolor: "#234e4d", color: "#fff" } }}>
        <Sidebar w="50vw" />
      </Drawer>
    </Grid>
  );
};

export default AdminLayout;
