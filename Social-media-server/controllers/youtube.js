import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import axios from "axios";

// Get trending YouTube videos
const getTrendingVideos = TryCatch(async (req, res, next) => {
  const { categoryId, maxResults = 12 } = req.query;

  // Access env variable inside function, not at module level
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY) {
    return next(new ErrorHandler("YouTube API key not configured", 500));
  }

  const categoryParam = categoryId ? `&videoCategoryId=${categoryId}` : '';
  
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=${maxResults}&regionCode=US${categoryParam}&key=${YOUTUBE_API_KEY}`
  );

  const data = response.data;

  if (!Array.isArray(data.items)) {
    return next(new ErrorHandler("Invalid response from YouTube API", 500));
  }

  const videos = data.items.map(video => ({
    id: video.id,
    title: video.snippet.title,
    thumbnail: video.snippet.thumbnails.medium.url,
    channelTitle: video.snippet.channelTitle,
    duration: video.contentDetails.duration,
    views: video.statistics.viewCount,
    url: `https://www.youtube.com/watch?v=${video.id}`
  }));

  res.status(200).json({
    success: true,
    videos
  });
});

// Search YouTube videos
const searchVideos = TryCatch(async (req, res, next) => {
  const { query, categoryId, maxResults = 16 } = req.query;

  // Access env variable inside function, not at module level
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY) {
    return next(new ErrorHandler("YouTube API key not configured", 500));
  }

  if (!query) {
    return next(new ErrorHandler("Search query is required", 400));
  }

  const categoryParam = categoryId ? `&videoCategoryId=${categoryId}` : '';

  // First, search for videos
  const searchResponse = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video${categoryParam}&key=${YOUTUBE_API_KEY}`
  );

  const searchData = searchResponse.data;

  if (!Array.isArray(searchData.items)) {
    return next(new ErrorHandler("Invalid response from YouTube API", 500));
  }

  // Get video IDs to fetch additional details
  const videoIds = searchData.items.map(item => item.id.videoId).join(',');

  if (!videoIds) {
    return res.status(200).json({
      success: true,
      videos: []
    });
  }

  // Fetch video details (duration, views)
  const detailsResponse = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
  );

  const detailsData = detailsResponse.data;

  // Create a map of video details
  const detailsMap = {};
  detailsData.items?.forEach(item => {
    detailsMap[item.id] = {
      duration: item.contentDetails.duration,
      views: item.statistics.viewCount
    };
  });

  // Combine search results with details
  const videos = searchData.items.map(video => ({
    id: video.id.videoId,
    title: video.snippet.title,
    thumbnail: video.snippet.thumbnails.medium.url,
    channelTitle: video.snippet.channelTitle,
    duration: detailsMap[video.id.videoId]?.duration || 'N/A',
    views: detailsMap[video.id.videoId]?.views || 'N/A',
    url: `https://www.youtube.com/watch?v=${video.id.videoId}`
  }));

  res.status(200).json({
    success: true,
    videos
  });
});

export { getTrendingVideos, searchVideos };
