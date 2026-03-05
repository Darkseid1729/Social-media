import { Box, Typography, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import React, { memo, useState, useMemo, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import moment from "moment";
import "moment-timezone";
import { fileFormat } from "../../lib/features";
import RenderAttachment from "./RenderAttachment";
import ImageGrid from "./ImageGrid";
import TextWithLinks from "./TextWithLinks";
import ReactionPicker from "./ReactionPicker";
import ReactionsDisplay from "./ReactionsDisplay";
import ReplyDisplay from "./ReplyDisplay";
import { Reply as ReplyIcon, EmojiEmotions as EmojiIcon, Delete as DeleteIcon, Forward as ForwardIcon } from "@mui/icons-material";
import { useAddMessageReactionMutation, useRemoveMessageReactionMutation, useDeleteMessageMutation } from "../../redux/api/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import ForwardDialog from "../dialogs/ForwardDialog";
import "./GiftCardMessage.css";

// ── Gift Card theme map (mirrors GiftCardDialog THEMES) ──────────────
const GIFT_THEMES = {
  gold:   { bg: "linear-gradient(135deg,#f7c948 0%,#f0a500 100%)",  text: "#5a3a00" },
  rose:   { bg: "linear-gradient(135deg,#ff6b9d 0%,#c83b6e 100%)", text: "#fff" },
  ocean:  { bg: "linear-gradient(135deg,#43b0f1 0%,#1565c0 100%)", text: "#fff" },
  forest: { bg: "linear-gradient(135deg,#56ab2f 0%,#1b6a2a 100%)", text: "#fff" },
  sunset: { bg: "linear-gradient(135deg,#ff6e40 0%,#c62828 100%)", text: "#fff" },
  violet: { bg: "linear-gradient(135deg,#a855f7 0%,#6b21a8 100%)", text: "#fff" },
};

const CONFETTI_COLORS = ["#f7c948","#ff6b9d","#43b0f1","#56ab2f","#a855f7","#ff6e40","#fff"];

const GiftCardBubble = ({ data, revealed, onReveal }) => {
  const themeObj = GIFT_THEMES[data.theme] || GIFT_THEMES.gold;
  const confettiRef = useRef(null);

  const handleClick = () => {
    if (revealed) return;
    // Spawn confetti
    if (confettiRef.current) {
      for (let i = 0; i < 12; i++) {
        const piece = document.createElement("div");
        piece.className = "gc-confetti-piece";
        piece.style.left = `${Math.random() * 90}%`;
        piece.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        piece.style.animationDelay = `${Math.random() * 0.3}s`;
        piece.style.transform = `rotate(${Math.random() * 60}deg)`;
        confettiRef.current.appendChild(piece);
        setTimeout(() => piece.remove(), 1000);
      }
    }
    onReveal?.();
  };

  return (
    <div ref={confettiRef} style={{ position: "relative" }}>
      <div
        className={`gift-card-scene${revealed ? " revealed" : ""}`}
        onClick={handleClick}
        title={revealed ? "" : "Tap to reveal your gift!"}
      >
        <div className="gift-card-flipper">
          {/* Front */}
          <div className="gift-card-front">
            <div className="gc-ribbon">{data.emoji || "🎁"}</div>
            <div className="gc-label">Gift Card</div>
            <div className="gc-tap-hint">Tap to reveal ✨</div>
          </div>
          {/* Back */}
          <div className="gift-card-back" style={{ background: themeObj.bg, color: themeObj.text }}>
            <div className="gc-deco-circle gc-deco-circle-1" />
            <div className="gc-deco-circle gc-deco-circle-2" />
            <div className="gc-top">
              <span className="gc-icon">{data.emoji || "🎁"}</span>
              <span className="gc-sublabel">Gift Card</span>
            </div>
            <div className="gc-amount">{data.currency}{data.amount}</div>
            {data.from && <div className="gc-from">From: {data.from}</div>}
            {data.message && <div className="gc-msg">"{data.message}"</div>}
            <div className="gc-footer">Tap to flip back • Sent with ❤️ via Chat</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Generate a consistent color shade based on userId (using last 5 characters for better distribution)
const getUserColorShade = (userId, baseColor) => {
  if (!userId) return baseColor;
  
  // Use only last 5 characters of userId for better color distribution
  const last5 = userId.slice(-10);
  
  // Simple hash function to convert last 5 chars to a number
  let hash = 0;
  for (let i = 0; i < last5.length; i++) {
    hash = last5.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Generate hue variation (0-360 degrees) - spread across full spectrum
  const hue = Math.abs(hash % 360);
  
  // Generate lightness variation (50-70% for good readability)
  const lightness = 50 + (Math.abs(hash >> 8) % 20);
  
  // Generate saturation variation (65-85% for vibrant but not overwhelming)
  const saturation = 65 + (Math.abs(hash >> 16) % 20);
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const MessageComponent = ({ message, user, onReply, onScrollToMessage, onDelete, onGiftCardReveal }) => {
  // console.log('MessageComponent message:', message); // Debug line
  const { sender, content, attachments = [], createdAt, reactions = [], _id: messageId, replyTo, isForwarded, giftCardRevealed } = message;
  const { theme } = useTheme();
  const [contextMenu, setContextMenu] = useState(null);
  const [reactionPickerAnchor, setReactionPickerAnchor] = useState(null);
  const [touchTimer, setTouchTimer] = useState(null);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const [addReaction] = useAddMessageReactionMutation();
  const [removeReaction] = useRemoveMessageReactionMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const sameSender = sender?._id === user?._id;
  
  // Check if message can be deleted (within 10 minutes)
  const canDelete = useMemo(() => {
    if (!sameSender) return false;
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    return new Date(createdAt) > tenMinutesAgo;
  }, [sameSender, createdAt]);
  
  // Format time in Indian timezone with date (e.g., "1 jan: 04:48 PM")
  const indianTime = moment(createdAt).tz("Asia/Kolkata").format("D MMM: hh:mm A");

  // Generate consistent color for this sender (only for other users)
  const senderColor = useMemo(() => {
    if (sameSender) return theme.SENDER_NAME_COLOR;
    return getUserColorShade(sender?._id, theme.SENDER_NAME_COLOR);
  }, [sender?._id, sameSender, theme.SENDER_NAME_COLOR]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({ mouseX: e.clientX - 2, mouseY: e.clientY - 4 });
  };

  const handleTouchStart = (e) => {
    const timer = setTimeout(() => {
      const touch = e.touches[0];
      setContextMenu({ mouseX: touch.clientX - 2, mouseY: touch.clientY - 4 });
    }, 500); // 500ms long-press
    setTouchTimer(timer);
  };

  const handleTouchEnd = () => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleReply = () => {
    onReply?.(message);
    handleCloseContextMenu();
  };

  const handleShowReactions = () => {
    setReactionPickerAnchor(document.getElementById(`message-${messageId}`));
    handleCloseContextMenu();
  };

  const handleDelete = async () => {
    handleCloseContextMenu();
    if (!canDelete) {
      toast.error("Cannot delete messages older than 10 minutes");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        // Immediately remove from UI
        onDelete?.(messageId);
        // Call API to delete on server
        await deleteMessage(messageId).unwrap();
        toast.success("Message deleted successfully");
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete message");
      }
    }
  };

  const handleForward = () => {
    handleCloseContextMenu();
    setForwardDialogOpen(true);
  };

  const handleReplyClick = () => {
    if (replyTo && onScrollToMessage) {
      onScrollToMessage(replyTo._id);
    }
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
      id={`message-${messageId}`}
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
        maxWidth: window.innerWidth > 768 ? "80%" : "80vw",
        boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
        marginBottom: "0.7rem",
        opacity: 1,
        transform: "translateX(0%) translateZ(0px)",
        cursor: 'pointer',
      }}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
    >
      {/* Reply Display */}
      {replyTo && (
        <ReplyDisplay 
          replyTo={replyTo} 
          onClick={handleReplyClick}
        />
      )}
      {/* Forwarded Badge */}
      {isForwarded && (
        <Typography
          variant="caption"
          sx={{
            color: theme.TEXT_SECONDARY,
            fontStyle: "italic",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 0.5,
          }}
        >
          <ForwardIcon sx={{ fontSize: 14 }} />
          Forwarded
        </Typography>
      )}
      {/* Sender Name (only for other users) */}
      {!sameSender && (
        <Typography
          style={{ color: senderColor, marginBottom: 2 }}
          fontWeight={"600"}
          variant="caption"
        >
          {sender?.name}
        </Typography>
      )}
      {/* ── Gift Card ── */}
      {content && content.startsWith("__GIFT_CARD__:") ? (() => {
        let cardData = null;
        try { cardData = JSON.parse(content.slice("__GIFT_CARD__:".length)); } catch {}
        return cardData ? (
          <GiftCardBubble
            data={cardData}
            revealed={!!giftCardRevealed}
            onReveal={() => onGiftCardReveal?.(messageId)}
          />
        ) : null;
      })() : (
      /* Render sticker or GIF/image if content is a sticker path or image URL */
      content &&
        ((/^\/StickersGenshin\/.+\.(png|jpg|jpeg|gif|webp)$/i.test(content)) ||
         /^https?:\/\/res\.cloudinary\.com\/.+\.(png|jpg|jpeg|gif|webp)$/i.test(content)) ? (
          <Box sx={{ display: 'flex', justifyContent: sameSender ? 'flex-end' : 'flex-start', mb: 1 }}>
            {/* Use MUI responsive sx for consistent sizing (mobile vs desktop) */}
            <Box
              component="img"
              src={content}
              alt="Sticker"
              sx={{
                width: 'auto',
                height: { xs: 120, sm: 220 }, // smaller on phones, fixed taller on desktop
                maxWidth: { xs: 160, sm: 260 },
                objectFit: 'contain',
                borderRadius: 1,
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                display: 'block',
              }}
            />
          </Box>
        ) : content && content.endsWith('.gif') ? (
          <Box sx={{ display: 'flex', justifyContent: sameSender ? 'flex-end' : 'flex-start', mb: 1 }}>
            <Box
              component="img"
              src={content}
              alt="GIF"
              sx={{
                width: '100%',
                maxWidth: { xs: 240, sm: 360 },
                maxHeight: { xs: 180, sm: 260 },
                borderRadius: 1,
                objectFit: 'cover',
                boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                display: 'block',
              }}
            />
          </Box>
        ) : content && (
          <TextWithLinks text={content} showPreviews={true} />
        ))}

      {attachments.length > 0 && (() => {
        const imageAttachments = attachments.filter(a => fileFormat(a.url) === 'image');
        const otherAttachments = attachments.filter(a => fileFormat(a.url) !== 'image');

        return (
          <React.Fragment key="attachments">
            {imageAttachments.length > 0 && (
              <Box key="image-grid" sx={{ mt: 0.5, maxWidth: '100%', overflow: 'hidden' }}>
                <ImageGrid images={imageAttachments} />
              </Box>
            )}

            {otherAttachments.length > 0 && otherAttachments.map((attachment) => {
              const url = attachment.url;
              const file = fileFormat(url);
              return (
                <Box key={attachment.public_id || attachment.url} sx={{ mt: 0.5 }}>
                  <a
                    href={url}
                    target="_blank"
                    download
                    style={{ color: theme.TEXT_PRIMARY, textDecoration: 'none' }}
                  >
                    {RenderAttachment(file, url)}
                  </a>
                </Box>
              );
            })}
          </React.Fragment>
        );
      })()}

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

      {/* Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          sx: {
            backgroundColor: theme.LIGHT_BG,
            border: `1px solid ${theme.SUBTLE_BG_20}`,
            borderRadius: 2,
            minWidth: 150,
          }
        }}
      >
        <MenuItem onClick={handleReply}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" sx={{ color: theme.TEXT_SECONDARY }} />
          </ListItemIcon>
          <ListItemText primary="Reply" />
        </MenuItem>
        <MenuItem onClick={handleShowReactions}>
          <ListItemIcon>
            <EmojiIcon fontSize="small" sx={{ color: theme.TEXT_SECONDARY }} />
          </ListItemIcon>
          <ListItemText primary="Add Reaction" />
        </MenuItem>
        <MenuItem onClick={handleForward}>
          <ListItemIcon>
            <ForwardIcon fontSize="small" sx={{ color: theme.TEXT_SECONDARY }} />
          </ListItemIcon>
          <ListItemText primary="Forward" />
        </MenuItem>
        {canDelete && (
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: theme.TEXT_SECONDARY }} />
            </ListItemIcon>
            <ListItemText primary="Delete Message" />
          </MenuItem>
        )}
      </Menu>

      {/* Reaction Picker */}
      <ReactionPicker
        open={Boolean(reactionPickerAnchor)}
        anchorEl={reactionPickerAnchor}
        onClose={closeReactionPicker}
        onReactionSelect={handleReactionSelect}
      />

      {/* Forward Dialog */}
      <ForwardDialog
        open={forwardDialogOpen}
        onClose={() => setForwardDialogOpen(false)}
        messageId={messageId}
      />
    </motion.div>
  );
};

export default memo(MessageComponent);
