import React, { memo, useState } from "react";
import { Link } from "../styles/StyledComponents";
import { Box, Stack, Typography } from "@mui/material";
import AvatarCard from "./AvatarCard";
import { motion } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { formatLastSeen } from "../../utils/timeUtils";
import ProfileViewDialog from "../dialogs/ProfileViewDialog";

const ChatItem = ({
  avatar = [],
  name,
  _id,
  groupChat = false,
  sameSender,
  isOnline,
  newMessageAlert,
  index = 0,
  handleDeleteChat,
  lastSeen,
  members = [], // Array of member objects with user info
}) => {
  const { theme } = useTheme();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  
  // Only show lastSeen for 1-on-1 chats where user is offline
  const shouldShowLastSeen = !groupChat && !isOnline && lastSeen;
  
  // Calculate time difference - only show if more than 2 minutes ago
  let lastSeenText = null;
  if (shouldShowLastSeen) {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMinutes = Math.floor((now - lastSeenDate) / 1000 / 60);
    
    // Only show if user was last seen more than 2 minutes ago
    if (diffMinutes >= 2) {
      lastSeenText = formatLastSeen(lastSeen);
    }
  }

  // Get user info for 1-on-1 chats (the other person in the chat)
  const otherUser = !groupChat && members.length > 0 ? members[0] : null;

  const handleAvatarClick = (e) => {
    // Only handle avatar clicks for 1-on-1 chats
    if (!groupChat && otherUser) {
      e.preventDefault();
      e.stopPropagation();
      setProfileDialogOpen(true);
    }
  };

  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
  };
  
  return (
    <>
      <Link
        sx={{
          padding: "0",
        }}
        to={`/chat/${_id}`}
        onContextMenu={(e) => handleDeleteChat(e, _id, groupChat)}
      >
        <motion.div
          initial={{ opacity: 0, y: "-100%" }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            backgroundColor: sameSender ? "black" : "unset",
            color: sameSender ? "white" : "unset",
            position: "relative",
            padding: "1rem",
          }}
        >
          <div onClick={handleAvatarClick} style={{ cursor: !groupChat ? 'pointer' : 'default' }}>
            <AvatarCard avatar={avatar} />
          </div>

          <Stack>
            <Typography sx={{ color: theme.FRIEND_NAME_COLOR, fontWeight: 600 }}>{name}</Typography>
            {newMessageAlert && (
              <Typography>{newMessageAlert.count} New Message</Typography>
            )}
            {lastSeenText && (
              <Typography sx={{ fontSize: "0.75rem", color: theme.TEXT_SECONDARY || "#888" }}>
                Last seen {lastSeenText}
              </Typography>
            )}
          </Stack>

          {isOnline && (
            <Box
              sx={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "green",
                position: "absolute",
                top: "50%",
                right: "1rem",
                transform: "translateY(-50%)",
              }}
            />
          )}
        </motion.div>
      </Link>

      {/* Profile View Dialog */}
      {otherUser && (
        <ProfileViewDialog
          open={profileDialogOpen}
          onClose={handleCloseProfile}
          userId={otherUser._id}
          userInfo={otherUser}
        />
      )}
    </>
  );
};

export default memo(ChatItem);
