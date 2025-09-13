// Utility functions for link detection and parsing

// URL regex pattern that matches various URL formats including query parameters
const urlRegex = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi;

// YouTube URL patterns
const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

/**
 * Detects URLs in text and returns array of found URLs
 * @param {string} text - Text to search for URLs
 * @returns {Array} Array of URL objects with position and URL
 */
export const detectUrls = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const matches = [];
  let match;
  
  // Reset regex lastIndex
  urlRegex.lastIndex = 0;
  
  while ((match = urlRegex.exec(text)) !== null) {
    matches.push({
      url: match[0],
      index: match.index,
      length: match[0].length
    });
  }
  
  return matches;
};

/**
 * Checks if URL is a YouTube link and extracts video ID
 * @param {string} url - URL to check
 * @returns {Object} Object with isYoutube flag and videoId
 */
export const parseYouTubeUrl = (url) => {
  const match = url.match(youtubeRegex);
  return {
    isYoutube: !!match,
    videoId: match ? match[1] : null
  };
};

/**
 * Validates and sanitizes URL
 * @param {string} url - URL to validate
 * @returns {string|null} Sanitized URL or null if invalid
 */
export const sanitizeUrl = (url) => {
  try {
    // Don't modify if it already has a valid protocol
    if (/^https?:\/\//i.test(url)) {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return null;
      }
      
      // Return the original URL if it's already properly formatted
      return url;
    } else {
      // Add protocol if missing
      url = 'https://' + url;
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return null;
      }
      
      return urlObj.href;
    }
  } catch (error) {
    return null;
  }
};

/**
 * Fetches link preview metadata
 * @param {string} url - URL to get preview for
 * @returns {Promise} Promise resolving to preview data
 */
export const fetchLinkPreview = async (url) => {
  try {
    const sanitizedUrl = sanitizeUrl(url);
    if (!sanitizedUrl) return null;
    
    // For YouTube links, use YouTube oEmbed API
    const { isYoutube, videoId } = parseYouTubeUrl(sanitizedUrl);
    if (isYoutube && videoId) {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        return {
          title: data.title,
          description: `By ${data.author_name}`,
          thumbnail: data.thumbnail_url,
          type: 'youtube',
          videoId: videoId,
          url: sanitizedUrl
        };
      }
    }
    
    // For other links, we'll need a CORS proxy or backend service
    // For now, return basic link info
    return {
      title: getDomainFromUrl(sanitizedUrl),
      description: 'Click to visit website',
      thumbnail: null,
      type: 'website',
      url: sanitizedUrl
    };
    
  } catch (error) {
    console.error('Error fetching link preview:', error);
    return null;
  }
};

/**
 * Extracts domain name from URL
 * @param {string} url - URL to extract domain from
 * @returns {string} Domain name
 */
export const getDomainFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    return url;
  }
};

/**
 * Splits text into parts with URLs marked
 * @param {string} text - Text to split
 * @returns {Array} Array of text parts and URL objects
 */
export const parseTextWithUrls = (text) => {
  if (!text || typeof text !== 'string') return [{ type: 'text', content: text }];
  
  const urls = detectUrls(text);
  if (urls.length === 0) return [{ type: 'text', content: text }];
  
  const parts = [];
  let lastIndex = 0;
  
  urls.forEach(urlObj => {
    // Add text before URL
    if (urlObj.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, urlObj.index)
      });
    }
    
    // Add URL
    const sanitizedUrl = sanitizeUrl(urlObj.url);
    parts.push({
      type: 'url',
      content: urlObj.url,
      url: sanitizedUrl
    });
    
    lastIndex = urlObj.index + urlObj.length;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }
  
  return parts;
};