import React, { useEffect, useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Avatar,
  IconButton,
  useMediaQuery,
  Stack,
} from '@mui/material';
import { Close as CloseIcon, CalendarMonth as CalendarIcon, AlternateEmail as UserNameIcon, Face as FaceIcon } from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';
import { transformImage } from '../../lib/features';
import ImageDialog from '../shared/ImageDialog';
import moment from 'moment';

const ProfileViewDialog = ({ open, onClose, userId, userInfo }) => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Handle back button on mobile
  useEffect(() => {
    const handleBackButton = (e) => {
      if (open) {
        e.preventDefault();
        onClose();
      }
    };

    if (open) {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handleBackButton);
    }

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [open, onClose]);

  if (!userInfo) return null;

  const handleAvatarClick = () => {
    setShowAvatarModal(true);
  };

  const handleCloseAvatarModal = () => {
    setShowAvatarModal(false);
  };

  // Desktop: Minimal view (just avatar + name)
  if (!isMobile) {
    return (
      <>
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="sm"
          PaperProps={{
            sx: {
              backgroundColor: theme.DIALOG_BG || theme.LIGHT_BG,
              borderRadius: 3,
              maxWidth: 320,
              overflow: 'hidden',
              padding: 0,
            },
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ padding: 2, textAlign: 'center' }}>
            {/* Avatar with Name Overlay */}
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={transformImage(userInfo.avatar)}
                alt={userInfo.name}
                onClick={handleAvatarClick}
                sx={{
                  width: 180,
                  height: 180,
                  margin: '0 auto',
                  border: `4px solid ${theme.PRIMARY_COLOR}`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                }}
              />
              
              {/* Name overlay on bottom of circular image */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
                  padding: '20px 8px 8px',
                  borderRadius: '0 0 90px 90px',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#fff',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {userInfo.name}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Dialog>

        <ImageDialog
          open={showAvatarModal}
          onClose={handleCloseAvatarModal}
          imageUrl={userInfo.avatar}
          alt="Profile Picture"
        />
      </>
    );
  }

  // Mobile: Full profile view
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: theme.DIALOG_BG || theme.LIGHT_BG,
            borderRadius: 4,
            maxWidth: '85%',
            maxHeight: '80vh',
            margin: 2,
          },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            width: 32,
            height: 32,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <Stack spacing={2} alignItems="center" sx={{ padding: '10px', paddingTop: '20px' }}>
          {/* Avatar */}
          <Avatar
            src={transformImage(userInfo.avatar)}
            alt={userInfo.name}
            onClick={handleAvatarClick}
            sx={{
              width: 120,
              height: 120,
              border: `3px solid ${theme.PRIMARY_COLOR}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              cursor: 'pointer',
            }}
          />

          {/* Bio */}
          {userInfo.bio && (
            <ProfileCard 
              heading="Bio" 
              text={userInfo.bio} 
              nameColor={theme.PROFILE_BIO_COLOR || theme.TEXT_PRIMARY} 
            />
          )}

          {/* Username */}
          <ProfileCard
            heading="Username"
            text={userInfo.username}
            Icon={<UserNameIcon />}
            nameColor={theme.PROFILE_USERNAME_COLOR || theme.TEXT_PRIMARY}
          />

          {/* Name */}
          <ProfileCard 
            heading="Name" 
            text={userInfo.name} 
            Icon={<FaceIcon />} 
            nameColor={theme.PROFILE_NAME_COLOR || theme.TEXT_PRIMARY} 
          />

          {/* Joined */}
          {userInfo.createdAt && (
            <ProfileCard
              heading="Joined"
              nameColor={theme.PROFILE_JOINED_COLOR || theme.TEXT_PRIMARY}
              text={moment(userInfo.createdAt).fromNow()}
              Icon={<CalendarIcon />}
            />
          )}
        </Stack>
      </Dialog>

      <ImageDialog
        open={showAvatarModal}
        onClose={handleCloseAvatarModal}
        imageUrl={userInfo.avatar}
        alt="Profile Picture"
      />
    </>
  );
};

const ProfileCard = ({ text, Icon, heading, nameColor }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1}
    textAlign="center"
    sx={{ width: '100%', padding: '4px 8px' }}
  >
    {Icon && Icon}
    <Stack sx={{ flex: 1, minWidth: 0 }}>
      <Typography color={nameColor} variant="caption" fontWeight={600} sx={{ fontSize: '0.7rem' }}>
        {heading}
      </Typography>
      <Typography variant="body2" sx={{ fontSize: '0.85rem', wordBreak: 'break-word' }}>{text}</Typography>
    </Stack>
  </Stack>
);

export default ProfileViewDialog;
