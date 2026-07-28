import { User } from "../models/user.js";
import { hash } from "bcrypt";

// ─── Joon Bot ────────────────────────────────────────────────────────────────

export const createBotUser = async () => {
  try {
    const botExists = await User.findOne({ username: "joon" });

    if (botExists) {
      console.log("✅ Bot user 'Joon' already exists");
      return botExists;
    }

    const hashedPassword = await hash("joon_secure_password_2024", 10);

    const botUser = await User.create({
      name: "Joon",
      username: "joon",
      bio: "Digital Media student at Hongik University 🎨 | Seoul vibes, Han River walks & late-night chats ✨",
      password: hashedPassword,
      avatar: {
        public_id: "bot_joon_avatar",
        url: "https://res.cloudinary.com/dxkufsejm/image/upload/v1732292000/bot_avatar_joon.png"
      },
      lastSeen: new Date(),
    });

    console.log("✅ Bot user 'Joon' created successfully:", botUser._id);
    return botUser;
  } catch (error) {
    console.error("❌ Error creating Joon bot user:", error);
    throw error;
  }
};

export const getBotUserId = async () => {
  const bot = await User.findOne({ username: "joon" });
  return bot?._id;
};

// ─── Jimmy Carr Bot ───────────────────────────────────────────────────────────

export const createJimmeyBotUser = async () => {
  try {
    const botExists = await User.findOne({ username: "jimmey" });

    if (botExists) {
      console.log("✅ Bot user 'Jimmy Carr' already exists");
      return botExists;
    }

    const hashedPassword = await hash("jimmey_secure_password_2024", 10);

    const botUser = await User.create({
      name: "Jimmy Carr",
      username: "jimmey",
      bio: "Earth is basically an audition for heaven or hell, I prefer later✨",
      password: hashedPassword,
      avatar: {
        public_id: "bot_jimmey_avatar",
        url: "https://res.cloudinary.com/dxkufsejm/image/upload/v1732292000/bot_avatar_jimmey.png"
      },
      lastSeen: new Date(),
    });

    console.log("✅ Bot user 'Jimmy Carr' created successfully:", botUser._id);
    return botUser;
  } catch (error) {
    console.error("❌ Error creating Jimmy Carr bot user:", error);
    throw error;
  }
};

export const getJimmeyBotUserId = async () => {
  const bot = await User.findOne({ username: "jimmey" });
  return bot?._id;
};
