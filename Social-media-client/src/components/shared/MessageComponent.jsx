import { Box, Typography } from "@mui/material";
import React, { memo } from "react";
import { useTheme } from "../../context/ThemeContext";
import moment from "moment";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "./RenderAttachment";
import { motion } from "framer-motion";

const MessageComponent = ({ message, user }) => {
  // console.log('MessageComponent message:', message); // Debug line
  const { sender, content, attachments = [], createdAt } = message;
  const { theme } = useTheme();

  const sameSender = sender?._id === user?._id;
  const timeAgo = moment(createdAt).fromNow();

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
            ? "linear-gradient(135deg, #1b4020 0%, #5f5e5e 100%)"
            : theme.LIGHT_BG,
        color: sameSender ? "#fff" : theme.TEXT_PRIMARY,
        borderRadius: 12,
        padding: "0.85rem 1.1rem 0.6rem 1.1rem",
        width: "fit-content",
        maxWidth: "80vw",
        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
        marginBottom: "0.7rem",
        opacity: 1,
        transform: "translateX(0%) translateZ(0px)",
      }}
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
      {/* Render GIF if content is a GIF URL */}
      {content && content.endsWith('.gif') ? (
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
        <Typography style={{ marginBottom: 6, wordBreak: 'break-word' }}>{content}</Typography>
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

      <Typography variant="caption" style={{ color: theme.TIMEAGO_COLOR, marginTop: 8, display: 'block', textAlign: sameSender ? 'right' : 'left' }}>
        {timeAgo}
      </Typography>
    </motion.div>
  );
};

export default memo(MessageComponent);
