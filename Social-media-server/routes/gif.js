import express from "express";
import { getTrendingGifs, searchGifs } from "../controllers/gif.js";
import { isAuthenticated } from "../middlewares/auth.js";

const app = express.Router();

// Get trending GIFs
app.get("/trending", isAuthenticated, getTrendingGifs);

// Search GIFs
app.get("/search", isAuthenticated, searchGifs);

export default app;
