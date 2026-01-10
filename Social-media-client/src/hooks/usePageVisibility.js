import { useEffect } from 'react';

/**
 * Hook to handle page visibility changes on mobile
 * Mobile browsers aggressively suspend tabs when backgrounded
 * This hook helps reconnect socket/refresh data when user returns
 */
export const usePageVisibility = (onVisible, onHidden) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden (backgrounded on mobile)
        if (onHidden) onHidden();
      } else {
        // Page is visible (user returned to tab)
        if (onVisible) onVisible();
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also listen for focus/blur events (additional mobile support)
    window.addEventListener('focus', () => {
      if (!document.hidden && onVisible) onVisible();
    });

    window.addEventListener('blur', () => {
      if (onHidden) onHidden();
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('blur', onHidden);
    };
  }, [onVisible, onHidden]);
};
