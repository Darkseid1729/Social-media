import { useFetchData } from "6pp";
import {
  SmartToy as BotIcon,
  TrendingUp,
  Message as MessageIcon,
  People as PeopleIcon,
  Token as TokenIcon,
  Visibility,
  TimerOutlined,
  BarChart,
} from "@mui/icons-material";
import {
  Box,
  Container,
  Paper,
  Skeleton,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Grid,
} from "@mui/material";
import React, { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { LineChart } from "../../components/specific/Charts";
import { useTheme } from "../../context/ThemeContext";
import { server } from "../../constants/config";
import { useErrors } from "../../hooks/hook";
import axios from "axios";
import toast from "react-hot-toast";

const BotManagement = () => {
  const { loading, data, error, refetch } = useFetchData(
    `${server}/api/v1/bot/stats`,
    "bot-stats"
  );
  const { theme } = useTheme();
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userHistory, setUserHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { stats } = data || {};

  useErrors([
    {
      isError: error,
      error: error,
    },
  ]);

  const handleViewUserHistory = async (userId) => {
    setLoadingHistory(true);
    try {
      const { data } = await axios.get(`${server}/api/v1/bot/user/${userId}`, {
        withCredentials: true,
      });
      setUserHistory(data.data);
      setUserDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load user chat history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || "0";
  };

  const widgetColors = [
    { bg: "#e6a3a3", color: "#123456" }, // Soft red
    { bg: "#a3c7e6", color: "#123456" }, // Soft blue
    { bg: "#a3e6b3", color: "#123456" }, // Soft green
    { bg: "#e6d4a3", color: "#123456" }, // Soft yellow
  ];

  const Widget = ({ title, value, Icon, subtitle, index = 0 }) => {
    const { bg, color } = widgetColors[index % widgetColors.length];
    return (
      <Paper
        elevation={3}
        sx={{
          padding: { xs: "1rem", sm: "1.5rem", md: "2rem" },
          borderRadius: "1.5rem",
          bgcolor: bg,
          color: color,
          minWidth: { xs: "150px", sm: "200px" },
          flex: 1,
        }}
      >
        <Stack alignItems={"center"} spacing={"1rem"}>
          <Typography
            sx={{
              color: "#000000ff",
              borderRadius: "50%",
              border: "4px solid #000000ff",
              width: "5rem",
              height: "5rem",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: 700,
              fontSize: "1.8rem",
            }}
          >
            {value}
          </Typography>
          <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
            {Icon}
            <Typography color="#000000ff" fontWeight={600}>{title}</Typography>
          </Stack>
          {subtitle && (
            <Typography variant="body2" color="#000000cc" textAlign="center">
              {subtitle}
            </Typography>
          )}
        </Stack>
      </Paper>
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <Skeleton height={"100vh"} sx={{ bgcolor: theme.APP_BG }} />
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <Container>
          <Typography variant="h6" align="center" sx={{ mt: 4, color: "#fff" }}>
            No bot statistics available
          </Typography>
        </Container>
      </AdminLayout>
    );
  }

  const usagePercentage = parseFloat(stats.today.usagePercentage);
  
  // Prepare chart data for last 7 days
  const last7Days = Object.entries(stats.daily.messagesPerDay || {})
    .slice(-7)
    .map(([date, count]) => count);

  return (
    <AdminLayout>
      <Container
        component={"main"}
        sx={{
          bgcolor: "#1a2e2b",
          minHeight: "100vh",
          color: "#fff",
          py: { xs: 1, sm: 2, md: 4 },
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            padding: { xs: "0.75rem", sm: "1.25rem", md: "2rem" },
            marginBottom: { xs: "0.5rem", sm: "1rem", md: "2rem" },
            borderRadius: "1rem",
            bgcolor: "#234e4d",
          }}
        >
          <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
            <BotIcon sx={{ fontSize: "3rem", color: "#ffd600" }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" color="#ffd600">
                🤖 Joon Bot Management
              </Typography>
              <Typography variant="body2" color="#87d485ff">
                Monitor bot usage, token consumption, and user interactions
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Widgets */}
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={{ xs: "1rem", sm: "1.5rem", md: "2rem" }}
          justifyContent="space-between"
          alignItems={"stretch"}
          marginBottom={{ xs: "0.5rem", sm: "1rem", md: "2rem" }}
          flexWrap="wrap"
        >
          <Widget
            title="Total Messages"
            value={formatNumber(stats.overview.totalMessages)}
            Icon={<MessageIcon />}
            index={0}
          />
          <Widget
            title="Today's Messages"
            value={formatNumber(stats.today.messages)}
            Icon={<TrendingUp />}
            index={1}
          />
          <Widget
            title="Active Users"
            value={stats.users.length}
            Icon={<PeopleIcon />}
            index={2}
          />
          <Widget
            title="Messages Left"
            value={`~${stats.today.estimatedMessagesLeft}`}
            Icon={<TimerOutlined />}
            subtitle="Est. remaining today"
            index={3}
          />
        </Stack>

        {/* Token Usage Progress */}
        <Paper
          elevation={3}
          sx={{
            padding: { xs: "0.75rem", sm: "1.25rem", md: "2rem" },
            marginBottom: { xs: "0.5rem", sm: "1rem", md: "2rem" },
            borderRadius: "1rem",
            bgcolor: "#234e4d",
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="bold" color="#ffd600">
            📊 Today's Token Usage
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="#87d485ff">
                {formatNumber(stats.today.tokens)} / {formatNumber(stats.today.tokenLimit)} tokens
              </Typography>
              <Typography
                variant="body2"
                color={usagePercentage > 80 ? "#f44336" : "#87d485ff"}
                fontWeight="bold"
              >
                {usagePercentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(usagePercentage, 100)}
              sx={{
                height: 12,
                borderRadius: 5,
                backgroundColor: "#1a2e2b",
                "& .MuiLinearProgress-bar": {
                  backgroundColor:
                    usagePercentage > 80
                      ? "#f44336"
                      : usagePercentage > 50
                      ? "#ff9800"
                      : "#4caf50",
                  borderRadius: 5,
                },
              }}
            />
          </Box>
          <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
            <Typography variant="body2" color="#87d485ff">
              ✅ Tokens remaining: <strong>{formatNumber(stats.today.tokensRemaining)}</strong>
            </Typography>
            <Typography variant="body2" color="#87d485ff">
              💬 Est. messages left: <strong>{stats.today.estimatedMessagesLeft}</strong>
            </Typography>
          </Stack>
        </Paper>

        {/* Charts */}
        <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ mb: { xs: 1, sm: 2, md: 3 } }}>
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={3}
              sx={{
                padding: { xs: "0.75rem", sm: "1.25rem", md: "2rem" },
                borderRadius: "1rem",
                bgcolor: "#234e4d",
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold" color="#ffd600">
                📈 Messages Over Time (Last 7 Days)
              </Typography>
              <Paper elevation={2} sx={{ bgcolor: "#ffffffff", p: 2, borderRadius: "1rem", mt: 2 }}>
                <LineChart value={last7Days} />
              </Paper>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper
              elevation={3}
              sx={{
                padding: { xs: "0.75rem", sm: "1.25rem", md: "2rem" },
                borderRadius: "1rem",
                bgcolor: "#234e4d",
                height: "100%",
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold" color="#ffd600">
                📊 Quick Stats
              </Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Box sx={{ bgcolor: "#1a2e2b", p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" color="#87d485ff">
                    Total Tokens Used
                  </Typography>
                  <Typography variant="h5" color="#ffd600" fontWeight="bold">
                    {formatNumber(stats.overview.totalTokensUsed)}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: "#1a2e2b", p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" color="#87d485ff">
                    Avg Tokens/Message
                  </Typography>
                  <Typography variant="h5" color="#ffd600" fontWeight="bold">
                    ~{Math.round(stats.overview.totalTokensUsed / stats.overview.totalMessages) || 0}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: "#1a2e2b", p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" color="#87d485ff">
                    Bot Active Since
                  </Typography>
                  <Typography variant="body1" color="#ffd600">
                    {new Date(stats.overview.lastReset).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* User Statistics Table */}
        <Paper
          elevation={3}
          sx={{
            padding: { xs: "0.75rem", sm: "1.25rem", md: "2rem" },
            marginBottom: { xs: "0.5rem", sm: "1rem", md: "2rem" },
            borderRadius: "1rem",
            bgcolor: "#234e4d",
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="bold" color="#ffd600">
            👥 User Statistics
          </Typography>
          <TableContainer sx={{ mt: 2, overflowX: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#ffd600", fontWeight: "bold" }}>User Name</TableCell>
                  <TableCell align="right" sx={{ color: "#ffd600", fontWeight: "bold" }}>
                    Messages
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#ffd600", fontWeight: "bold" }}>
                    Tokens Used
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#ffd600", fontWeight: "bold" }}>
                    Last Used
                  </TableCell>
                  <TableCell align="center" sx={{ color: "#ffd600", fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.users.map((user, idx) => (
                  <TableRow key={user.userId} hover sx={{ bgcolor: idx % 2 === 0 ? "#1a2e2b" : "transparent" }}>
                    <TableCell sx={{ color: "#fff" }}>{user.userName}</TableCell>
                    <TableCell align="right">
                      <Chip label={user.messages} color="primary" size="small" />
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#87d485ff" }}>
                      {formatNumber(user.tokens)}
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#87d485ff" }}>
                      {formatDate(user.lastUsed)}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        sx={{ color: "#ffd600" }}
                        onClick={() => handleViewUserHistory(user.userId)}
                        disabled={loadingHistory}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {stats.users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ color: "#87d485ff", py: 4 }}>
                      No users have chatted with the bot yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Recent Conversations */}
        <Paper
          elevation={3}
          sx={{
            padding: { xs: "0.75rem", sm: "1.25rem", md: "2rem" },
            borderRadius: "1rem",
            bgcolor: "#234e4d",
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="bold" color="#ffd600">
            💬 Recent Conversations (Last 20)
          </Typography>
          <TableContainer sx={{ maxHeight: 500, mt: 2 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: "#1a2e2b", color: "#ffd600", fontWeight: "bold" }}>
                    Time
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#1a2e2b", color: "#ffd600", fontWeight: "bold" }}>
                    User
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#1a2e2b", color: "#ffd600", fontWeight: "bold" }}>
                    User Message
                  </TableCell>
                  <TableCell sx={{ bgcolor: "#1a2e2b", color: "#ffd600", fontWeight: "bold" }}>
                    Bot Response
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ bgcolor: "#1a2e2b", color: "#ffd600", fontWeight: "bold" }}
                  >
                    Tokens
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentConversations.map((conv, idx) => (
                  <TableRow key={idx} hover sx={{ bgcolor: idx % 2 === 0 ? "#1a2e2b" : "transparent" }}>
                    <TableCell sx={{ whiteSpace: "nowrap", color: "#87d485ff" }}>
                      {new Date(conv.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell sx={{ color: "#fff" }}>{conv.userName}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 250,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: "#87d485ff",
                      }}
                    >
                      {conv.userMessage}
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 300,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: "#87d485ff",
                      }}
                    >
                      {conv.botResponse}
                    </TableCell>
                    <TableCell align="right">
                      <Chip label={conv.tokensUsed} size="small" sx={{ bgcolor: "#ffd600", color: "#000" }} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* User History Dialog */}
        <Dialog
          open={userDialogOpen}
          onClose={() => setUserDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              bgcolor: "#234e4d",
              color: "#fff",
            },
          }}
        >
          <DialogTitle sx={{ color: "#ffd600" }}>
            {userHistory?.user.userName}'s Chat History
          </DialogTitle>
          <DialogContent>
            {userHistory && (
              <>
                <Stack spacing={1} sx={{ mb: 3, p: 2, bgcolor: "#1a2e2b", borderRadius: 2 }}>
                  <Typography variant="body2" color="#87d485ff">
                    Total Messages: <strong style={{ color: "#ffd600" }}>{userHistory.user.messages}</strong>
                  </Typography>
                  <Typography variant="body2" color="#87d485ff">
                    Total Tokens: <strong style={{ color: "#ffd600" }}>{formatNumber(userHistory.user.tokens)}</strong>
                  </Typography>
                  <Typography variant="body2" color="#87d485ff">
                    Last Active: <strong style={{ color: "#ffd600" }}>{formatDate(userHistory.user.lastUsed)}</strong>
                  </Typography>
                </Stack>

                <TableContainer sx={{ maxHeight: 400, bgcolor: "#1a2e2b", borderRadius: 2 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: "#234e4d", color: "#ffd600" }}>Time</TableCell>
                        <TableCell sx={{ bgcolor: "#234e4d", color: "#ffd600" }}>User Message</TableCell>
                        <TableCell sx={{ bgcolor: "#234e4d", color: "#ffd600" }}>Bot Response</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {userHistory.conversations.map((conv, idx) => (
                        <TableRow key={idx} sx={{ bgcolor: idx % 2 === 0 ? "#1a2e2b" : "#234e4d" }}>
                          <TableCell sx={{ whiteSpace: "nowrap", color: "#87d485ff" }}>
                            {new Date(conv.timestamp).toLocaleTimeString()}
                          </TableCell>
                          <TableCell sx={{ color: "#fff" }}>{conv.userMessage}</TableCell>
                          <TableCell sx={{ color: "#87d485ff" }}>{conv.botResponse}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUserDialogOpen(false)} sx={{ color: "#ffd600" }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default BotManagement;
