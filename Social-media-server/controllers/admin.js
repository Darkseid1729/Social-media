import jwt from "jsonwebtoken";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { ErrorHandler } from "../utils/utility.js";
import { cookieOptions } from "../utils/features.js";
import { adminSecretKey } from "../app.js";
import { adminLoginAttempts } from "../utils/adminLoginAttempts.js";
import os from "os";

const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

const adminLogin = TryCatch(async (req, res, next) => {
  const { secretKey } = req.body;
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress || req.ip || "unknown";
  const now = Date.now();

  if (!adminLoginAttempts[ip]) {
    adminLoginAttempts[ip] = { count: 0, lastAttempt: now, lockedUntil: null };
  }
  const attempt = adminLoginAttempts[ip];

  // Check lockout
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return next(new ErrorHandler(`Too many failed attempts. Try again after ${Math.ceil((attempt.lockedUntil - now)/60000)} minutes.`, 429));
  }

  const isMatched = secretKey === adminSecretKey;

  if (!isMatched) {
    attempt.count += 1;
    attempt.lastAttempt = now;
    // Log failed attempt (could be replaced with DB or external logging)
    console.warn(`[ALERT] Failed admin login from IP: ${ip} at ${new Date().toISOString()} (Attempt ${attempt.count})`);

    // Alert if max attempts reached
    if (attempt.count >= MAX_ATTEMPTS) {
      attempt.lockedUntil = now + LOCK_TIME;
      // Here you could send an email or alert to admin (implement as needed)
      console.error(`[ALERT] Admin login locked for IP: ${ip} until ${new Date(attempt.lockedUntil).toISOString()}`);
      return next(new ErrorHandler("Too many failed attempts. Admin login locked for 15 minutes.", 429));
    }
    return next(new ErrorHandler("Invalid Admin Key", 401));
  }

  // Reset on successful login
  attempt.count = 0;
  attempt.lockedUntil = null;

  const token = jwt.sign(secretKey, process.env.JWT_SECRET);

  return res
    .status(200)
    .cookie("my-social-media-admin-token", token, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 15,
    })
    .json({
      success: true,
      message: "Authenticated Successfully, Welcome BOSS",
    });
});

const adminLogout = TryCatch(async (req, res, next) => {
  return res
    .status(200)
    .cookie("my-social-media-admin-token", "", {
      ...cookieOptions,
      maxAge: 0,
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

const getAdminData = TryCatch(async (req, res, next) => {
  return res.status(200).json({
    admin: true,
  });
});

const allUsers = TryCatch(async (req, res) => {
  const users = await User.find({});

  const transformedUsers = await Promise.all(
    users.map(async ({ name, username, avatar, _id }) => {
      const [groups, friends] = await Promise.all([
        Chat.countDocuments({ groupChat: true, members: _id }),
        Chat.countDocuments({ groupChat: false, members: _id }),
      ]);

      return {
        name,
        username,
        avatar: avatar.url,
        _id,
        groups,
        friends,
      };
    })
  );

  return res.status(200).json({
    status: "success",
    users: transformedUsers,
  });
});

const allChats = TryCatch(async (req, res) => {
  const chats = await Chat.find({})
    .populate("members", "name avatar")
    .populate("creator", "name avatar");

  const transformedChats = await Promise.all(
    chats.map(async ({ members, _id, groupChat, name, creator }) => {
      const totalMessages = await Message.countDocuments({ chat: _id });

      return {
        _id,
        groupChat,
        name,
        avatar: members.slice(0, 3).map((member) => member.avatar.url),
        members: members.map(({ _id, name, avatar }) => ({
          _id,
          name,
          avatar: avatar.url,
        })),
        creator: {
          name: creator?.name || "None",
          avatar: creator?.avatar.url || "",
        },
        totalMembers: members.length,
        totalMessages,
      };
    })
  );

  return res.status(200).json({
    status: "success",
    chats: transformedChats,
  });
});

const allMessages = TryCatch(async (req, res) => {
  // Pagination params with sane defaults and caps
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limitInput = parseInt(req.query.limit || "50", 10);
  const limit = Math.min(Math.max(limitInput, 1), 200); // 1..200
  const skip = (page - 1) * limit;

  // Fetch total count in parallel with page slice
  const [messages, totalMessages] = await Promise.all([
    Message.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "name avatar")
      .populate({
        path: "chat",
        select: "groupChat members",
        populate: { path: "members", select: "name" },
      })
      .lean(),
    Message.countDocuments({}),
  ]);

  const transformedMessages = messages.map(
    ({ content, attachments, _id, sender, createdAt, chat }) => ({
      _id,
      attachments,
      content,
      createdAt,
      chat: chat?._id,
      groupChat: !!chat?.groupChat,
      sender: {
        _id: sender?._id,
        name: sender?.name,
        avatar: sender?.avatar?.url,
      },
      sendTo: chat?.members
        ? chat.members
            .filter((m) => String(m._id) !== String(sender?._id))
            .map((m) => m.name)
            .join(", ")
        : "",
    })
  );

  const totalPages = Math.ceil(totalMessages / limit) || 0;

  return res.status(200).json({
    success: true,
    messages: transformedMessages,
    page,
    totalPages,
    totalMessages,
    pageSize: limit,
  });
});

const getDashboardStats = TryCatch(async (req, res) => {
  const [groupsCount, usersCount, messagesCount, totalChatsCount] =
    await Promise.all([
      Chat.countDocuments({ groupChat: true }),
      User.countDocuments(),
      Message.countDocuments(),
      Chat.countDocuments(),
    ]);

  const today = new Date();

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const last7DaysMessages = await Message.find({
    createdAt: {
      $gte: last7Days,
      $lte: today,
    },
  }).select("createdAt");

  const messages = new Array(7).fill(0);
  const dayInMiliseconds = 1000 * 60 * 60 * 24;

  last7DaysMessages.forEach((message) => {
    const indexApprox =
      (today.getTime() - message.createdAt.getTime()) / dayInMiliseconds;
    const index = Math.floor(indexApprox);

    messages[6 - index]++;
  });

  const stats = {
    groupsCount,
    usersCount,
    messagesCount,
    totalChatsCount,
    messagesChart: messages,
  };

  return res.status(200).json({
    success: true,
    stats,
  });
});

export {
  allUsers,
  allChats,
  allMessages,
  getDashboardStats,
  adminLogin,
  adminLogout,
  getAdminData,
};
