import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import axios from "axios";

// Get trending GIFs
const getTrendingGifs = TryCatch(async (req, res, next) => {
  const { limit = 12 } = req.query;
  
  // Access env variables inside function, not at module level
  const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
  const TENOR_API_KEY = process.env.TENOR_API_KEY;
  
  console.log('getTrendingGifs called, limit:', limit);
  console.log('GIPHY_API_KEY exists:', !!GIPHY_API_KEY);
  console.log('TENOR_API_KEY exists:', !!TENOR_API_KEY);

  if (!GIPHY_API_KEY && !TENOR_API_KEY) {
    return next(new ErrorHandler("API keys not configured", 500));
  }

  // Try Giphy first
  if (GIPHY_API_KEY) {
    try {
      const response = await axios.get(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=g`
      );
      
      const data = response.data;
      
      if (Array.isArray(data.data)) {
        const gifs = data.data.map(gif => ({
          id: gif.id,
          previewUrl: gif.images.fixed_height_small.url,
          fullUrl: gif.images.fixed_height.url,
          title: gif.title
        }));

        return res.status(200).json({
          success: true,
          gifs
        });
      }
    } catch (err) {
      console.error('Giphy error:', err.message);
      // Continue to Tenor fallback
    }
  }

  // Fallback to Tenor
  if (TENOR_API_KEY) {
    try {
      const response = await axios.get(
        `https://tenor.googleapis.com/v2/featured?key=${TENOR_API_KEY}&limit=${limit}&contentfilter=high`
      );
      
      const data = response.data;
      
      if (Array.isArray(data.results)) {
        const gifs = data.results.map(gif => ({
          id: gif.id,
          previewUrl: gif.media_formats.tinygif?.url || gif.media_formats.gif.url,
          fullUrl: gif.media_formats.gif.url,
          title: gif.content_description || 'GIF'
        }));

        return res.status(200).json({
          success: true,
          gifs
        });
      }
    } catch (err) {
      console.error('Tenor error:', err.message);
      return next(new ErrorHandler("Failed to fetch trending GIFs", 500));
    }
  }

  return next(new ErrorHandler("Failed to fetch trending GIFs", 500));
});

// Search GIFs
const searchGifs = TryCatch(async (req, res, next) => {
  const { query, limit = 16 } = req.query;

  if (!query) {
    return next(new ErrorHandler("Search query is required", 400));
  }

  // Access env variables inside function, not at module level
  const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
  const TENOR_API_KEY = process.env.TENOR_API_KEY;

  if (!GIPHY_API_KEY && !TENOR_API_KEY) {
    return next(new ErrorHandler("API keys not configured", 500));
  }

  // Try Giphy first
  if (GIPHY_API_KEY) {
    try {
      const response = await axios.get(
        `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(query)}&api_key=${GIPHY_API_KEY}&limit=${limit}&rating=g`
      );
      
      const data = response.data;
      
      if (Array.isArray(data.data)) {
        const gifs = data.data.map(gif => ({
          id: gif.id,
          previewUrl: gif.images.fixed_height_small.url,
          fullUrl: gif.images.fixed_height.url,
          title: gif.title
        }));

        return res.status(200).json({
          success: true,
          gifs
        });
      }
    } catch (err) {
      console.error('Giphy search error:', err.message);
      // Continue to Tenor fallback
    }
  }

  // Fallback to Tenor
  if (TENOR_API_KEY) {
    try {
      const response = await axios.get(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=${limit}&contentfilter=high`
      );
      
      const data = response.data;
      
      if (Array.isArray(data.results)) {
        const gifs = data.results.map(gif => ({
          id: gif.id,
          previewUrl: gif.media_formats.tinygif?.url || gif.media_formats.gif.url,
          fullUrl: gif.media_formats.gif.url,
          title: gif.content_description || 'GIF'
        }));

        return res.status(200).json({
          success: true,
          gifs
        });
      }
    } catch (err) {
      console.error('Tenor search error:', err.message);
      return next(new ErrorHandler("Failed to search GIFs", 500));
    }
  }

  return next(new ErrorHandler("Failed to search GIFs", 500));
});

export { getTrendingGifs, searchGifs };
