// Get another user's public profile by ID
const getUserProfile = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("User not found", 404));
  // Only return public fields
  const { _id, name, username, bio, avatar, createdAt } = user;
  res.status(200).json({
    success: true,
    user: { _id, name, username, bio, avatar, createdAt },
  });
});
import { compare } from "bcrypt";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMember } from "../lib/helper.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Request } from "../models/request.js";
import { User } from "../models/user.js";
import {
  cookieOptions,
  emitEvent,
  sendToken,
  uploadFilesToCloudinary,
} from "../utils/features.js";
import { ErrorHandler } from "../utils/utility.js";
import { userLoginAttempts } from "../utils/userLoginAttempts.js";

// Create a new user and save it to the database and save token in cookie
const newUser = TryCatch(async (req, res, next) => {
  const { name, username, password, bio } = req.body;

  const file = req.file;

  if (!file) return next(new ErrorHandler("Please Upload Avatar"));

  const result = await uploadFilesToCloudinary([file]);

  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  };

  const user = await User.create({
    name,
    bio,
    username,
    password,
    avatar,
  });

  sendToken(res, user, 201, "User created");
});

// Login user and save token in cookie
const MAX_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

const login = TryCatch(async (req, res, next) => {
  const { username, password } = req.body;
  const now = Date.now();

  if (!userLoginAttempts[username]) {
    userLoginAttempts[username] = { count: 0, lastAttempt: now, lockedUntil: null };
  }
  const attempt = userLoginAttempts[username];

  // Check lockout
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return res.status(429).json({
      success: false,
      message: `Too many failed attempts. Try again after ${Math.ceil((attempt.lockedUntil - now)/60000)} minutes.`,
      attemptsLeft: 0
    });
  }

  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    attempt.count += 1;
    attempt.lastAttempt = now;
    console.warn(`[ALERT] Failed user login for username: ${username} at ${new Date().toISOString()} (Attempt ${attempt.count})`);
    if (attempt.count >= MAX_ATTEMPTS) {
      attempt.lockedUntil = now + LOCK_TIME;
      console.error(`[ALERT] User login locked for username: ${username} until ${new Date(attempt.lockedUntil).toISOString()}`);
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Login locked for 15 minutes.",
        attemptsLeft: 0
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid Username or Password",
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempt.count)
    });
  }

  const isMatch = await compare(password, user.password);

  if (!isMatch) {
    attempt.count += 1;
    attempt.lastAttempt = now;
    console.warn(`[ALERT] Failed user login for username: ${username} at ${new Date().toISOString()} (Attempt ${attempt.count})`);
    if (attempt.count >= MAX_ATTEMPTS) {
      attempt.lockedUntil = now + LOCK_TIME;
      console.error(`[ALERT] User login locked for username: ${username} until ${new Date(attempt.lockedUntil).toISOString()}`);
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Login locked for 15 minutes.",
        attemptsLeft: 0
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid Username or Password",
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempt.count)
    });
  }

  // Reset on successful login
  attempt.count = 0;
  attempt.lockedUntil = null;

  sendToken(res, user, 200, `Welcome Back, ${user.name}`);
});

const getMyProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user).lean();

  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({
    success: true,
    user,
  });
});

const logout = TryCatch(async (req, res) => {
  return res
    .status(200)
    .cookie("my-social-media-token", "", { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      message: "Logged out successfully",
    });
});

const searchUser = TryCatch(async (req, res) => {
  // Previous v1: Partial match by name (commented out)
  // const { name = "" } = req.query; //remove username(line below) if you want to search by name
  const { username = "" } = req.query;

  // Finding All my chats
  const myChats = await Chat.find({ groupChat: false, members: req.user });

  //  extracting All Users from my chats means friends or people I have chatted with
  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

  // Previous v1: Partial match by username (commented out)
  // const allUsersExceptMeAndFriends = await User.find({
  //   _id: { $nin: allUsersFromMyChats },
  //   username: { $regex: username, $options: "i" },
  // });

  // New: Exact match by username
  const allUsersExceptMeAndFriends = await User.find({
    _id: { $nin: allUsersFromMyChats },
    username: username,
  });

  // Modifying the response
  const users = allUsersExceptMeAndFriends.map(({ _id, name, username, avatar }) => ({
    _id,
    name,
    username,
    avatar: avatar?.url || "",
  }));

  return res.status(200).json({
    success: true,
    users,
  });
});

const sendFriendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body;

  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });

  if (request) return next(new ErrorHandler("Request already sent", 400));

  // Check if receiver is the bot (Joon)
  const receiver = await User.findById(userId);
  if (receiver && receiver.username === "joon") {
    // Auto-accept friend request for bot
    const sender = await User.findById(req.user, "name");
    const members = [req.user, userId];

    await Chat.create({
      members,
      name: `${sender.name}-${receiver.name}`,
    });

    emitEvent(req, REFETCH_CHATS, members);

    return res.status(200).json({
      success: true,
      message: "Chat with Joon created",
      autoAccepted: true,
    });
  }

  await Request.create({
    sender: req.user,
    receiver: userId,
  });

  emitEvent(req, NEW_REQUEST, [userId]);

  return res.status(200).json({
    success: true,
    message: "Friend Request Sent",
  });
});

const acceptFriendRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body;

  const request = await Request.findById(requestId)
    .populate("sender", "name")
    .populate("receiver", "name");

  if (!request) return next(new ErrorHandler("Request not found", 404));

  if (request.receiver._id.toString() !== req.user.toString())
    return next(
      new ErrorHandler("You are not authorized to accept this request", 401)
    );

  if (!accept) {
    await request.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Friend Request Rejected",
    });
  }

  const members = [request.sender._id, request.receiver._id];

  await Promise.all([
    Chat.create({
      members,
      name: `${request.sender.name}-${request.receiver.name}`,
    }),
    request.deleteOne(),
  ]);

  emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: "Friend Request Accepted",
    senderId: request.sender._id,
  });
});

const getMyNotifications = TryCatch(async (req, res) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    "sender",
    "name avatar"
  );

  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender?._id,
      name: sender?.name || "Unknown User",
      avatar: sender?.avatar?.url || "",
    },
  }));

  return res.status(200).json({
    success: true,
    allRequests,
  });
});

const getMyFriends = TryCatch(async (req, res) => {
  const chatId = req.query.chatId;

  const chats = await Chat.find({
    members: req.user,
    groupChat: false,
  }).populate("members", "name avatar");

  const friends = chats.map(({ members }) => {
    const otherUser = getOtherMember(members, req.user);

    return {
      _id: otherUser?._id,
      name: otherUser?.name || "Unknown User",
      avatar: otherUser?.avatar?.url || "",
    };
  }).filter(friend => friend._id); // Filter out any undefined friends

  if (chatId) {
    const chat = await Chat.findById(chatId);

    const availableFriends = friends.filter(
      (friend) => !chat.members.includes(friend._id)
    );

    return res.status(200).json({
      success: true,
      friends: availableFriends,
    });
  } else {
    return res.status(200).json({
      success: true,
      friends,
    });
  }
});

// Check friend status with a user
const checkFriendStatus = TryCatch(async (req, res, next) => {
  const { userId } = req.params;
  
  if (!userId) return next(new ErrorHandler("User ID required", 400));

  // Check if they are already friends (have a chat together)
  const chat = await Chat.findOne({
    members: { $all: [req.user, userId] },
    groupChat: false,
  });

  // Check if there's a pending request
  const pendingRequest = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });

  return res.status(200).json({
    success: true,
    isFriend: !!chat,
    hasPendingRequest: !!pendingRequest,
  });
});

export {
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
  getUserProfile,
  checkFriendStatus,
};
