import express from "express";
import { chatWithBot, getBotStats, getUserChatHistory } from "../controllers/bot.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Chat with bot
router.post("/chat", chatWithBot);

// Get bot usage statistics (admin panel)
router.get("/stats", getBotStats);

// Get specific user's chat history with bot
router.get("/user/:userId", getUserChatHistory);

export default router;
