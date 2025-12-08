import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utility.js";
import axios from "axios";

// Helper function to convert ISO 8601 duration to seconds
const parseDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
};

// Get trending YouTube videos
const getTrendingVideos = TryCatch(async (req, res, next) => {
  const { categoryId, maxResults = 12, videoDuration } = req.query;

  // Access env variable inside function, not at module level
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY) {
    return next(new ErrorHandler("YouTube API key not configured", 500));
  }

  const categoryParam = categoryId ? `&videoCategoryId=${categoryId}` : '';
  
  // Fetch more videos than needed so we can filter by duration
  const fetchCount = videoDuration === 'short' ? maxResults * 3 : maxResults;
  
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&chart=mostPopular&maxResults=${fetchCount}&regionCode=US${categoryParam}&key=${YOUTUBE_API_KEY}`
  );

  const data = response.data;

  if (!Array.isArray(data.items)) {
    return next(new ErrorHandler("Invalid response from YouTube API", 500));
  }

  let videos = data.items.map(video => ({
    id: video.id,
    title: video.snippet.title,
    thumbnail: video.snippet.thumbnails.medium.url,
    channelTitle: video.snippet.channelTitle,
    duration: video.contentDetails.duration,
    views: video.statistics.viewCount,
    url: `https://www.youtube.com/watch?v=${video.id}`
  }));

  // Filter for shorts (videos ≤60 seconds)
  if (videoDuration === 'short') {
    videos = videos.filter(video => {
      const durationInSeconds = parseDuration(video.duration);
      return durationInSeconds > 0 && durationInSeconds <= 60;
    });
    // Limit to requested maxResults after filtering
    videos = videos.slice(0, maxResults);
  }

  res.status(200).json({
    success: true,
    videos
  });
});

// Search YouTube videos
const searchVideos = TryCatch(async (req, res, next) => {
  const { query, categoryId, maxResults = 16, videoDuration } = req.query;

  // Access env variable inside function, not at module level
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

  if (!YOUTUBE_API_KEY) {
    return next(new ErrorHandler("YouTube API key not configured", 500));
  }

  if (!query) {
    return next(new ErrorHandler("Search query is required", 400));
  }

  const categoryParam = categoryId ? `&videoCategoryId=${categoryId}` : '';
  
  // Fetch more results if filtering for shorts
  const fetchCount = videoDuration === 'short' ? maxResults * 3 : maxResults;

  // First, search for videos - use videoDuration param for search API
  const durationParam = videoDuration ? `&videoDuration=${videoDuration}` : '';
  const searchResponse = await axios.get(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${fetchCount}&q=${encodeURIComponent(query)}&type=video${categoryParam}${durationParam}&key=${YOUTUBE_API_KEY}`
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
  let videos = searchData.items.map(video => ({
    id: video.id.videoId,
    title: video.snippet.title,
    thumbnail: video.snippet.thumbnails.medium.url,
    channelTitle: video.snippet.channelTitle,
    duration: detailsMap[video.id.videoId]?.duration || 'N/A',
    views: detailsMap[video.id.videoId]?.views || 'N/A',
    url: `https://www.youtube.com/watch?v=${video.id.videoId}`
  }));

  // Additional filter for shorts to ensure only ≤60 second videos
  if (videoDuration === 'short') {
    videos = videos.filter(video => {
      if (video.duration === 'N/A') return false;
      const durationInSeconds = parseDuration(video.duration);
      return durationInSeconds > 0 && durationInSeconds <= 60;
    });
    // Limit to requested maxResults after filtering
    videos = videos.slice(0, maxResults);
  }

  res.status(200).json({
    success: true,
    videos
  });
});

export { getTrendingVideos, searchVideos };
