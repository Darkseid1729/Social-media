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

const Profile = ({ user, onAvatarChange }) => {
  const { theme } = useTheme();
  const fileInputRef = React.useRef(null);


  const [showUpdateConfirm, setShowUpdateConfirm] = React.useState(false);
  const [showAvatarModal, setShowAvatarModal] = React.useState(false);
  const confirmBoxRef = useRef(null);

  const handleAvatarClick = (e) => {
    // Only handle left click
    if (e.type === "click" && e.button === 0) {
      if (user?.avatar?.url) {
        setShowAvatarModal(true);
      }
    }
  };

  const handleCloseAvatarModal = () => {
    setShowAvatarModal(false);
  };

  const handleAvatarContextMenu = (e) => {
    e.preventDefault();
    setShowUpdateConfirm(true);
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
      {/* Avatar change debug message removed */}
      {onAvatarChange && (
        <>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Avatar
            src={transformImage(user?.avatar?.url)}
            sx={{
              width: 200,
              height: 200,
              objectFit: "contain",
              marginBottom: "1rem",
              border: `5px solid ${theme.TEXT_PRIMARY}`,
              cursor: "pointer",
            }}
            onClick={handleAvatarClick}
            onContextMenu={handleAvatarContextMenu}
            title="Click or right-click to change avatar"
          />
          <ImageDialog
            open={showAvatarModal}
            onClose={handleCloseAvatarModal}
            imageUrl={user?.avatar?.url}
            alt="Avatar Preview"
          />
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
        </>
      )}
      {!onAvatarChange && (
        <Avatar
          src={transformImage(user?.avatar?.url)}
          sx={{
            width: 200,
            height: 200,
            objectFit: "contain",
            marginBottom: "1rem",
            border: `5px solid ${theme.TEXT_PRIMARY}`,
          }}
        />
      )}
      <ProfileCard heading={"Bio"} text={user?.bio} />
      <ProfileCard
        heading={"Username"}
        text={user?.username}
        Icon={<UserNameIcon />}
      />
      <ProfileCard heading={"Name"} text={user?.name} Icon={<FaceIcon />} nameColor={theme.PROFILE_NAME_COLOR} />
      <ProfileCard
        heading={"Joined"}
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
    color={heading === "Name" && nameColor ? nameColor : undefined}
    textAlign={"center"}
  >
    {Icon && Icon}

    <Stack>
      <Typography color={"gray"} variant="caption" fontWeight={600}>
        {heading}
      </Typography>
      <Typography variant="body1" sx={heading === "Name" && nameColor ? { color: nameColor, fontWeight: 700 } : {}}>{text}</Typography>
    </Stack>
  </Stack>
);

export default Profile;
