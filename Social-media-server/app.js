import express from "express";
import { connectDB } from "./utils/features.js";
import dotenv from "dotenv";
import { errorMiddleware } from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { createServer } from "http";
import { v4 as uuid } from "uuid";
import cors from "cors";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import {
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  ONLINE_USERS,
  START_TYPING,
  STOP_TYPING,
  EMOJI_EFFECT,
  EMOJI_COMBO,
  EMOJI_ANIMATION,
  MESSAGE_ANIMATION,
  CALL_INITIATED,
  CALL_ACCEPTED,
  CALL_REJECTED,
  CALL_ENDED,
  WEBRTC_OFFER,
  WEBRTC_ANSWER,
  WEBRTC_ICE_CANDIDATE,
} from "./constants/events.js";
import { getSockets } from "./lib/helper.js";
import { Message } from "./models/message.js";
import { User } from "./models/user.js";
import { corsOptions } from "./constants/config.js";
import { socketAuthenticator } from "./middlewares/auth.js";

// Load environment variables FIRST before importing routes
dotenv.config({
  path: "./.env",
});

// Import routes AFTER dotenv is configured
import userRoute from "./routes/user.js";
import chatRoute from "./routes/chat.js";
import adminRoute from "./routes/admin.js";
import botRoute from "./routes/bot.js";
import youtubeRoute from "./routes/youtube.js";
import gifRoute from "./routes/gif.js";
import { createBotUser } from "./seeders/bot.js";
import { initializeFirebase, sendMessageNotification } from "./utils/firebase.js";
import { CallRecord } from "./models/callRecord.js";

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const envMode = (process.env.NODE_ENV?.trim() || "PRODUCTION");
const adminSecretKey = process.env.ADMIN_SECRET_KEY;
const userSocketIDs = new Map();
const onlineUsers = new Set();
const activeCalls = new Map(); // callId -> { caller, callee }
const disconnectTimers = new Map(); // userId -> { timerId, callIds }

// ── Emoji Combo Detection ──────────────────────────────────────────
// In-memory store: chatId -> { emoji, userId, userName, ts }
// Resets on server restart — intentionally ephemeral (no DB needed)
const emojiComboCache = new Map();
const COMBO_WINDOW_MS = 10000; // 10 second window for a match
// Simple single-emoji check (covers most emoji including ZWJ sequences)
const isSingleEmoji = (text) => {
  if (!text) return false;
  const t = text.trim();
  // Strip variation selectors and ZWJ to get the visual emoji count
  const segments = [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(t)];
  return segments.length === 1 && /\p{Emoji}/u.test(t) && !/[a-zA-Z0-9]/u.test(t);
};
// ───────────────────────────────────────────────────────────────────

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return id && mongoose.Types.ObjectId.isValid(id);
};

connectDB(mongoURI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: corsOptions,
  maxHttpBufferSize: 50 * 1024 * 1024, // 50MB max buffer for file uploads
  pingTimeout: 60000, // 60 seconds
  pingInterval: 25000, // 25 seconds
});

app.set("io", io);

// Using Middlewares Here
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/bot", botRoute);
app.use("/api/v1/youtube", youtubeRoute);
app.use("/api/v1/gif", gifRoute);

app.get("/", (req, res) => {
  res.send("Hello World");
});

io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

io.on("connection", (socket) => {
  const user = socket.user;
  userSocketIDs.set(user._id.toString(), socket.id);

  // ── Cancel any pending disconnect timer for this user ──────────
  const myId = user._id.toString();
  const pendingDisconnect = disconnectTimers.get(myId);
  if (pendingDisconnect) {
    clearTimeout(pendingDisconnect.timerId);
    disconnectTimers.delete(myId);
    // Don't clear participant.disconnected here — CALL_ACCEPTED will
    // clear it when the client actually re-joins the WebRTC mesh.
    // This prevents duplicate offer storms if CHECK_ACTIVE_CALL
    // is processed more than once.
  }

  // ── Client asks "am I in an active call?" after setting up listeners ─
  socket.on("CHECK_ACTIVE_CALL", () => {
    for (const [callId, call] of activeCalls) {
      const participant = call.participants.get(myId);
      if (!participant) continue;

      const otherParticipants = [];
      for (const [uid, info] of call.participants) {
        if (uid !== myId && info.joined && !info.disconnected) {
          otherParticipants.push({ userId: uid, userName: info.userName });
        }
      }

      socket.emit("CALL_REJOIN", {
        callId,
        chatId: call.chatId,
        isGroup: call.isGroup,
        participants: otherParticipants,
      });

      // Notify others that this user is back — they should re-create peer
      for (const [uid, info] of call.participants) {
        if (uid !== myId && info.joined && !info.disconnected) {
          const sid = userSocketIDs.get(uid);
          if (sid) {
            io.to(sid).emit("CALL_USER_RECONNECTED", {
              callId,
              userId: myId,
              userName: user.name,
            });
          }
        }
      }
    }
  });

  socket.on(NEW_MESSAGE, async (payload) => {
    try {
      let { chatId, members, message, replyTo, replyClientId, clientId } = payload || {};

      // Normalize replyTo in case client sends a quoted string or non-string
      if (typeof replyTo === 'string') {
        replyTo = replyTo.trim();
        if (replyTo.startsWith('"') && replyTo.endsWith('"')) {
          // strip surrounding quotes if present
          replyTo = replyTo.slice(1, -1);
        }
      }

      // Validate replyTo ID if present
      let replyToMessage = null;
      // If the client provided a client-side reply ID, prefer it for lookup
      if (replyClientId) {
        try {
          replyToMessage = await Message.findOne({ clientId: replyClientId }).populate({ path: "sender", select: "name avatar" }).lean();
          if (!replyToMessage) {
            console.error("Reply message not found by clientId:", replyClientId);
            try { socket.emit("MESSAGE_ERROR", { error: "Reply message not found" }); } catch (e) {}
            return;
          }
          // normalize to the referenced message _id so replyTo is stored as ObjectId
          replyTo = replyToMessage._id;
        } catch (error) {
          console.error("Error fetching reply message by clientId:", error.stack || error);
          try { socket.emit("MESSAGE_ERROR", { error: "Failed to fetch reply message" }); } catch (e) {}
          return;
        }
      } else if (replyTo) {
        // If replyTo looks like an ObjectId, use it
        if (isValidObjectId(replyTo)) {
          try {
            replyToMessage = await Message.findById(replyTo).populate({ path: "sender", select: "name avatar" }).lean();
            if (!replyToMessage) {
              console.error("Reply message not found:", replyTo);
              try { socket.emit("MESSAGE_ERROR", { error: "Reply message not found" }); } catch (e) {}
              return;
            }
          } catch (error) {
            console.error("Error fetching reply message by id:", error.stack || error);
            try { socket.emit("MESSAGE_ERROR", { error: "Failed to fetch reply message" }); } catch (e) {}
            return;
          }
        } else {
          // replyTo is not a valid ObjectId and no replyClientId provided; treat as clientId
          try {
            replyToMessage = await Message.findOne({ clientId: replyTo }).populate({ path: "sender", select: "name avatar" }).lean();
            if (!replyToMessage) {
              console.error("Reply message not found (clientId):", replyTo);
              try { socket.emit("MESSAGE_ERROR", { error: "Reply message not found" }); } catch (e) {}
              return;
            }
            // Keep replyTo as the clientId string if that's how it was referenced
            replyTo = replyToMessage._id; // normalize to saved _id for storage
          } catch (error) {
            console.error("Error fetching reply message by clientId:", error.stack || error);
            try { socket.emit("MESSAGE_ERROR", { error: "Failed to fetch reply message" }); } catch (e) {}
            return;
          }
        }
      }

      const messageForDB = {
        content: message,
        sender: user._id,
        chat: chatId,
        replyTo: replyTo ? replyTo : null,
        clientId: clientId || null,
      };

      try {
        // First save to database to get the actual ObjectId
        const savedMessage = await Message.create(messageForDB);

        // Then create the real-time message with the actual ObjectId
        const messageForRealTime = {
          content: message,
          _id: savedMessage._id, // Use actual MongoDB ObjectId instead of UUID
          sender: {
            _id: user._id,
            name: user.name,
            avatar: user.avatar?.url || null,
          },
          chat: chatId,
          createdAt: savedMessage.createdAt,
          replyTo: replyToMessage,
        };

        const membersSocket = getSockets(members);
        io.to(membersSocket).emit(NEW_MESSAGE, {
          chatId,
          message: messageForRealTime,
        });
        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, {
          chatId,
          senderName: user.name,
          message: message,
          senderAvatar: user.avatar?.url || null,
        });

        // ── Emoji Combo Detection ──────────────────────────────────
        if (isSingleEmoji(message)) {
          const emoji = message.trim();
          const now  = Date.now();
          const last = emojiComboCache.get(chatId);

          if (
            last &&
            last.emoji   === emoji &&
            last.userId  !== user._id.toString() &&
            now - last.ts < COMBO_WINDOW_MS
          ) {
            // MATCH — emit special combo event to everyone in the room
            io.to(membersSocket).emit(EMOJI_COMBO, {
              chatId,
              emoji,
              users: [last.userName, user.name],
            });
            emojiComboCache.delete(chatId); // clear so it doesn't retrigger
          } else {
            // No match yet — store this as the "waiting" entry
            emojiComboCache.set(chatId, {
              emoji,
              userId:   user._id.toString(),
              userName: user.name,
              ts:       now,
            });
          }
        }
        // ──────────────────────────────────────────────────────────

        // Send push notifications to members who are NOT connected via socket (offline)
        const offlineMembers = members.filter(
          (memberId) => !userSocketIDs.has(memberId.toString())
        );
        for (const memberId of offlineMembers) {
          sendMessageNotification(
            memberId,
            user.name,
            message,
            chatId
          ).catch((err) => console.error('Push notification error:', err));
        }

      } catch (error) {
        console.error("Error creating message in database:", error.stack || error);
        try { socket.emit("MESSAGE_ERROR", { error: "Failed to save message" }); } catch (e) {}
        return;
      }
    } catch (outerErr) {
      console.error('Unhandled error in NEW_MESSAGE handler:', outerErr.stack || outerErr);
      try { socket.emit("MESSAGE_ERROR", { error: "Internal server error" }); } catch (e) {}
    }
  });

  socket.on(START_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(START_TYPING, { chatId });
  });

  socket.on(STOP_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(STOP_TYPING, { chatId });
  });

  socket.on(EMOJI_EFFECT, ({ members, chatId, emoji }) => {
    const membersSockets = getSockets(members);
    io.to(membersSockets).emit(EMOJI_EFFECT, { chatId, emoji });
  });

  socket.on(EMOJI_ANIMATION, ({ members, chatId, emoji }) => {
    const membersSockets = getSockets(members);
    io.to(membersSockets).emit(EMOJI_ANIMATION, { chatId, emoji });
  });

  // Broadcast message animation (e.g., confetti/reveal) to all chat members
  socket.on(MESSAGE_ANIMATION, ({ members, chatId, messageId, animation }) => {
    const membersSockets = getSockets(members);
    io.to(membersSockets).emit(MESSAGE_ANIMATION, { chatId, messageId, animation });
  });

  socket.on(CHAT_JOINED, ({ userId, members }) => {
    onlineUsers.add(userId.toString());

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on(CHAT_LEAVED, ({ userId, members }) => {
    onlineUsers.delete(userId.toString());

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  // ── Audio Call Signaling (1-on-1 + Group mesh) ────────────────────
  // activeCalls: callId -> { initiator, chatId, isGroup, participants: Map<userId, { userName, socketId, joined }> }

  socket.on(CALL_INITIATED, ({ to, chatId, members, isGroup }) => {
    const callId = uuid();

    if (isGroup && members && members.length > 0) {
      // ── Group call ──────────────────────────────────────────────
      const participantsMap = new Map();
      // Add initiator
      participantsMap.set(user._id.toString(), {
        userName: user.name,
        avatar: user.avatar?.url || null,
        joined: true,
      });

      activeCalls.set(callId, {
        initiator: user._id.toString(),
        chatId,
        isGroup: true,
        participants: participantsMap,
      });

      // Ring all other members
      let rang = 0;
      for (const memberId of members) {
        const mid = memberId.toString();
        if (mid === user._id.toString()) continue;
        const memberSocketId = userSocketIDs.get(mid);
        if (memberSocketId) {
          io.to(memberSocketId).emit(CALL_INITIATED, {
            callId,
            from: user._id,
            fromName: user.name,
            fromAvatar: user.avatar?.url || null,
            chatId,
            isGroup: true,
          });
          rang++;
        }
      }

      if (rang === 0) {
        activeCalls.delete(callId);
        socket.emit("CALL_FAILED", { reason: "No group members are online" });
        return;
      }

      // Send callId back to initiator
      socket.emit("CALL_ID", { callId });

      // Save call record
      CallRecord.create({
        callId,
        chat: chatId,
        caller: user._id,
        isGroup: true,
        participants: [{ user: user._id, joinedAt: new Date() }],
        startedAt: new Date(),
      }).catch((err) => console.error("CallRecord create error:", err));
    } else {
      // ── 1-on-1 call ─────────────────────────────────────────────
      if (!to) {
        socket.emit("CALL_FAILED", { reason: "No recipient specified" });
        return;
      }
      const calleeSocketId = userSocketIDs.get(to.toString());
      if (!calleeSocketId) {
        socket.emit("CALL_FAILED", { reason: "User is offline" });
        return;
      }

      const participantsMap = new Map();
      participantsMap.set(user._id.toString(), {
        userName: user.name,
        avatar: user.avatar?.url || null,
        joined: true,
      });

      activeCalls.set(callId, {
        initiator: user._id.toString(),
        chatId,
        isGroup: false,
        participants: participantsMap,
        callee: to.toString(),
      });

      io.to(calleeSocketId).emit(CALL_INITIATED, {
        callId,
        from: user._id,
        fromName: user.name,
        fromAvatar: user.avatar?.url || null,
        chatId,
        isGroup: false,
      });

      socket.emit("CALL_ID", { callId });

      // Save call record
      CallRecord.create({
        callId,
        chat: chatId,
        caller: user._id,
        isGroup: false,
        participants: [{ user: user._id, joinedAt: new Date() }],
        startedAt: new Date(),
      }).catch((err) => console.error("CallRecord create error:", err));
    }
  });

  socket.on(CALL_ACCEPTED, ({ callId }) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    const myId = user._id.toString();

    const existing = call.participants.get(myId);
    // If user is already fully joined and connected, this is a duplicate
    // CALL_ACCEPTED (e.g. from double CHECK_ACTIVE_CALL). Just acknowledge.
    if (existing && existing.joined && !existing.disconnected) {
      socket.emit(CALL_ACCEPTED, { callId, userId: null, shouldCreateOffer: false });
      return;
    }

    // Add this user to participants (or update reconnecting participant)
    call.participants.set(myId, {
      userName: user.name,
      avatar: user.avatar?.url || null,
      joined: true,
    });

    // Get all OTHER joined (and connected) participants
    const joinedOthers = [];
    for (const [uid, info] of call.participants) {
      if (uid !== myId && info.joined && !info.disconnected) {
        joinedOthers.push(uid);
      }
    }

    // Tell each existing participant to create an offer to this new user
    for (const otherUid of joinedOthers) {
      const otherSocketId = userSocketIDs.get(otherUid);
      if (otherSocketId) {
        io.to(otherSocketId).emit(CALL_ACCEPTED, {
          callId,
          userId: myId,
          shouldCreateOffer: true,
        });
      }
    }

    // Tell the new user the call is active (they wait for offers from others)
    socket.emit(CALL_ACCEPTED, {
      callId,
      userId: null,
      shouldCreateOffer: false,
    });

    // Broadcast updated participants list
    const participantsList = [];
    for (const [uid, info] of call.participants) {
      if (info.joined) participantsList.push({ userId: uid, userName: info.userName });
    }
    for (const [uid, info] of call.participants) {
      if (info.joined) {
        const sid = userSocketIDs.get(uid);
        if (sid) io.to(sid).emit("CALL_PARTICIPANTS", { participants: participantsList });
      }
    }

    // Update call record: mark answered, add participant
    CallRecord.findOneAndUpdate(
      { callId },
      {
        status: "answered",
        answeredAt: new Date(),
        $push: { participants: { user: user._id, joinedAt: new Date() } },
      }
    ).catch((err) => console.error("CallRecord accept error:", err));
  });

  socket.on(CALL_REJECTED, ({ callId }) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    const myId = user._id.toString();

    if (!call.isGroup) {
      // 1-on-1: notify caller and delete call
      const callerSocketId = userSocketIDs.get(call.initiator);
      if (callerSocketId) io.to(callerSocketId).emit(CALL_REJECTED, { callId });
      activeCalls.delete(callId);

      // Update call record: rejected
      CallRecord.findOneAndUpdate(
        { callId },
        { status: "rejected", endedAt: new Date() }
      ).catch((err) => console.error("CallRecord reject error:", err));
    } else {
      // Group: just notify initiator that this user rejected
      const initiatorSocket = userSocketIDs.get(call.initiator);
      if (initiatorSocket) {
        io.to(initiatorSocket).emit(CALL_REJECTED, { callId, userId: myId });
      }
    }
  });

  socket.on(CALL_ENDED, ({ callId }) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    const myId = user._id.toString();

    if (!call.isGroup) {
      // 1-on-1: notify the other person and delete
      for (const [uid] of call.participants) {
        if (uid !== myId) {
          const sid = userSocketIDs.get(uid);
          if (sid) io.to(sid).emit(CALL_ENDED, { callId });
        }
      }
      activeCalls.delete(callId);

      // Finalize call record
      CallRecord.findOneAndUpdate(
        { callId },
        { endedAt: new Date() }
      ).then((rec) => {
        if (rec && rec.answeredAt) {
          const dur = Math.round((Date.now() - rec.answeredAt.getTime()) / 1000);
          CallRecord.findOneAndUpdate({ callId }, { duration: dur }).catch(() => {});
        }
      }).catch((err) => console.error("CallRecord end error:", err));
    } else {
      // Group: remove this user, notify everyone remaining
      call.participants.delete(myId);

      for (const [uid, info] of call.participants) {
        if (info.joined) {
          const sid = userSocketIDs.get(uid);
          if (sid) io.to(sid).emit(CALL_ENDED, { callId, userId: myId });
        }
      }

      // Broadcast updated participants
      const participantsList = [];
      for (const [uid, info] of call.participants) {
        if (info.joined) participantsList.push({ userId: uid, userName: info.userName });
      }
      for (const [uid, info] of call.participants) {
        if (info.joined) {
          const sid = userSocketIDs.get(uid);
          if (sid) io.to(sid).emit("CALL_PARTICIPANTS", { participants: participantsList });
        }
      }

      // If fewer than 2 people left, end the call
      if (participantsList.length < 2) {
        for (const [uid, info] of call.participants) {
          if (info.joined) {
            const sid = userSocketIDs.get(uid);
            if (sid) io.to(sid).emit(CALL_ENDED, { callId });
          }
        }
        activeCalls.delete(callId);

        // Finalize call record
        CallRecord.findOneAndUpdate(
          { callId },
          { endedAt: new Date() }
        ).then((rec) => {
          if (rec && rec.answeredAt) {
            const dur = Math.round((Date.now() - rec.answeredAt.getTime()) / 1000);
            CallRecord.findOneAndUpdate({ callId }, { duration: dur }).catch(() => {});
          }
        }).catch((err) => console.error("CallRecord end error:", err));
      }
    }
  });

  socket.on(WEBRTC_OFFER, ({ callId, offer, toUserId }) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    const targetSocket = userSocketIDs.get(toUserId);
    if (targetSocket) {
      io.to(targetSocket).emit(WEBRTC_OFFER, {
        callId,
        offer,
        fromUserId: user._id.toString(),
      });
    }
  });

  socket.on(WEBRTC_ANSWER, ({ callId, answer, toUserId }) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    const targetSocket = userSocketIDs.get(toUserId);
    if (targetSocket) {
      io.to(targetSocket).emit(WEBRTC_ANSWER, {
        callId,
        answer,
        fromUserId: user._id.toString(),
      });
    }
  });

  socket.on(WEBRTC_ICE_CANDIDATE, ({ callId, candidate, toUserId }) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    const targetSocket = userSocketIDs.get(toUserId);
    if (targetSocket) {
      io.to(targetSocket).emit(WEBRTC_ICE_CANDIDATE, {
        callId,
        candidate,
        fromUserId: user._id.toString(),
      });
    }
  });
  // ─────────────────────────────────────────────────────────────────

  socket.on("disconnect", () => {
    const myId = user._id.toString();
    userSocketIDs.delete(myId);
    onlineUsers.delete(myId);

    // ── Check if user is in any active calls ─────────────────────
    const callIdsInvolved = [];
    for (const [callId, call] of activeCalls) {
      if (call.participants.has(myId) && call.participants.get(myId).joined) {
        callIdsInvolved.push(callId);
        // Mark as disconnected but don't remove yet
        call.participants.get(myId).disconnected = true;
      }
    }

    // Notify others that this user is temporarily disconnected (reconnecting)
    for (const callId of callIdsInvolved) {
      const call = activeCalls.get(callId);
      if (!call) continue;
      for (const [uid, info] of call.participants) {
        if (uid !== myId && info.joined && !info.disconnected) {
          const sid = userSocketIDs.get(uid);
          if (sid) {
            io.to(sid).emit("CALL_USER_DISCONNECTED", {
              callId,
              userId: myId,
            });
          }
        }
      }
    }

    if (callIdsInvolved.length > 0) {
      // Give 15 seconds to reconnect before ending the call
      const timerId = setTimeout(() => {
        disconnectTimers.delete(myId);

        for (const callId of callIdsInvolved) {
          const call = activeCalls.get(callId);
          if (!call) continue;
          const participant = call.participants.get(myId);
          if (!participant || !participant.disconnected) continue; // user already reconnected

          if (!call.isGroup) {
            // 1-on-1: notify the other participant
            for (const [uid] of call.participants) {
              if (uid !== myId) {
                const sid = userSocketIDs.get(uid);
                if (sid) io.to(sid).emit(CALL_ENDED, { callId, reason: "disconnected" });
              }
            }
            activeCalls.delete(callId);

            CallRecord.findOneAndUpdate(
              { callId },
              { endedAt: new Date() }
            ).then((rec) => {
              if (rec && rec.answeredAt) {
                const dur = Math.round((Date.now() - rec.answeredAt.getTime()) / 1000);
                CallRecord.findOneAndUpdate({ callId }, { duration: dur }).catch(() => {});
              }
            }).catch((err) => console.error("CallRecord disconnect error:", err));
          } else {
            // Group: remove user and notify remaining
            call.participants.delete(myId);
            for (const [uid, info] of call.participants) {
              if (info.joined && !info.disconnected) {
                const sid = userSocketIDs.get(uid);
                if (sid) io.to(sid).emit(CALL_ENDED, { callId, userId: myId });
              }
            }
            const remaining = [...call.participants].filter(([, info]) => info.joined && !info.disconnected);
            if (remaining.length < 2) {
              for (const [uid] of remaining) {
                const sid = userSocketIDs.get(uid);
                if (sid) io.to(sid).emit(CALL_ENDED, { callId });
              }
              activeCalls.delete(callId);

              CallRecord.findOneAndUpdate(
                { callId },
                { endedAt: new Date() }
              ).then((rec) => {
                if (rec && rec.answeredAt) {
                  const dur = Math.round((Date.now() - rec.answeredAt.getTime()) / 1000);
                  CallRecord.findOneAndUpdate({ callId }, { duration: dur }).catch(() => {});
                }
              }).catch((err) => console.error("CallRecord disconnect error:", err));
            }
          }
        }
      }, 15000); // 15-second grace period

      disconnectTimers.set(myId, { timerId, callIds: callIdsInvolved });
    }

    // Also clean calls where this user is the callee (hasn't joined yet)
    for (const [callId, call] of activeCalls) {
      if (call.callee === myId && !call.participants.has(myId)) {
        const initiatorSid = userSocketIDs.get(call.initiator);
        if (initiatorSid) io.to(initiatorSid).emit("CALL_FAILED", { reason: "User is offline" });
        activeCalls.delete(callId);

        // Mark as missed
        CallRecord.findOneAndUpdate(
          { callId },
          { status: "missed", endedAt: new Date() }
        ).catch((err) => console.error("CallRecord missed error:", err));
      }
    }

    // Update lastSeen timestamp on disconnect
    User.findByIdAndUpdate(user._id, { lastSeen: new Date() }).catch(err => 
      console.error("Error updating lastSeen:", err)
    );
    
    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
  });
});

app.use(errorMiddleware);

server.listen(port, async () => {
  console.log(`Server is running on port ${port} in ${envMode} Mode`);
  
  // Initialize Firebase for push notifications
  initializeFirebase();
  
  // Initialize bot user on server start
  try {
    await createBotUser();
  } catch (error) {
    console.error("Failed to initialize bot user:", error);
  }
});

export { envMode, adminSecretKey, userSocketIDs };
