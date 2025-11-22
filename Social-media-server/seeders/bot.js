import { User } from "../models/user.js";
import { hash } from "bcrypt";

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
      bio: "Your fun, witty companion who's always up for a chat 😏✨",
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
    console.error("❌ Error creating bot user:", error);
    throw error;
  }
};

export const getBotUserId = async () => {
  const bot = await User.findOne({ username: "joon" });
  return bot?._id;
};
