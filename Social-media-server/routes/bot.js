import express from "express";
import { chatWithBot, getBotStats } from "../controllers/bot.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Chat with bot
router.post("/chat", chatWithBot);

// Get bot usage statistics (admin only - can add admin middleware later)
router.get("/stats", getBotStats);

export default router;
