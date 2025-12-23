import { useFetchData } from "6pp";
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Group as GroupIcon,
  Message as MessageIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import {
  Box,
  Container,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import moment from "moment";
import React from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { DoughnutChart, LineChart } from "../../components/specific/Charts";
import {
  CurveButton,
  SearchField,
} from "../../components/styles/StyledComponents";
import { useTheme } from "../../context/ThemeContext";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";

const Dashboard = () => {
  const { loading, data, error } = useFetchData(
    `${server}/api/v1/admin/stats`,
    "dashboard-stats"
  );
  const { theme } = useTheme();

  const { stats } = data || {};

  useErrors([
    {
      isError: error,
      error: error,
    },
  ]);

  const Appbar = (
    <Paper
      elevation={3}
      sx={{ padding: { xs: "0.75rem", sm: "1.25rem", md: "2rem" }, margin: { xs: "0.5rem 0", sm: "1rem 0", md: "2rem 0" }, borderRadius: "1rem" }}
    >
      <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
        <AdminPanelSettingsIcon sx={{ fontSize: "3rem" }} />

        <SearchField placeholder="Search..." />

        <CurveButton>Search</CurveButton>
        <Box flexGrow={1} />
        <Typography
          display={{
            xs: "none",
            lg: "block",
          }}
          color={"rgba(0,0,0,0.7)"}
          textAlign={"center"}
        >
          {moment().format("dddd, D MMMM YYYY")}
        </Typography>

        <NotificationsIcon />
      </Stack>
    </Paper>
  );

  const widgetColors = [
    { bg: "#e6a3a3", color: "#123456" }, // Soft red
    { bg: "#a3c7e6", color: "#123456" }, // Soft blue
    { bg: "#a3e6b3", color: "#123456" }, // Soft green
  ];

  const Widget = ({ title, value, Icon, index = 0 }) => {
    const { theme } = useTheme();
    const { bg, color } = widgetColors[index % widgetColors.length];
    return (
      <Paper
        elevation={3}
        sx={{
          padding: { xs: "1rem", sm: "1.5rem", md: "2rem" },
          margin: { xs: "0.5rem 0", sm: "1rem 0", md: "2rem 0" },
          borderRadius: "1.5rem",
          width: { xs: "100%", sm: "18rem", md: "20rem" },
          bgcolor: bg,
          color: color,
        }}
      >
        <Stack alignItems={"center"} spacing={"1rem"}>
          <Typography
            sx={{
              color: "#000000ff",
              borderRadius: "50%",
              border: "4px solid #000000ff", // yellow outline for contrast
              width: "5rem",
              height: "5rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: 700,
              fontSize: "2rem",
            }}
          >
            {value}
          </Typography>
          <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
            {Icon}
            <Typography color="#000000ff">{title}</Typography>
          </Stack>
        </Stack>
      </Paper>
    );
  };

  const Widgets = (
    <Stack
      direction={{
        xs: "column",
        sm: "row",
      }}
      spacing="2rem"
      justifyContent="space-between"
      alignItems={"center"}
      margin={"2rem 0"}
    >
      <Widget title={"Users"} value={stats?.usersCount} Icon={<PersonIcon />} index={0} />
      <Widget title={"Chats"} value={stats?.totalChatsCount} Icon={<GroupIcon />} index={1} />
      <Widget title={"Messages"} value={stats?.messagesCount} Icon={<MessageIcon />} index={2} />
    </Stack>
  );

  return (
    <AdminLayout>
      {loading ? (
        <Skeleton height={"100vh"} sx={{ bgcolor: theme.APP_BG }} />
      ) : (
        <Container
          component={"main"}
          sx={{
            bgcolor: "#1a2e2b",
            minHeight: "100vh",
            color: "#fff",
            px: { xs: 1, sm: 2, md: 3 },
            py: { xs: 1, sm: 2, md: 3 },
          }}
        >
          {Appbar}

          <Stack
            direction={{
              xs: "column",
              lg: "row",
            }}
            flexWrap={"wrap"}
            justifyContent={"center"}
            alignItems={{
              xs: "center",
              lg: "stretch",
            }}
            sx={{ gap: "2rem" }}
          >
            <Paper
              elevation={3}
              sx={{
                padding: { xs: "1rem", sm: "1.5rem 2rem", md: "2rem 3.5rem" },
                borderRadius: "1rem",
                width: "100%",
                maxWidth: "45rem",
                bgcolor: "#1a2e2b",
                color: "#87d485ff",
              }}
            >
              <Typography
                margin={"2rem 0"}
                variant="h4"
                color="#ffd600"
              >
                Last Messages
              </Typography>

              <Paper elevation={2} sx={{ bgcolor: "#ffffffff", p: 2, borderRadius: "1rem" }}>
                <LineChart value={stats?.messagesChart || []} />
              </Paper>
            </Paper>

            <Paper
              elevation={3}
              sx={{
                padding: "1rem ",
                borderRadius: "1rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: { xs: "100%", sm: "50%" },
                position: "relative",
                maxWidth: "25rem",
                bgcolor: "#ffffffff",
                // color: "#12345",
              }}
            >
              <DoughnutChart
                labels={["Single Chats", "Group Chats"]}
                value={[
                  stats?.totalChatsCount - stats?.groupsCount || 0,
                  stats?.groupsCount || 0,
                ]}
              />

              <Stack
                position={"absolute"}
                direction={"row"}
                justifyContent={"center"}
                alignItems={"center"}
                spacing={"0.5rem"}
                width={"100%"}
                height={"100%"}
              >
                <GroupIcon /> <Typography color="#ffd600">Vs </Typography>
                <PersonIcon />
              </Stack>
            </Paper>
          </Stack>

          {Widgets}
        </Container>
      )}
    </AdminLayout>
  );
};

export default Dashboard;
