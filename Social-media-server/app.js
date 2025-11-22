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
import { createBotUser } from "./seeders/bot.js";

const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const envMode = (process.env.NODE_ENV?.trim() || "PRODUCTION");
const adminSecretKey = process.env.ADMIN_SECRET_KEY;
const userSocketIDs = new Map();
const onlineUsers = new Set();

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
  cors: corsOptions
});

app.set("io", io);

// Using Middlewares Here
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/bot", botRoute);

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
        io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

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

  socket.on("disconnect", () => {
    userSocketIDs.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());
    
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
  
  // Initialize bot user on server start
  try {
    await createBotUser();
  } catch (error) {
    console.error("Failed to initialize bot user:", error);
  }
});

export { envMode, adminSecretKey, userSocketIDs };
