import express from "express";
import { getTrendingVideos, searchVideos } from "../controllers/youtube.js";
import { isAuthenticated } from "../middlewares/auth.js";

const app = express.Router();

// Get trending videos
app.get("/trending", isAuthenticated, getTrendingVideos);

// Search videos
app.get("/search", isAuthenticated, searchVideos);

export default app;
