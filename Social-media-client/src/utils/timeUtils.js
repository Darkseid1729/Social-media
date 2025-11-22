/**
 * Format a timestamp to relative time (e.g., "5m ago", "2h ago", "3d ago")
 */
export const formatLastSeen = (lastSeenDate) => {
  if (!lastSeenDate) return null;
  
  const now = new Date();
  const lastSeen = new Date(lastSeenDate);
  const diffMs = now - lastSeen;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    // Format as date for older entries
    return lastSeen.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};
