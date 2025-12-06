import React from "react";
import AppLayout from "../components/layout/AppLayout";
import { Box, Typography, Stack, Avatar, Paper, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import { useMusicPlayer } from "../context/MusicPlayerContext";
import { transformImage } from "../lib/features";
import moment from "moment";
import { Face, AlternateEmail, CalendarMonth } from "@mui/icons-material";

const Welcome = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentSong } = useMusicPlayer();
  const isMobile = useMediaQuery('(max-width:900px)');

  if (!user) return null;

  return (
    <Box bgcolor="#18191A" minHeight="100vh" display="flex" alignItems="center" justifyContent="center" paddingTop={(currentSong && isMobile) ? '60px' : 0} sx={{ transition: 'padding-top 0.3s ease' }}>
      <Paper elevation={6} sx={{ p: 5, borderRadius: 4, bgcolor: '#23272F', color: 'white', minWidth: 340 }}>
        <Stack spacing={3} alignItems="center">
          <Avatar
            src={transformImage(user.avatar?.url)}
            sx={{ width: 120, height: 120, border: '4px solid #fff', mb: 2 }}
          />
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome, {user.name}!
          </Typography>
          <Typography variant="subtitle1" color="#aaa">
            @{user.username}
          </Typography>
          <Typography variant="body1" textAlign="center">
            {user.bio}
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <CalendarMonth sx={{ color: '#aaa' }} />
            <Typography variant="caption" color="#aaa">
              Joined {moment(user.createdAt).format('MMMM YYYY')}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};

export default AppLayout()(Welcome);
