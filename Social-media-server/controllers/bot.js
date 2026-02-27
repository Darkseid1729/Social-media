import Groq from "groq-sdk";
import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import { Chat } from "../models/chat.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { emitEvent } from "../utils/features.js";
import { NEW_MESSAGE, NEW_MESSAGE_ALERT, START_TYPING, STOP_TYPING } from "../constants/events.js";
import { getBotUserId } from "../seeders/bot.js";
import { getSockets } from "../lib/helper.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Track which API key to use (rotates on rate limit)
let currentApiKeyIndex = 0;

// Helper to get Groq client with automatic failover
const getGroqClient = () => {
  const apiKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY2
  ].filter(Boolean); // Remove undefined/null keys
  
  if (apiKeys.length === 0) {
    throw new Error("No GROQ_API_KEY configured");
  }
  
  // Use current key (will rotate on error)
  const apiKey = apiKeys[currentApiKeyIndex % apiKeys.length];
  return new Groq({ apiKey });
};

// Helper to rotate API key on rate limit
const rotateApiKey = () => {
  currentApiKeyIndex++;
  const apiKeys = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY2].filter(Boolean);
  console.log(`🔄 Rotated to API key ${(currentApiKeyIndex % apiKeys.length) + 1}`);
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
  bufferTime: 1500, // 1.5 seconds to wait for more messages
  extendedBufferTime: 2500, // 2.5 seconds for short messages
  minBufferTime: 1000, // 1 second for long messages
  typingExtensionTime: 1000, // Extend buffer if user is typing
  messageSplitDelay: 400, // Delay between multiple bot messages
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

// Message buffering system for intelligent conversation flow
const messageBuffer = new Map(); // chatId -> { messages: [], timeoutId, userId, lastActivity }

// Helper to detect if content is a GIF
const isGifUrl = (content) => {
  if (!content || typeof content !== 'string') return false;
  return /\.(gif)$/i.test(content) || 
         content.includes('giphy.com') || 
         content.includes('tenor.com') ||
         content.includes('media.tenor.com') ||
         content.includes('media.giphy.com');
};

// Helper to calculate intelligent buffer time
const calculateBufferTime = (messages) => {
  if (!messages || messages.length === 0) return BOT_CONFIG.bufferTime;
  
  const lastMessage = messages[messages.length - 1];
  const messageLength = lastMessage.content?.length || 0;
  
  // Short messages (< 10 chars) get longer buffer (user might send more)
  if (messageLength < 10) return BOT_CONFIG.extendedBufferTime;
  
  // Long messages (> 100 chars) get shorter buffer (user is done talking)
  if (messageLength > 100) return BOT_CONFIG.minBufferTime;
  
  return BOT_CONFIG.bufferTime;
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

// Extract GIF metadata from Giphy URL
const getGifMetadata = async (gifUrl) => {
  try {
    console.log('🔍 Extracting GIF ID from URL:', gifUrl);
    
    // Extract GIF ID from various Giphy URL formats
    let gifId = null;
    
    // Try different URL patterns (order matters - most specific first!)
    const patterns = [
      /media\d*\.giphy\.com\/media\/[^\/]+\/([A-Za-z0-9]+)\/\d+\.gif/, // media.giphy.com/media/v1.../ID/200.gif (MUST CHECK FIRST)
      /giphy\.com\/gifs\/[^\/]*-([A-Za-z0-9]+)/, // giphy.com/gifs/name-ID
      /giphy\.com\/media\/([A-Za-z0-9]+)/, // giphy.com/media/ID
    ];
    
    for (const pattern of patterns) {
      const match = gifUrl.match(pattern);
      if (match) {
        gifId = match[1];
        console.log('✅ Extracted GIF ID:', gifId, 'using pattern:', pattern.toString());
        break;
      }
    }
    
    if (!gifId) {
      console.log('❌ Could not extract GIF ID from URL');
      return '[GIF]';
    }
    
    // Fetch GIF metadata from Giphy API
    const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
    console.log('🔑 Using Giphy API key:', GIPHY_API_KEY ? 'Present' : 'Missing');
    
    const apiUrl = `https://api.giphy.com/v1/gifs/${gifId}?api_key=${GIPHY_API_KEY}`;
    console.log('📡 Fetching from:', apiUrl.replace(GIPHY_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await fetch(apiUrl);
    
    console.log('📥 API Response status:', response.status);
    
    if (!response.ok) {
      console.log('❌ API request failed:', response.statusText);
      return '[GIF]';
    }
    
    const data = await response.json();
    const gif = data.data;
    
    console.log('🎬 GIF Metadata:', {
      title: gif.title,
      alt_text: gif.alt_text,
      tags: gif.tags,
      slug: gif.slug
    });
    
    // Try multiple sources for description (priority order)
    let description = '';
    
    // 1. Try alt_text (usually most descriptive)
    if (gif.alt_text && gif.alt_text.length > 3) {
      description = gif.alt_text;
    }
    // 2. Try title
    else if (gif.title && gif.title.length > 3) {
      description = gif.title;
    }
    // 3. Try slug (URL-friendly name)
    else if (gif.slug && gif.slug.length > 3) {
      description = gif.slug.replace(/-/g, ' ');
    }
    // 4. Fallback to tags
    else if (gif.tags && gif.tags.length > 0) {
      description = gif.tags.slice(0, 3).join(' ');
    }
    else {
      description = 'animated';
    }
    
    // Clean up description
    description = description
      .replace(/\s*-\s*Find & Share on GIPHY\s*/i, '')
      .replace(/\s+GIF\s*$/i, '')
      .replace(/\s*Sticker\s*$/i, '')
      .trim();
    
    // Limit length
    if (description.length > 50) {
      description = description.substring(0, 47) + '...';
    }
    
    console.log('✅ Final GIF description:', description);
    
    return `[GIF: ${description}]`;
  } catch (error) {
    console.error('Error fetching GIF metadata:', error.message);
    return '[GIF]';
  }
};

// Process buffered messages and generate intelligent response
const processBufferedMessages = async (chatId, req, io) => {
  const buffer = messageBuffer.get(chatId);
  if (!buffer || buffer.messages.length === 0) return;
  
  const { messages, userId } = buffer;
  
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return;
    
    const botUserId = await getBotUserId();
    if (!botUserId) return;
    
    const currentUser = await User.findById(userId, "name");
    if (!currentUser) return;
    
    // Get conversation history
    const recentMessages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .limit(BOT_CONFIG.contextMessages)
      .populate("sender", "name")
      .lean();
    
    // Format conversation history with GIF metadata
    const conversationHistory = [];
    for (const msg of recentMessages.reverse()) {
      let content = msg.content;
      // Extract GIF metadata for conversation history
      if (isGifUrl(content)) {
        content = await getGifMetadata(content);
      }
      
      const formattedContent = msg.sender.name === currentUser.name 
        ? content 
        : `${msg.sender.name}: ${content}`;
        
      conversationHistory.push({
        role: msg.sender._id.toString() === botUserId.toString() ? "assistant" : "user",
        content: formattedContent
      });
    }
    
    // Format buffered messages with GIF metadata
    const bufferedParts = [];
    for (const m of messages) {
      if (isGifUrl(m.content)) {
        bufferedParts.push(await getGifMetadata(m.content));
      } else {
        bufferedParts.push(m.content);
      }
    }
    const bufferedContent = bufferedParts.join('\n');
    
    // Build enhanced system prompt
    const systemPrompt = `${BOT_PERSONALITY}

Chatting with ${currentUser.name} (Indian timezone/audience).

IMPORTANT INSTRUCTIONS:
- NEVER write "Joon:" or your name before your messages. Respond directly without any prefix.
- When you see [GIF: description], react to the actual GIF content, not just "nice gif"
  Example: "[GIF: are you alive meme]" → "barely lol, been studying all day 💀" (NOT "that gif tho 😂")
- If user sent multiple messages, you can respond with 1-3 separate messages to feel natural
- To send multiple messages, separate each with "|||" (e.g., "hey! 😊|||how's it going?|||what you up to?")
- Keep each message short and natural, like real texting
- NO *actions*, avoid repeating their name
- GIFs: Format [GIF:term] for big reactions only. Examples: "[GIF:shocked]" "[GIF:laughing]"

WRONG: "Joon: hey what's up"
RIGHT: "hey what's up"`;

    // Show typing indicator
    const membersSockets = getSockets(chat.members);
    io.to(membersSockets).emit(START_TYPING, { chatId });
    
    // Call AI with automatic retry on rate limit
    let completion;
    let retryCount = 0;
    const maxRetries = 2; // Try both API keys
    
    while (retryCount < maxRetries) {
      try {
        const groq = getGroqClient();
        completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            ...conversationHistory,
            { role: "user", content: bufferedContent }
          ],
          model: BOT_CONFIG.model,
          temperature: BOT_CONFIG.temperature,
          max_tokens: BOT_CONFIG.maxTokens,
        });
        break; // Success, exit loop
      } catch (error) {
        // Check if it's a rate limit error
        if (error.status === 429 || error.message?.includes('rate limit') || error.message?.includes('quota')) {
          console.log(`⚠️ Rate limit hit on API key ${currentApiKeyIndex + 1}, switching...`);
          rotateApiKey();
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            continue;
          }
        }
        throw error; // Re-throw if not rate limit or max retries reached
      }
    }
    
    if (!completion) {
      throw new Error("Failed to get response from any API key");
    }
    
    let botResponse = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 
      Math.ceil((systemPrompt.length + bufferedContent.length + botResponse.length) / 4);
    
    // CRITICAL: Remove "Joon:" or any name prefix from response
    botResponse = botResponse.replace(/^(Joon|joon):\s*/gm, '').trim();
    
    // Calculate realistic typing delay
    const baseDelay = 1000 + Math.random() * 1000;
    const lengthDelay = Math.min(botResponse.length * 20, 2000);
    const totalDelay = baseDelay + lengthDelay;
    await new Promise(resolve => setTimeout(resolve, totalDelay));
    
    // Stop typing
    io.to(membersSockets).emit(STOP_TYPING, { chatId });
    
    // Split multiple messages
    const replies = botResponse.split('|||').map(r => r.trim()).filter(Boolean);
    
    // Send each message with natural delay
    for (let i = 0; i < replies.length; i++) {
      if (i > 0) {
        // Show typing between messages
        io.to(membersSockets).emit(START_TYPING, { chatId });
        await new Promise(resolve => setTimeout(resolve, BOT_CONFIG.messageSplitDelay));
        io.to(membersSockets).emit(STOP_TYPING, { chatId });
      }
      
      let messageContent = replies[i];
      let gifUrl = null;
      
      // Clean any remaining "Joon:" prefix from individual messages
      messageContent = messageContent.replace(/^(Joon|joon):\s*/gm, '').trim();
      
      // Check for GIF request
      const gifMatch = messageContent.match(/\[GIF:([^\]]+)\]/);
      if (gifMatch) {
        gifUrl = await searchGiphy(gifMatch[1]);
        messageContent = messageContent.replace(/\[GIF:[^\]]+\]/, '').trim();
      }
      
      // Send GIF first if exists
      if (gifUrl) {
        const gifMessage = await Message.create({
          content: gifUrl,
          sender: botUserId,
          chat: chatId,
          attachments: []
        });
        
        const botUser = await User.findById(botUserId, "name avatar");
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
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Send text message if exists
      if (messageContent) {
        const botMessage = await Message.create({
          content: messageContent,
          sender: botUserId,
          chat: chatId,
          attachments: []
        });
        
        const botUser = await User.findById(botUserId, "name avatar");
        const messageForRealTime = {
          content: messageContent,
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
        
        emitEvent(req, NEW_MESSAGE, chat.members, { message: messageForRealTime, chatId });
        emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });
      }
    }
    
    // Update stats
    updateStats(userId, currentUser.name, bufferedContent, botResponse, tokensUsed);
    
  } catch (error) {
    console.error('Error processing buffered messages:', error);
  } finally {
    // Clear buffer
    messageBuffer.delete(chatId);
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

  // IMPORTANT: If the user IS the bot (logged in as Joon), don't generate a response
  if (req.user.toString() === botUserId.toString()) {
    return res.status(200).json({
      success: true,
      message: "Message sent as bot, no auto-response needed"
    });
  }

  // Add message to buffer for intelligent processing
  if (!messageBuffer.has(chatId)) {
    messageBuffer.set(chatId, {
      messages: [],
      timeoutId: null,
      userId: req.user,
      lastActivity: Date.now()
    });
  }
  
  const buffer = messageBuffer.get(chatId);
  buffer.messages.push({
    content: message.trim(),
    timestamp: Date.now()
  });
  buffer.lastActivity = Date.now();
  
  // Clear existing timeout
  if (buffer.timeoutId) {
    clearTimeout(buffer.timeoutId);
  }
  
  // Calculate intelligent buffer time based on message characteristics
  const bufferTime = calculateBufferTime(buffer.messages);
  
  // Set new timeout to process messages
  const io = req.app.get("io");
  buffer.timeoutId = setTimeout(() => {
    processBufferedMessages(chatId, req, io);
  }, bufferTime);
  
  // Return success immediately (bot will respond via buffer processing)
  return res.status(200).json({
    success: true,
    message: "Message queued for bot response"
  });
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
  
  // Calculate daily token limit info (with 2 API keys)
  const apiKeyCount = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY2].filter(Boolean).length;
  const GROQ_DAILY_LIMIT = 100000 * apiKeyCount; // 100k per key
  const tokensRemaining = GROQ_DAILY_LIMIT - todayTokens;
  const estimatedMessagesLeft = Math.floor(tokensRemaining / 1200); // ~1200 tokens per message
  
  return res.status(200).json({
    success: true,
    stats: {
      overview: {
        totalMessages: botUsageStats.totalMessages,
        totalTokensUsed: botUsageStats.totalTokensUsed,
        lastReset: botUsageStats.lastReset,
        apiKeysConfigured: apiKeyCount,
        currentApiKey: currentApiKeyIndex + 1,
      },
      today: {
        messages: todayMessages,
        tokens: todayTokens,
        tokenLimit: GROQ_DAILY_LIMIT,
        tokensRemaining,
        estimatedMessagesLeft,
        usagePercentage: ((todayTokens / GROQ_DAILY_LIMIT) * 100).toFixed(2),
        limitPerKey: 100000,
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
