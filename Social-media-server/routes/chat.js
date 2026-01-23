

import express from "express";
const app = express.Router();

import {
  addMembers,
  deleteChat,
  getChatDetails,
  getMessages,
  getMyChats,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMember,
  renameGroup,
  sendAttachments,
  setWallpaper,
  addMessageReaction,
  removeMessageReaction,
  getChatMedia,
  deleteMessage,
  forwardMessage,
  searchMessages,
  getMessagesAroundMessage,
  getMoreMessages,
} from "../controllers/chat.js";
import { singleAvatar } from "../middlewares/multer.js";
import {
  addMemberValidator,
  chatIdValidator,
  newGroupValidator,
  removeMemberValidator,
  renameValidator,
  sendAttachmentsValidator,
  validateHandler,
} from "../lib/validators.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { attachmentsMulter } from "../middlewares/multer.js";


// Set wallpaper for chat
app.put("/wallpaper", singleAvatar, setWallpaper);

app.use(isAuthenticated);

app.post("/new", newGroupValidator(), validateHandler, newGroupChat);

app.get("/my", getMyChats);

app.get("/my/groups", getMyGroups);

app.put("/addmembers", addMemberValidator(), validateHandler, addMembers);

app.put(
  "/removemember",
  removeMemberValidator(),
  validateHandler,
  removeMember
);

app.delete("/leave/:id", chatIdValidator(), validateHandler, leaveGroup);

// Send Attachments
app.post(
  "/message",
  attachmentsMulter,
  sendAttachmentsValidator(),
  validateHandler,
  sendAttachments
);

// Get Messages
app.get("/message/:id", chatIdValidator(), validateHandler, getMessages);

// Get messages around a specific message (for jump-to-message feature)
app.get("/messages/:chatId/around/:messageId", getMessagesAroundMessage);

// Get more messages (older or newer) from a timestamp
app.get("/messages/:chatId/more", getMoreMessages);

// Search Messages
app.get("/search/:id", chatIdValidator(), validateHandler, searchMessages);

// Get Chat Media (photos and videos)
app.get("/media/:id", chatIdValidator(), validateHandler, getChatMedia);

// Get Chat Details, rename,delete
app
  .route("/:id")
  .get(chatIdValidator(), validateHandler, getChatDetails)
  .put(renameValidator(), validateHandler, renameGroup)
  .delete(chatIdValidator(), validateHandler, deleteChat);

// Message reactions
app.post("/reaction/add", isAuthenticated, addMessageReaction);
app.post("/reaction/remove", isAuthenticated, removeMessageReaction);

// Forward message
app.post("/forward", isAuthenticated, forwardMessage);

// Delete message
app.delete("/message/:id", isAuthenticated, deleteMessage);

export default app;
