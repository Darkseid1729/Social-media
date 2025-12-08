import React, { useRef, useEffect } from "react";
import { Avatar, Stack, Typography } from "@mui/material";
import ImageDialog from "../shared/ImageDialog";
import ConfirmDialog from "../shared/ConfirmDialog";
import {
  Face as FaceIcon,
  AlternateEmail as UserNameIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import moment from "moment";
import { transformImage } from "../../lib/features";
import { useTheme } from "../../context/ThemeContext";
import { themes } from "../../constants/themes";

const Profile = ({ user, onAvatarChange }) => {
  const { themeName } = useTheme();
  const theme = themes[themeName];
  const fileInputRef = React.useRef(null);


  const [showUpdateConfirm, setShowUpdateConfirm] = React.useState(false);
  const [showAvatarModal, setShowAvatarModal] = React.useState(false);
  const confirmBoxRef = useRef(null);
  const [touchStartTime, setTouchStartTime] = React.useState(0);

  const handleAvatarClick = (e) => {
    // Only handle left click for viewing avatar
    if (e.type === "click" && e.button === 0) {
      if (user?.avatar?.url && !onAvatarChange) {
        // If not editable, show avatar
        setShowAvatarModal(true);
      } else if (onAvatarChange) {
        // For own profile, show preview
        setShowAvatarModal(true);
      }
    }
  };

  const handleTouchStart = (e) => {
    if (onAvatarChange) {
      setTouchStartTime(Date.now());
    }
  };

  const handleTouchEnd = (e) => {
    if (onAvatarChange) {
      const touchDuration = Date.now() - touchStartTime;
      // Long press (> 500ms) on mobile to change avatar
      if (touchDuration > 500) {
        e.preventDefault();
        setShowUpdateConfirm(true);
      }
    }
  };

  const handleCloseAvatarModal = () => {
    setShowAvatarModal(false);
  };

  const handleAvatarContextMenu = (e) => {
    e.preventDefault();
    if (onAvatarChange) {
      setShowUpdateConfirm(true);
    }
  };

  const handleConfirmUpdate = () => {
    setShowUpdateConfirm(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancelUpdate = () => {
    setShowUpdateConfirm(false);
  };

  // Click-away listener for confirmation box
  useEffect(() => {
    if (!showUpdateConfirm) return;
    const handleClickOutside = (event) => {
      if (confirmBoxRef.current && !confirmBoxRef.current.contains(event.target)) {
        setShowUpdateConfirm(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUpdateConfirm]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
  };

  return (
    <Stack spacing={"2rem"} direction={"column"} alignItems={"center"}>
      {/* Avatar logic for own and friend's profile */}
      <>
        {onAvatarChange && (
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        )}
        <Avatar
          src={transformImage(user?.avatar?.url)}
          sx={{
            width: 200,
            height: 200,
            objectFit: "contain",
            marginBottom: "1rem",
            border: `5px solid ${theme.TEXT_PRIMARY}`,
            cursor: user?.avatar?.url ? "pointer" : "default",
          }}
          onClick={handleAvatarClick}
          onContextMenu={onAvatarChange ? handleAvatarContextMenu : undefined}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          title={onAvatarChange ? "Click to view, long-press or right-click to change avatar" : "Click to view avatar"}
        />
        <ImageDialog
          open={showAvatarModal}
          onClose={handleCloseAvatarModal}
          imageUrl={user?.avatar?.url}
          alt="Avatar Preview"
        />
        {onAvatarChange && (
          <ConfirmDialog
            open={showUpdateConfirm}
            confirmBoxRef={confirmBoxRef}
            title="Update Avatar"
            message="Do you want to update your avatar?"
            onConfirm={handleConfirmUpdate}
            onCancel={handleCancelUpdate}
            confirmText="Yes"
            cancelText="No"
          />
        )}
      </>
      <ProfileCard heading={"Bio"} text={user?.bio} nameColor={theme.PROFILE_BIO_COLOR} />
      <ProfileCard
        heading={"Username"}
        text={user?.username}
        Icon={<UserNameIcon />}
        nameColor={theme.PROFILE_USERNAME_COLOR}
      />
      <ProfileCard heading={"Name"} text={user?.name} Icon={<FaceIcon />} nameColor={theme.PROFILE_NAME_COLOR} />
      <ProfileCard
        heading={"Joined"}
        nameColor={theme.PROFILE_JOINED_COLOR}
        text={moment(user?.createdAt).fromNow()}
        Icon={<CalendarIcon />}
      />
    </Stack>
  );
};

const ProfileCard = ({ text, Icon, heading, nameColor }) => (
  <Stack
    direction={"row"}
    alignItems={"center"}
    spacing={"1rem"}
    textAlign={"center"}
  >
    {Icon && Icon}

    <Stack>
      <Typography color={nameColor} variant="caption" fontWeight={600}>
        {heading}
      </Typography>
      <Typography variant="body1" sx={{ color: nameColor, fontWeight: 700 }}>{text}</Typography>
    </Stack>
  </Stack>
);

export default Profile;
