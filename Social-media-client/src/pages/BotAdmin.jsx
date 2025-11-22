import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import { 
  TrendingUp, 
  People, 
  Message, 
  ShowChart,
  Visibility,
  Timer,
} from '@mui/icons-material';
import axios from 'axios';
import { server } from '../constants/config';
import toast from 'react-hot-toast';

const BotAdmin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [userHistory, setUserHistory] = useState(null);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await axios.get(`${server}/api/v1/bot/stats`, {
        withCredentials: true,
      });
      setStats(data.stats);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch bot stats:', error);
      toast.error('Failed to load bot statistics');
      setLoading(false);
    }
  };

  const handleViewUserHistory = async (userId) => {
    try {
      const { data } = await axios.get(`${server}/api/v1/bot/user/${userId}`, {
        withCredentials: true,
      });
      setUserHistory(data.data);
      setUserDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load user chat history');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Container>
        <Typography variant="h6" align="center" sx={{ mt: 4 }}>
          No statistics available
        </Typography>
      </Container>
    );
  }

  const usagePercentage = parseFloat(stats.today.usagePercentage);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        🤖 Joon Bot Admin Panel
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Monitor bot usage, token consumption, and user interactions
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                    Total Messages
                  </Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {formatNumber(stats.overview.totalMessages)}
                  </Typography>
                </Box>
                <Message sx={{ fontSize: 48, color: 'white', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                    Today's Messages
                  </Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {formatNumber(stats.today.messages)}
                  </Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 48, color: 'white', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                    Active Users
                  </Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    {stats.users.length}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 48, color: 'white', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                    Messages Left
                  </Typography>
                  <Typography variant="h4" color="white" fontWeight="bold">
                    ~{stats.today.estimatedMessagesLeft}
                  </Typography>
                </Box>
                <Timer sx={{ fontSize: 48, color: 'white', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Token Usage */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          📊 Today's Token Usage
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2">
              {formatNumber(stats.today.tokens)} / {formatNumber(stats.today.tokenLimit)} tokens
            </Typography>
            <Typography variant="body2" color={usagePercentage > 80 ? 'error' : 'text.secondary'}>
              {usagePercentage}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(usagePercentage, 100)}
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: usagePercentage > 80 ? '#f44336' : usagePercentage > 50 ? '#ff9800' : '#4caf50',
              }
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Tokens remaining: {formatNumber(stats.today.tokensRemaining)} 
          ({stats.today.estimatedMessagesLeft} estimated messages left)
        </Typography>
      </Paper>

      {/* User Statistics */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          👥 User Statistics
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>User Name</strong></TableCell>
                <TableCell align="right"><strong>Messages</strong></TableCell>
                <TableCell align="right"><strong>Tokens Used</strong></TableCell>
                <TableCell align="right"><strong>Last Used</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.users.map((user) => (
                <TableRow key={user.userId} hover>
                  <TableCell>{user.userName}</TableCell>
                  <TableCell align="right">
                    <Chip label={user.messages} color="primary" size="small" />
                  </TableCell>
                  <TableCell align="right">{formatNumber(user.tokens)}</TableCell>
                  <TableCell align="right">{formatDate(user.lastUsed)}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleViewUserHistory(user.userId)}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {stats.users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No users have chatted with the bot yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recent Conversations */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          💬 Recent Conversations (Last 20)
        </Typography>
        <TableContainer sx={{ maxHeight: 500 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>Time</strong></TableCell>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>User Message</strong></TableCell>
                <TableCell><strong>Bot Response</strong></TableCell>
                <TableCell align="right"><strong>Tokens</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.recentConversations.map((conv, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {new Date(conv.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>{conv.userName}</TableCell>
                  <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.userMessage}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.botResponse}
                  </TableCell>
                  <TableCell align="right">
                    <Chip label={conv.tokensUsed} size="small" />
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
      >
        <DialogTitle>
          {userHistory?.user.userName}'s Chat History
        </DialogTitle>
        <DialogContent>
          {userHistory && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Messages: <strong>{userHistory.user.messages}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tokens: <strong>{formatNumber(userHistory.user.tokens)}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last Active: <strong>{formatDate(userHistory.user.lastUsed)}</strong>
                </Typography>
              </Box>
              
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>User Message</TableCell>
                      <TableCell>Bot Response</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userHistory.conversations.map((conv, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {new Date(conv.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>{conv.userMessage}</TableCell>
                        <TableCell>{conv.botResponse}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BotAdmin;
