import Groq from "groq-sdk";
import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { emitEvent } from "../utils/features.js";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT } from "../constants/events.js";
import { getBotUserId } from "../seeders/bot.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get Groq client (lazy initialization)
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// Load bot personality from file
let BOT_PERSONALITY = "";
try {
  const personalityPath = path.join(__dirname, "../../botpersonality.txt");
  BOT_PERSONALITY = fs.readFileSync(personalityPath, "utf-8");
} catch (error) {
  console.error("⚠️ Could not load bot personality file, using default");
  BOT_PERSONALITY = "You are a fun, witty, and playful chatbot. Be friendly and engaging!";
}

// Bot configuration
const BOT_CONFIG = {
  model: "llama-3.3-70b-versatile", // Updated model (llama-3.1-70b-versatile was decommissioned)
  maxTokens: 500,
  temperature: 0.8,
  contextMessages: 15,
  errorMessages: [
    "Sorry I'm really tired rn 😵‍💫 can we talk later please uk🥹",
    "Aish my brain isn't working rn 😣 give me a sec?",
    "Wait— I'm blanking out 🙈 can you try again in a bit?",
    "I need more coffee for this 😭 brb",
    "My thoughts are all over the place rn 🤯 let me recharge",
    "Aigoo I'm not functioning properly 😵‍💫 talk later?",
    "Hold on my brain just crashed 💀 need a moment",
    "I'm running on zero energy rn 🥺 can we continue this later?",
  ],
  getRandomErrorMessage: function() {
    return this.errorMessages[Math.floor(Math.random() * this.errorMessages.length)];
  }
};

// Track bot usage statistics
const botUsageStats = {
  totalMessages: 0,
  totalTokensUsed: 0,
  messagesPerDay: {},
  tokensPerDay: {},
  userStats: {}, // Track per-user usage: { userId: { messages: count, tokens: count, lastUsed: date } }
  conversationLogs: [], // Store recent conversations for admin panel
  maxLogsToStore: 100, // Keep last 100 conversations
  lastReset: new Date(),
};

// Helper to update stats
const updateStats = (userId, userName, userMessage, botResponse, tokensUsed) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Update daily stats
  if (!botUsageStats.messagesPerDay[today]) {
    botUsageStats.messagesPerDay[today] = 0;
    botUsageStats.tokensPerDay[today] = 0;
  }
  botUsageStats.messagesPerDay[today]++;
  botUsageStats.tokensPerDay[today] += tokensUsed;
  botUsageStats.totalMessages++;
  botUsageStats.totalTokensUsed += tokensUsed;
  
  // Update per-user stats
  if (!botUsageStats.userStats[userId]) {
    botUsageStats.userStats[userId] = {
      userId,
      userName,
      messages: 0,
      tokens: 0,
      lastUsed: new Date(),
    };
  }
  botUsageStats.userStats[userId].messages++;
  botUsageStats.userStats[userId].tokens += tokensUsed;
  botUsageStats.userStats[userId].userName = userName; // Update name in case it changed
  botUsageStats.userStats[userId].lastUsed = new Date();
  
  // Store conversation log (keep last N conversations)
  botUsageStats.conversationLogs.unshift({
    timestamp: new Date(),
    userId,
    userName,
    userMessage,
    botResponse,
    tokensUsed,
  });
  
  // Trim logs if exceeding max
  if (botUsageStats.conversationLogs.length > botUsageStats.maxLogsToStore) {
    botUsageStats.conversationLogs.pop();
  }
};

// Helper to search Giphy and get a random GIF
const searchGiphy = async (query) => {
  const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
  
  if (!GIPHY_API_KEY) {
    console.error("GIPHY_API_KEY not configured in .env");
    return null;
  }
  
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=10&rating=g`
    );
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      // Pick a random GIF from results
      const randomIndex = Math.floor(Math.random() * data.data.length);
      return data.data[randomIndex].images.original.url;
    }
    return null;
  } catch (error) {
    console.error("Giphy API error:", error);
    return null;
  }
};

// Main bot chat handler
export const chatWithBot = TryCatch(async (req, res, next) => {
  const { message, chatId } = req.body;
  
  // console.log("🤖 Bot received message request:", { 
  //   message, 
  //   chatId, 
  //   userId: req.user 
  // });
  
  // Check if Groq API key is configured
  if (!process.env.GROQ_API_KEY) {
    return next(new ErrorHandler("Bot service is not available. GROQ_API_KEY not configured.", 503));
  }
  
  if (!message || !message.trim()) {
    return next(new ErrorHandler("Message is required", 400));
  }

  const chat = await Chat.findById(chatId);
  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  // Verify user is a member of this chat
  if (!chat.members.includes(req.user.toString())) {
    return next(new ErrorHandler("You are not a member of this chat", 403));
  }

  // Get bot user ID
  const botUserId = await getBotUserId();
  if (!botUserId) {
    return next(new ErrorHandler("Bot user not found", 500));
  }

  // Verify bot is in this chat
  if (!chat.members.includes(botUserId.toString())) {
    return next(new ErrorHandler("Bot is not in this chat", 403));
  }

  // console.log("✅ Bot validation passed, calling Groq API...");

  try {
    // Get user info for personalization
    const currentUser = await User.findById(req.user, "name");
    
    // Get recent conversation history for context
    const recentMessages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .limit(BOT_CONFIG.contextMessages)
      .populate("sender", "name")
      .lean();

    // Format conversation history for Groq
    const conversationHistory = recentMessages
      .reverse()
      .map(msg => ({
        role: msg.sender._id.toString() === botUserId.toString() ? "assistant" : "user",
        content: msg.sender.name === currentUser.name 
          ? msg.content 
          : `${msg.sender.name}: ${msg.content}`
      }));

    // Build system prompt with personality, user name, and GIF instructions
    const systemPrompt = `${BOT_PERSONALITY}

You're chatting with ${currentUser.name}. Remember: NO *actions*, avoid repeating their name.

GIFs: Format [GIF:term]. Use sparingly (~5-10%) for big reactions only (shocked/excited/mind blown). Examples: "[GIF:shocked]" "[GIF:mind blown]"`;

    // Get Groq client and call API
    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...conversationHistory,
        {
          role: "user",
          content: message
        }
      ],
      model: BOT_CONFIG.model,
      temperature: BOT_CONFIG.temperature,
      max_tokens: BOT_CONFIG.maxTokens,
    });

    let botResponse = completion.choices[0].message.content;
    
    // Calculate tokens used (approximate)
    const tokensUsed = completion.usage?.total_tokens || 
      Math.ceil((systemPrompt.length + message.length + botResponse.length) / 4);

    // Check if bot wants to send a GIF
    const gifMatch = botResponse.match(/\[GIF:([^\]]+)\]/);
    let gifUrl = null;
    
    if (gifMatch) {
      const searchTerm = gifMatch[1];
      gifUrl = await searchGiphy(searchTerm);
      
      // Remove the [GIF:...] tag from the message
      botResponse = botResponse.replace(/\[GIF:[^\]]+\]/, '').trim();
    }

    // console.log("✅ Groq API response received:", botResponse.substring(0, 50) + "...");

    // If there's a GIF, send it as a separate message OR append to text
    if (gifUrl) {
      // Option 1: Send GIF as separate message (recommended for your UI)
      const gifMessage = await Message.create({
        content: gifUrl,
        sender: botUserId,
        chat: chatId,
        attachments: []
      });

      const botUser = await User.findById(botUserId, "name avatar");
      
      // Emit the GIF message first
      emitEvent(req, NEW_MESSAGE, chat.members, {
        message: {
          content: gifUrl,
          _id: gifMessage._id,
          sender: {
            _id: botUserId,
            name: botUser.name,
            avatar: botUser.avatar?.url || null
          },
          chat: chatId,
          createdAt: gifMessage.createdAt,
          replyTo: null
        },
        chatId
      });
    }

    // Save bot's text response as a message (if there's text)
    if (botResponse) {
      const botMessage = await Message.create({
        content: botResponse,
        sender: botUserId,
        chat: chatId,
        attachments: []
      });

      // console.log("✅ Bot message saved to DB, emitting socket event...");

      // Update usage statistics
      updateStats(req.user, currentUser.name, message, botResponse, tokensUsed);

      // Emit real-time message
      const botUser = await User.findById(botUserId, "name avatar");
      const io = req.app.get("io");
      
      const messageForRealTime = {
        content: botResponse,
        _id: botMessage._id,
        sender: {
          _id: botUserId,
          name: botUser.name,
          avatar: botUser.avatar?.url || null
        },
        chat: chatId,
        createdAt: botMessage.createdAt,
        replyTo: null
      };

      emitEvent(req, NEW_MESSAGE, chat.members, {
        message: messageForRealTime,
        chatId
      });

      emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

      return res.status(200).json({
        success: true,
        message: botMessage
      });
    } else if (gifUrl) {
      // Only GIF, no text - return success
      return res.status(200).json({
        success: true,
        message: { content: gifUrl }
      });
    }

  } catch (error) {
    console.error("Bot API Error:", error);
    
    // Send friendly error message as bot (random selection)
    const botUserId = await getBotUserId();
    const errorMessageText = BOT_CONFIG.getRandomErrorMessage();
    
    const errorMessage = await Message.create({
      content: errorMessageText,
      sender: botUserId,
      chat: chatId,
      attachments: []
    });

    const botUser = await User.findById(botUserId, "name avatar");
    emitEvent(req, NEW_MESSAGE, chat.members, {
      message: {
        content: errorMessageText,
        _id: errorMessage._id,
        sender: {
          _id: botUserId,
          name: botUser.name,
          avatar: botUser.avatar?.url || null
        },
        chat: chatId,
        createdAt: errorMessage.createdAt,
        replyTo: null
      },
      chatId
    });

    return res.status(200).json({
      success: true,
      message: errorMessage
    });
  }
});

// Get bot usage statistics (for admin)
export const getBotStats = TryCatch(async (req, res, next) => {
  // Get user stats as array sorted by usage
  const userStatsArray = Object.values(botUsageStats.userStats)
    .sort((a, b) => b.messages - a.messages);
  
  // Calculate today's usage
  const today = new Date().toISOString().split('T')[0];
  const todayMessages = botUsageStats.messagesPerDay[today] || 0;
  const todayTokens = botUsageStats.tokensPerDay[today] || 0;
  
  // Calculate daily token limit info
  const GROQ_DAILY_LIMIT = 100000;
  const tokensRemaining = GROQ_DAILY_LIMIT - todayTokens;
  const estimatedMessagesLeft = Math.floor(tokensRemaining / 1200); // ~1200 tokens per message
  
  return res.status(200).json({
    success: true,
    stats: {
      overview: {
        totalMessages: botUsageStats.totalMessages,
        totalTokensUsed: botUsageStats.totalTokensUsed,
        lastReset: botUsageStats.lastReset,
      },
      today: {
        messages: todayMessages,
        tokens: todayTokens,
        tokenLimit: GROQ_DAILY_LIMIT,
        tokensRemaining,
        estimatedMessagesLeft,
        usagePercentage: ((todayTokens / GROQ_DAILY_LIMIT) * 100).toFixed(2),
      },
      daily: {
        messagesPerDay: botUsageStats.messagesPerDay,
        tokensPerDay: botUsageStats.tokensPerDay,
      },
      users: userStatsArray,
      recentConversations: botUsageStats.conversationLogs.slice(0, 20), // Return last 20 conversations
    }
  });
});

// Get detailed user chat history (admin only)
export const getUserChatHistory = TryCatch(async (req, res, next) => {
  const { userId } = req.params;
  
  // Get all conversations for this user
  const userConversations = botUsageStats.conversationLogs
    .filter(log => log.userId.toString() === userId)
    .slice(0, 50); // Return last 50 conversations for this user
  
  const userStats = botUsageStats.userStats[userId];
  
  if (!userStats) {
    return res.status(404).json({
      success: false,
      message: "No chat history found for this user"
    });
  }
  
  return res.status(200).json({
    success: true,
    data: {
      user: userStats,
      conversations: userConversations,
    }
  });
});

// Check if a chat contains the bot
export const isBotChat = async (chatId) => {
  const botUserId = await getBotUserId();
  if (!botUserId) return false;

  const chat = await Chat.findById(chatId);
  if (!chat) return false;

  return chat.members.some(member => member.toString() === botUserId.toString());
};
