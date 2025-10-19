import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import { Chat } from "../models/chat.js";
import {
  deletFilesFromCloudinary,
  emitEvent,
  uploadFilesToCloudinary,
  // ...existing imports...
} from "../utils/features.js";
import {
  ALERT,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  REFETCH_CHATS,
  MESSAGE_REACTION_ADDED,
  MESSAGE_REACTION_REMOVED,
} from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";
import { User } from "../models/user.js";
import { Message } from "../models/message.js";
import mongoose from "mongoose";

const newGroupChat = TryCatch(async (req, res, next) => {
  const { name, members } = req.body;

  const allMembers = [...members, req.user];

  await Chat.create({
    name,
    groupChat: true,
    creator: req.user,
    members: allMembers,
  });

  emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
  emitEvent(req, REFETCH_CHATS, members);

  return res.status(201).json({
    success: true,
    message: "Group Created",
  });
});

const getMyChats = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({ members: req.user }).populate(
    "members",
    "name avatar"
  );

  const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
    const otherMember = getOtherMember(members, req.user);

    // Handle self-chat (user sent friend request to themselves)
    if (!groupChat && !otherMember) {
      const selfMember = members.find(member => member._id.toString() === req.user.toString());
      return {
        _id,
        groupChat,
        avatar: [selfMember?.avatar?.url || ""],
        name: `${selfMember?.name || "You"} (Self)`,
        members: [],
      };
    }

    return {
      _id,
      groupChat,
      avatar: groupChat
        ? members.slice(0, 3).map(({ avatar }) => avatar?.url || "")
        : [otherMember?.avatar?.url || ""],
      name: groupChat ? name : otherMember?.name || "Unknown User",
      members: members.reduce((prev, curr) => {
        if (curr._id.toString() !== req.user.toString()) {
          prev.push(curr._id);
        }
        return prev;
      }, []),
    };
  });

  return res.status(200).json({
    success: true,
    chats: transformedChats,
  });
});

const getMyGroups = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({
    members: req.user,
    groupChat: true,
    creator: req.user,
  }).populate("members", "name avatar");

  const groups = chats.map(({ members, _id, groupChat, name }) => ({
    _id,
    groupChat,
    name,
    avatar: members.slice(0, 3).map(({ avatar }) => avatar?.url || ""),
  }));

  return res.status(200).json({
    success: true,
    groups,
  });
});

const addMembers = TryCatch(async (req, res, next) => {
  const { chatId } = req.body;
  const file = req.file;
  // Debug log incoming data
  console.log('setWallpaper req.body:', req.body);
  console.log('setWallpaper req.file:', req.file);
  // Import mongoose at the top of the file if not already imported
  // Validate chatId format and ensure it's not the string 'null'
  const validChatId = chatId && chatId !== 'null';
  const mongoose = require('mongoose');
  if (!validChatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    return next(new ErrorHandler("Invalid chatId format", 400));
  }
  if (!file) return next(new ErrorHandler("No wallpaper file uploaded", 400));
  // Validate file type (image only)
  if (!file.mimetype.startsWith("image/")) {
    return next(new ErrorHandler("Only image files are allowed for wallpaper", 400));
  }
  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ErrorHandler("Chat not found", 404));
  // Only allow members to set wallpaper (handle ObjectId vs string)
  const isMember = chat.members.some(
    member => member.toString() === req.user.toString()
  );
  if (!isMember) return next(new ErrorHandler("Not a member of this chat", 403));
  // Upload wallpaper to cloudinary
  const [wallpaperObj] = await uploadFilesToCloudinary([file]);
  chat.wallpaper = {
    public_id: wallpaperObj.public_id || "",
    url: wallpaperObj.url || ""
  };
  await chat.save();
  emitEvent(req, REFETCH_CHATS, chat.members);
  return res.status(200).json({ success: true, wallpaper: chat.wallpaper });

  emitEvent(
    req,
    ALERT,
    chat.members,
    `${allUsersName} has been added in the group`
  );

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Members added successfully",
  });
});

const removeMember = TryCatch(async (req, res, next) => {
  const { userId, chatId } = req.body;

  const [chat, userThatWillBeRemoved] = await Promise.all([
    Chat.findById(chatId),
    User.findById(userId, "name"),
  ]);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  if (chat.creator.toString() !== req.user.toString())
    return next(new ErrorHandler("You are not allowed to add members", 403));

  if (chat.members.length <= 3)
    return next(new ErrorHandler("Group must have at least 3 members", 400));

  const allChatMembers = chat.members.map((i) => i.toString());

  chat.members = chat.members.filter(
    (member) => member.toString() !== userId.toString()
  );

  await chat.save();

  emitEvent(req, ALERT, chat.members, {
    message: `${userThatWillBeRemoved.name} has been removed from the group`,
    chatId,
  });

  emitEvent(req, REFETCH_CHATS, allChatMembers);

  return res.status(200).json({
    success: true,
    message: "Member removed successfully",
  });
});

const leaveGroup = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  const remainingMembers = chat.members.filter(
    (member) => member.toString() !== req.user.toString()
  );

  if (remainingMembers.length < 3)
    return next(new ErrorHandler("Group must have at least 3 members", 400));

  if (chat.creator.toString() === req.user.toString()) {
    const randomElement = Math.floor(Math.random() * remainingMembers.length);
    const newCreator = remainingMembers[randomElement];
    chat.creator = newCreator;
  }

  chat.members = remainingMembers;

  const [user] = await Promise.all([
    User.findById(req.user, "name"),
    chat.save(),
  ]);

  emitEvent(req, ALERT, chat.members, {
    chatId,
    message: `User ${user.name} has left the group`,
  });

  return res.status(200).json({
    success: true,
    message: "Leave Group Successfully",
  });
});

const sendAttachments = TryCatch(async (req, res, next) => {
  const { chatId, replyToId } = req.body;

  const files = req.files || [];

  if (files.length < 1)
    return next(new ErrorHandler("Please Upload Attachments", 400));

  if (files.length > 5)
    return next(new ErrorHandler("Files Can't be more than 5", 400));

  const [chat, me] = await Promise.all([
    Chat.findById(chatId),
    User.findById(req.user, "name"),
  ]);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  if (files.length < 1)
    return next(new ErrorHandler("Please provide attachments", 400));

  // Validate replyToId if provided
  if (replyToId && !mongoose.Types.ObjectId.isValid(replyToId)) {
    return next(new ErrorHandler("Invalid reply message ID format", 400));
  }

  // Check if reply message exists and belongs to the same chat
  if (replyToId) {
    const replyMessage = await Message.findById(replyToId);
    if (!replyMessage) {
      return next(new ErrorHandler("Reply message not found", 404));
    }
    if (replyMessage.chat.toString() !== chatId) {
      return next(new ErrorHandler("Cannot reply to message from different chat", 400));
    }
  }

  //   Upload files here
  const attachments = await uploadFilesToCloudinary(files);

  const messageForDB = {
    content: "",
    attachments,
    sender: me._id,
    chat: chatId,
    replyTo: replyToId || null,
  };

  const messageForRealTime = {
    ...messageForDB,
    sender: {
      _id: me._id,
      name: me.name,
    },
  };

  const message = await Message.create(messageForDB);

  emitEvent(req, NEW_MESSAGE, chat.members, {
    message: messageForRealTime,
    chatId,
  });

  emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

  return res.status(200).json({
    success: true,
    message,
  });
});

const getChatDetails = TryCatch(async (req, res, next) => {
  if (req.query.populate === "true") {
    const chat = await Chat.findById(req.params.id)
      .populate("members", "name avatar")
      .lean();

    if (!chat) return next(new ErrorHandler("Chat not found", 404));

    chat.members = chat.members.map(({ _id, name, avatar }) => ({
      _id,
      name,
      avatar: avatar?.url || "",
    }));

    return res.status(200).json({
      success: true,
      chat,
    });
  } else {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return next(new ErrorHandler("Chat not found", 404));

    return res.status(200).json({
      success: true,
      chat,
    });
  }
});

const renameGroup = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;
  const { name } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  if (!chat.groupChat)
    return next(new ErrorHandler("This is not a group chat", 400));

  if (chat.creator.toString() !== req.user.toString())
    return next(
      new ErrorHandler("You are not allowed to rename the group", 403)
    );

  chat.name = name;

  await chat.save();

  emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Group renamed successfully",
  });
});

const deleteChat = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  const members = chat.members;

  if (chat.groupChat && chat.creator.toString() !== req.user.toString())
    return next(
      new ErrorHandler("You are not allowed to delete the group", 403)
    );

  if (!chat.groupChat && !chat.members.includes(req.user.toString())) {
    return next(
      new ErrorHandler("You are not allowed to delete the chat", 403)
    );
  }

  //   Here we have to dete All Messages as well as attachments or files from cloudinary

  const messagesWithAttachments = await Message.find({
    chat: chatId,
    attachments: { $exists: true, $ne: [] },
  });

  const public_ids = [];

  messagesWithAttachments.forEach(({ attachments }) =>
    attachments.forEach(({ public_id }) => public_ids.push(public_id))
  );

  await Promise.all([
    deletFilesFromCloudinary(public_ids),
    chat.deleteOne(),
    Message.deleteMany({ chat: chatId }),
  ]);

  emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Chat deleted successfully",
  });
});

const getMessages = TryCatch(async (req, res, next) => {
  const chatId = req.params.id;
  const { page = 1 } = req.query;

  const resultPerPage = 20;
  const skip = (page - 1) * resultPerPage;

  const chat = await Chat.findById(chatId);

  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  if (!chat.members.includes(req.user.toString()))
    return next(
      new ErrorHandler("You are not allowed to access this chat", 403)
    );

  const [messages, totalMessagesCount] = await Promise.all([
    Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(resultPerPage)
      .populate("sender", "name avatar")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "name"
        }
      })
      .lean(),
    Message.countDocuments({ chat: chatId }),
  ]);

  const totalPages = Math.ceil(totalMessagesCount / resultPerPage) || 0;

  return res.status(200).json({
    success: true,
    messages: messages.reverse(),
    totalPages,
  });
});

// Set wallpaper for a chat
const setWallpaper = TryCatch(async (req, res, next) => {
  const { chatId } = req.body;
  const file = req.file;
  // Debug log incoming data
  console.log('setWallpaper req.body:', req.body);
  console.log('setWallpaper req.file:', req.file);
  // Validate chatId format
  const mongoose = require('mongoose');
  if (!chatId || !mongoose.Types.ObjectId.isValid(chatId)) {
    return next(new ErrorHandler("Invalid chatId format", 400));
  }
  if (!file) return next(new ErrorHandler("No wallpaper file uploaded", 400));
  // Validate file type (image only)
  if (!file.mimetype.startsWith("image/")) {
    return next(new ErrorHandler("Only image files are allowed for wallpaper", 400));
  }
  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ErrorHandler("Chat not found", 404));
  // Only allow members to set wallpaper (handle ObjectId vs string)
  const isMember = chat.members.some(
    member => member.toString() === req.user.toString()
  );
  if (!isMember) return next(new ErrorHandler("Not a member of this chat", 403));
  // Upload wallpaper to cloudinary
  const [wallpaperObj] = await uploadFilesToCloudinary([file]);
  chat.wallpaper = wallpaperObj.url;
  await chat.save();
  emitEvent(req, REFETCH_CHATS, chat.members);
  return res.status(200).json({ success: true, wallpaper: chat.wallpaper });
});

// Add reaction to a message
const addMessageReaction = TryCatch(async (req, res, next) => {
  const { messageId, emoji } = req.body;
  
  // Validate emoji
  const allowedEmojis = ["👍", "❤️", "😂", "😮", "😢", "😡"];
  if (!allowedEmojis.includes(emoji)) {
    return next(new ErrorHandler("Invalid emoji", 400));
  }

  const message = await Message.findById(messageId).populate("chat", "members");
  if (!message) return next(new ErrorHandler("Message not found", 404));

  // Check if user is a member of the chat
  if (!message.chat.members.includes(req.user.toString())) {
    return next(new ErrorHandler("You are not allowed to react to this message", 403));
  }

  // Check if user already reacted with this emoji
  const existingReaction = message.reactions.find(
    (reaction) => reaction.user.toString() === req.user.toString() && reaction.emoji === emoji
  );

  if (existingReaction) {
    return next(new ErrorHandler("You have already reacted with this emoji", 400));
  }

  // Add the reaction
  message.reactions.push({
    user: req.user,
    emoji: emoji,
  });

  await message.save();

  // Emit real-time event
  const user = await User.findById(req.user, "name avatar");
  emitEvent(req, MESSAGE_REACTION_ADDED, message.chat.members, {
    messageId,
    reaction: {
      user: {
        _id: req.user,
        name: user.name,
        avatar: user.avatar
      },
      emoji,
      createdAt: new Date()
    }
  });

  return res.status(200).json({
    success: true,
    message: "Reaction added successfully"
  });
});

// Remove reaction from a message
const removeMessageReaction = TryCatch(async (req, res, next) => {
  const { messageId, emoji } = req.body;

  const message = await Message.findById(messageId).populate("chat", "members");
  if (!message) return next(new ErrorHandler("Message not found", 404));

  // Check if user is a member of the chat
  if (!message.chat.members.includes(req.user.toString())) {
    return next(new ErrorHandler("You are not allowed to remove reactions from this message", 403));
  }

  // Find and remove the reaction
  const reactionIndex = message.reactions.findIndex(
    (reaction) => reaction.user.toString() === req.user.toString() && reaction.emoji === emoji
  );

  if (reactionIndex === -1) {
    return next(new ErrorHandler("Reaction not found", 404));
  }

  message.reactions.splice(reactionIndex, 1);
  await message.save();

  // Emit real-time event
  emitEvent(req, MESSAGE_REACTION_REMOVED, message.chat.members, {
    messageId,
    userId: req.user,
    emoji
  });

  return res.status(200).json({
    success: true,
    message: "Reaction removed successfully"
  });
});

export {
  newGroupChat,
  getMyChats,
  getMyGroups,
  addMembers,
  removeMember,
  leaveGroup,
  sendAttachments,
  getChatDetails,
  renameGroup,
  deleteChat,
  getMessages,
  setWallpaper,
  addMessageReaction,
  removeMessageReaction,
};
