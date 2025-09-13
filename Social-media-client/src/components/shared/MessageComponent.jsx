import { Box, Typography } from "@mui/material";
import React, { memo, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import moment from "moment";
import "moment-timezone";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "./RenderAttachment";
import TextWithLinks from "./TextWithLinks";
import ReactionPicker from "./ReactionPicker";
import ReactionsDisplay from "./ReactionsDisplay";
import { useAddMessageReactionMutation, useRemoveMessageReactionMutation } from "../../redux/api/api";
import { motion } from "framer-motion";

const MessageComponent = ({ message, user }) => {
  // console.log('MessageComponent message:', message); // Debug line
  const { sender, content, attachments = [], createdAt, reactions = [], _id: messageId } = message;
  const { theme } = useTheme();
  const [reactionPickerAnchor, setReactionPickerAnchor] = useState(null);
  const [addReaction] = useAddMessageReactionMutation();
  const [removeReaction] = useRemoveMessageReactionMutation();

  const sameSender = sender?._id === user?._id;
  // Format time in Indian timezone
  const indianTime = moment(createdAt).tz("Asia/Kolkata").format("hh:mm A");

  const handleContextMenu = (e) => {
    e.preventDefault();
    setReactionPickerAnchor(e.currentTarget);
  };

  const handleReactionSelect = async (emoji) => {
    try {
      await addReaction({ messageId, emoji }).unwrap();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleReactionClick = async (emoji, hasCurrentUser) => {
    try {
      if (hasCurrentUser) {
        await removeReaction({ messageId, emoji }).unwrap();
      } else {
        await addReaction({ messageId, emoji }).unwrap();
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const closeReactionPicker = () => {
    setReactionPickerAnchor(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: "-100%" }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: "-100%" }}
      transition={{ duration: 0.3 }}
      style={{
        alignSelf: sameSender ? "flex-end" : "flex-start",
        background:
          sameSender
            ? theme.CHAT_COLOR_BG
            : theme.LIGHT_BG,
        color: sameSender ? theme.CHAT_TEXT_COLOR : theme.TEXT_PRIMARY,
        borderRadius: 12,
        padding: "0.85rem 1.1rem 0.6rem 1.1rem",
        width: "fit-content",
        maxWidth: "80vw",
        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
        marginBottom: "0.7rem",
        opacity: 1,
        transform: "translateX(0%) translateZ(0px)",
        cursor: 'pointer',
      }}
      onContextMenu={handleContextMenu}
    >
      {/* Sender Name (only for other users) */}
      {!sameSender && (
        <Typography
          style={{ color: theme.SENDER_NAME_COLOR, marginBottom: 2 }}
          fontWeight={"600"}
          variant="caption"
        >
          {sender?.name}
        </Typography>
      )}
      {/* Render sticker or GIF/image if content is a sticker path or image URL */}
      {content &&
        ((/^\/StickersGenshin\/.+\.(png|jpg|jpeg|gif|webp)$/i.test(content)) ||
         /^https?:\/\/res\.cloudinary\.com\/.+\.(png|jpg|jpeg|gif|webp)$/i.test(content)) ? (
          <Box sx={{ display: 'flex', justifyContent: sameSender ? 'flex-end' : 'flex-start', mb: 1 }}>
            <img
              src={content}
              alt="Sticker"
              style={{
                width: '100%',
                maxWidth: '320px',
                maxHeight: '220px',
                borderRadius: 8,
                objectFit: 'cover',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                display: 'block',
                // Mobile responsive
                '@media (max-width: 600px)': {
                  maxWidth: '160px',
                  maxHeight: '110px',
                },
              }}
            />
          </Box>
        ) : content && content.endsWith('.gif') ? (
          <Box sx={{ display: 'flex', justifyContent: sameSender ? 'flex-end' : 'flex-start', mb: 1 }}>
            <img
              src={content}
              alt="GIF"
              style={{
                width: '100%',
                maxWidth: '320px',
                maxHeight: '220px',
                borderRadius: 8,
                objectFit: 'cover',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                display: 'block',
              }}
            />
          </Box>
        ) : content && (
          <TextWithLinks text={content} showPreviews={true} />
        )}

      {attachments.length > 0 &&
        attachments.map((attachment, index) => {
          const url = attachment.url;
          const file = fileFormat(url);

          return (
            <Box key={index} sx={{ mt: 0.5 }}>
              <a
                href={url}
                target="_blank"
                download
                style={{
                  color: theme.TEXT_PRIMARY,
                  textDecoration: 'none',
                }}
              >
                {RenderAttachment(file, url)}
              </a>
            </Box>
          );
        })}

      {/* Reactions Display */}
      <ReactionsDisplay 
        reactions={reactions}
        onReactionClick={handleReactionClick}
        currentUserId={user?._id}
      />

      {/* Actual Indian time at the bottom */}
      <Typography variant="caption" style={{ color: theme.TIMEAGO_COLOR, marginTop: 8, display: 'block', textAlign: sameSender ? 'right' : 'left' }}>
        {indianTime}
      </Typography>

      {/* Reaction Picker */}
      <ReactionPicker
        open={Boolean(reactionPickerAnchor)}
        anchorEl={reactionPickerAnchor}
        onClose={closeReactionPicker}
        onReactionSelect={handleReactionSelect}
      />
    </motion.div>
  );
};

export default memo(MessageComponent);
