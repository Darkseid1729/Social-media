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
import React, { Suspense, lazy, useState } from "react";


import { useTheme } from "../../context/ThemeContext";
import { themes } from "../../constants/themes";
import AddIcon from "@mui/icons-material/Add";
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import WallpaperDialog from '../dialogs/WallpaperDialog';
import MenuIcon from "@mui/icons-material/Menu";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from "@mui/icons-material/Search";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import { Menu, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
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



const SearchDialog = lazy(() => import("../specific/Search"));
const NotifcationDialog = lazy(() => import("../specific/Notifications"));
const NewGroupDialog = lazy(() => import("../specific/NewGroup"));



const Header = (props) => {

  // Theme switcher state and handlers
  const { themeName, changeTheme, theme } = useTheme();
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


  // Wallpaper dialog state
  const [showWallpaperDialog, setShowWallpaperDialog] = useState(false);
  // Use chatId from props
  const chatId = props.chatId;

  const handleWallpaperChange = () => {
    setShowWallpaperDialog(true);
  };

  const handleWallpaperDialogClose = () => {
    setShowWallpaperDialog(false);
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }} height={"4rem"}>
        <AppBar
          position="static"
          sx={{
            background: theme.BUTTON_ACCENT,
          }}
        >
          <Toolbar>
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

            {/* Desktop header actions */}
            <Box sx={{ display: { xs: "none", sm: "flex" } }}>
            <IconBtn
              title={"Profile"}
              icon={<AccountCircleIcon />}
              onClick={openProfile}
            />
            <IconBtn
              title={"Change Chat Wallpaper"}
              icon={<PhotoLibraryIcon />}
              onClick={handleWallpaperChange}
            />
      {/* Wallpaper change modal */}
      <WallpaperDialog
        open={showWallpaperDialog}
        onClose={handleWallpaperDialogClose}
        chatId={chatId}
        onSuccess={() => toast.success('Wallpaper updated!')}
      />
              <IconBtn
                title={"Search"}
                icon={<SearchIcon />}
                onClick={openSearch}
              />
              <IconBtn
                title={"New Group"}
                icon={<AddIcon />}
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
            </Box>

            {/* Mobile header menu dropdown trigger */}
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
                <MenuItem onClick={openSearch}>
                  <SearchIcon sx={{ mr: 1 }} /> Search
                </MenuItem>
                <MenuItem onClick={openNewGroup}>
                  <AddIcon sx={{ mr: 1 }} /> New Group
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
    </>
  );
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
