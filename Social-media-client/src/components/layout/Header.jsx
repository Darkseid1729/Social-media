import {
  AppBar,
  Backdrop,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { Suspense, lazy, useState, useMemo } from "react";
import { keyframes } from "@mui/system";


import { useTheme } from "../../context/ThemeContext";
import { useMusicPlayer } from "../../context/MusicPlayerContext";
import { useNotificationSound } from "../../context/NotificationSoundContext";
import { themes } from "../../constants/themes";
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CollectionsIcon from '@mui/icons-material/Collections';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import GroupMembersDialog from '../dialogs/GroupMembersDialog';
import MediaGallery from '../dialogs/MediaGallery';
import SearchMessagesDialog from '../dialogs/SearchMessagesDialog';
import MenuIcon from "@mui/icons-material/Menu";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import GroupIcon from "@mui/icons-material/Group";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { Menu, MenuItem } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../constants/config";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";
import Profile from "../specific/Profile";
import { userNotExists } from "../../redux/reducers/auth";
import {
  setIsMobile,
  setIsNewGroup,
  setIsNotification,
  setIsSearch,
} from "../../redux/reducers/misc";
import { resetNotificationCount } from "../../redux/reducers/chat";
import { AddBox } from "@mui/icons-material";



const SearchDialog = lazy(() => import("../specific/Search"));
const NotifcationDialog = lazy(() => import("../specific/Notifications"));
const NewGroupDialog = lazy(() => import("../specific/NewGroup"));

// Valentine's Day floating hearts animations
const floatUp = keyframes`
  0% {
    transform: translateY(100%) scale(0.5) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(-120%) scale(1.1) rotate(25deg);
    opacity: 0;
  }
`;

const drift = keyframes`
  0% { transform: translateX(0px); }
  25% { transform: translateX(6px); }
  50% { transform: translateX(-4px); }
  75% { transform: translateX(8px); }
  100% { transform: translateX(0px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.3); }
`;

// Steeper, more direct upward animation
const floatUpSteep = keyframes`
  0% {
    transform: translateY(100%) translateX(0) scale(0.3) rotate(0deg);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  60% {
    opacity: 0.9;
  }
  100% {
    transform: translateY(-150%) translateX(10px) scale(1.2) rotate(15deg);
    opacity: 0;
  }
`;

// Heart symbols to randomly pick from
// const HEART_CHARS = ['♥', '❤', '💕', '💗','💘','💞','❣️','🤍','💋','🌹','🌸' ];
const HEART_CHARS = ['💋','💋','💋','💋','💋','💋','💋','💋','💋'];
const FloatingHearts = ({ color = 'rgba(255,255,255,0.5)', count = 30 }) => {
  const hearts = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const left = Math.random() * 100;
      const size = 6 + Math.random() * 10;
      const duration = 4 + Math.random() * 6;
      const delay = Math.random() * 8;
      const driftDur = 3 + Math.random() * 4;
      const char = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
      const opacity = 0.15 + Math.random() * 0.4;
      const useSteep = Math.random() > 0.6; // 40% chance for steep upward motion
      return { id: i, left, size, duration, delay, driftDur, char, opacity, useSteep };
    });
  }, [count]);

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {hearts.map((h) => (
        <Box
          key={h.id}
          sx={{
            position: 'absolute',
            left: `${h.left}%`,
            bottom: '-6px',
            fontSize: `${h.size}px`,
            color,
            opacity: h.opacity,
            animation: h.useSteep 
              ? `${floatUpSteep} ${h.duration}s ${h.delay}s ease-out infinite`
              : `${floatUp} ${h.duration}s ${h.delay}s ease-in infinite, ${drift} ${h.driftDur}s ${h.delay}s ease-in-out infinite`,
            userSelect: 'none',
            filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.15))',
          }}
        >
          {h.char}
        </Box>
      ))}
      {/* A few static glowing hearts for sparkle */}
      {[15, 40, 65, 85].map((pos, i) => (
        <Box
          key={`static-${i}`}
          sx={{
            position: 'absolute',
            left: `${pos}%`,
            top: `${25 + i * 15}%`,
            fontSize: '10px',
            color,
            opacity: 0.35,
            animation: `${pulse} ${6 + i * 0.5}s ease-in-out infinite`,
            userSelect: 'none',
          }}
        >
          ♥
        </Box>
      ))}
    </Box>
  );
};

// Map theme names to heart overlay colors
const getHeartColor = (themeName) => {
  switch (themeName) {
    case 'dark': return 'rgba(255, 0, 0, 0.45)';
    case 'light': return 'hsla(348, 100%, 50%, 0.50)';
    case 'pink': return 'rgba(255,255,255,0.55)';
    case 'pinkDark': return 'rgba(255,182,193,0.5)';
    case 'blue': return 'rgb(30, 255, 0)';
    case 'blueDark': return 'rgba(144,202,249,0.45)';
    default: return 'rgba(255,255,255,0.45)';
  }
};



const Header = (props) => {

  // Theme switcher state and handlers
  const { themeName, changeTheme, theme } = useTheme();
  const { setIsMusicSearchOpen } = useMusicPlayer();
  const { soundEnabled, toggleSound } = useNotificationSound();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  // Mobile menu state
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const mobileMenuOpen = Boolean(mobileMenuAnchor);

  // Prevent global scrollbars when theme menu is open
  React.useEffect(() => {
    if (open || mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open, mobileMenuOpen]);

  const handleThemeClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleThemeClose = () => {
    setAnchorEl(null);
  };
  const handleThemeSelect = (name) => {
    changeTheme(name);
    setAnchorEl(null);
  };

  // Mobile menu handlers
  const handleMobileMenuClick = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };
  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isSearch, isNotification, isNewGroup } = useSelector(
    (state) => state.misc
  );
  const { notificationCount } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [showProfile, setShowProfile] = useState(false);

  const handleMobile = () => dispatch(setIsMobile(true));

  const openSearch = () => {
    dispatch(setIsSearch(true));
    handleMobileMenuClose();
  };

  const openNewGroup = () => {
    dispatch(setIsNewGroup(true));
    handleMobileMenuClose();
  };

  const openNotification = () => {
    dispatch(setIsNotification(true));
    dispatch(resetNotificationCount());
    handleMobileMenuClose();
  };

  const navigateToGroup = () => {
    navigate("/groups");
    handleMobileMenuClose();
  };
  
  const openMusicPlayer = () => {
    setIsMusicSearchOpen(true);
    handleMobileMenuClose();
  };
  
  const openProfile = () => {
    setShowProfile(true);
    handleMobileMenuClose();
  };
  const closeProfile = () => setShowProfile(false);

  const logoutHandler = async () => {
    try {
      const { data } = await axios.get(`${server}/api/v1/user/logout`, {
        withCredentials: true,
      });
      dispatch(userNotExists());
      toast.success(data.message);
      handleMobileMenuClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  // Avatar change handler for header profile dialog
  const handleAvatarChange = async (file) => {
    alert('Avatar change triggered from header! Implement logic as needed.');
  };


  // Group members dialog state
  const [showGroupMembersDialog, setShowGroupMembersDialog] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [showSearchMessages, setShowSearchMessages] = useState(false);
  
  // Get chatId from URL params
  const params = useParams();
  const chatId = params.chatId || props.chatId;
  const chatDetails = props.chatDetails;
  const isGroupChat = chatDetails?.groupChat;

  const handleGroupMembersOpen = () => {
    setShowGroupMembersDialog(true);
    handleMobileMenuClose();
  };

  const handleGroupMembersClose = () => {
    setShowGroupMembersDialog(false);
  };

  const handleMediaGalleryOpen = () => {
    if (!chatId) {
      toast.error('Please select a chat first');
      return;
    }
    setShowMediaGallery(true);
    handleMobileMenuClose();
  };

  const handleMediaGalleryClose = () => {
    setShowMediaGallery(false);
  };

  const handleSearchMessagesOpen = () => {
    if (!chatId) {
      toast.error('Please select a chat first');
      return;
    }
    setShowSearchMessages(true);
    handleMobileMenuClose();
  };

  const handleSearchMessagesClose = () => {
    setShowSearchMessages(false);
  };

  const handleMessageClick = (messageId) => {
    // This will be handled by the Chat component through props
    if (props.onSearchMessageClick) {
      props.onSearchMessageClick(messageId);
    }
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }} height={"4rem"}>
        <AppBar
          position="static"
          sx={{
            background: theme.BUTTON_ACCENT,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <FloatingHearts color={getHeartColor(themeName)} count={30} />
          <Toolbar sx={{ position: 'relative', zIndex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                display: { xs: "none", sm: "block" },
              }}
            >
              My Social Media
            </Typography>

            {/* Friend list drawer trigger for mobile */}
            <Box
              sx={{
                display: { xs: "block", sm: "none" },
              }}
            >
              <IconButton color="inherit" onClick={handleMobile}>
                <PeopleAltIcon />
              </IconButton>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Group members button - visible on mobile when in a group chat */}
            {isGroupChat && (
              <Box
                sx={{
                  display: { xs: "block", md: "none" },
                  mr: 1,
                }}
              >
                <Tooltip title="View Group Members">
                  <IconButton color="inherit" onClick={handleGroupMembersOpen}>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Desktop header actions */}
            <Box sx={{ display: { xs: "none", sm: "flex" } }}>
            <IconBtn
              title={"Search Messages"}
              icon={<SearchIcon />}
              onClick={handleSearchMessagesOpen}
            />
            <IconBtn
              title={"Music Player"}
              icon={<MusicNoteIcon />}
              onClick={openMusicPlayer}
            />
            <IconBtn
              title={"Profile"}
              icon={<AccountCircleIcon />}
              onClick={openProfile}
            />
            <IconBtn
              title={"Media Gallery"}
              icon={<CollectionsIcon />}
              onClick={handleMediaGalleryOpen}
            />
              <IconBtn
                title={"Search Users"}
                icon={<PersonSearchIcon />}
                onClick={openSearch}
              />
              <IconBtn
                title={"New Group"}
                icon={<GroupAddIcon />}
                onClick={openNewGroup}
              />
              <IconBtn
                title={"Manage Groups"}
                icon={<GroupIcon />}
                onClick={navigateToGroup}
              />
              <IconBtn
                title={"Notifications"}
                icon={<NotificationsIcon />}
                onClick={openNotification}
                value={notificationCount}
              />
              <IconBtn
                title={"Logout"}
                icon={<LogoutIcon />}
                onClick={logoutHandler}
              />
              {/* Theme switcher icon and menu */}
              <Tooltip title="Change Theme">
                <IconButton onClick={handleThemeClick} color="inherit">
                  <Brightness4Icon />
                </IconButton>
              </Tooltip>
              {/* Notification sound toggle */}
              <Tooltip title={soundEnabled ? "Disable Notification Sound" : "Enable Notification Sound"}>
                <IconButton onClick={toggleSound} color="inherit">
                  {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                </IconButton>
              </Tooltip>
            </Box>

            {/* Mobile header icons - always visible */}
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <IconButton color="inherit" onClick={handleSearchMessagesOpen}>
                <SearchIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <IconButton color="inherit" onClick={openMusicPlayer}>
                <MusicNoteIcon />
              </IconButton>
            </Box>
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <IconButton color="inherit" onClick={openNotification}>
                <Badge badgeContent={notificationCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Box>
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <Tooltip title={soundEnabled ? "Disable Notification Sound" : "Enable Notification Sound"}>
                <IconButton onClick={toggleSound} color="inherit">
                  {soundEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: { xs: "block", sm: "none" } }}>
              <IconButton color="inherit" onClick={handleMobileMenuClick}>
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={mobileMenuAnchor}
                open={mobileMenuOpen}
                onClose={handleMobileMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem onClick={openProfile}>
                  <AccountCircleIcon sx={{ mr: 1 }} /> Profile
                </MenuItem>
                {isGroupChat && (
                  <MenuItem onClick={handleGroupMembersOpen}>
                    <InfoIcon sx={{ mr: 1 }} /> Group Members
                  </MenuItem>
                )}
                <MenuItem onClick={handleMediaGalleryOpen}>
                  <CollectionsIcon sx={{ mr: 1 }} /> Media Gallery
                </MenuItem>
                <MenuItem onClick={handleSearchMessagesOpen}>
                  <SearchIcon sx={{ mr: 1 }} /> Search Messages
                </MenuItem>
                <MenuItem onClick={openSearch}>
                  <PersonSearchIcon sx={{ mr: 1 }} /> Search Users
                </MenuItem>
                <MenuItem onClick={openNewGroup}>
                  <GroupAddIcon sx={{ mr: 1 }} /> New Group
                </MenuItem>
                <MenuItem onClick={navigateToGroup}>
                  <GroupIcon sx={{ mr: 1 }} /> Manage Groups
                </MenuItem>
                <MenuItem onClick={openNotification}>
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon sx={{ mr: 1 }} />
                  </Badge>
                  Notifications
                </MenuItem>
                <MenuItem onClick={logoutHandler}>
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
                <MenuItem onClick={handleThemeClick}>
                  <Brightness4Icon sx={{ mr: 1 }} /> Change Theme
                </MenuItem>
                <MenuItem onClick={toggleSound}>
                  {soundEnabled ? <VolumeUpIcon sx={{ mr: 1 }} /> : <VolumeOffIcon sx={{ mr: 1 }} />}
                  {soundEnabled ? 'Disable Sound' : 'Enable Sound'}
                </MenuItem>
              </Menu>
              {/* Theme switcher menu for mobile */}
              <Menu anchorEl={anchorEl} open={open} onClose={handleThemeClose}>
                {Object.keys(themes).map((name) => (
                  <MenuItem
                    key={name}
                    selected={themeName === name}
                    onClick={() => handleThemeSelect(name)}
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>

      {isSearch && (
        <Suspense fallback={<Backdrop open />}>
          <SearchDialog />
        </Suspense>
      )}

      {isNotification && (
        <Suspense fallback={<Backdrop open />}>
          <NotifcationDialog />
        </Suspense>
      )}

      {isNewGroup && (
        <Suspense fallback={<Backdrop open />}>
          <NewGroupDialog />
        </Suspense>
      )}
      <Dialog open={showProfile} onClose={closeProfile} maxWidth="xs" fullWidth PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'visible',
          boxShadow: 8,
        }
      }}>
        <DialogContent sx={{
          p: { xs: 1, sm: 3 },
          bgcolor: '#111',
          borderRadius: 3,
          position: 'relative',
          minWidth: { xs: 280, sm: 350 },
          minHeight: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <IconButton
            aria-label="close"
            onClick={closeProfile}
            sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500], zIndex: 2 }}
          >
            <CloseIcon />
          </IconButton>
          <Profile user={user} onAvatarChange={handleAvatarChange} />
        </DialogContent>
      </Dialog>

      {/* Group Members Dialog */}
      <GroupMembersDialog
        open={showGroupMembersDialog}
        onClose={handleGroupMembersClose}
        members={chatDetails?.members || []}
        currentUserId={user?._id}
      />

      {/* Media Gallery Dialog */}
      <MediaGallery
        open={showMediaGallery}
        onClose={handleMediaGalleryClose}
        chatId={chatId}
      />

      {/* Search Messages Dialog */}
      <SearchMessagesDialog
        open={showSearchMessages}
        onClose={handleSearchMessagesClose}
        chatId={chatId}
        onMessageClick={handleMessageClick}
      />
    </>);
};

const IconBtn = ({ title, icon, onClick, value }) => {
  return (
    <Tooltip title={title}>
      <IconButton color="inherit" size="large" onClick={onClick}>
        {value ? (
          <Badge badgeContent={value} color="error">
            {icon}
          </Badge>
        ) : (
          icon
        )}
      </IconButton>
    </Tooltip>
  );
};

export default Header;
