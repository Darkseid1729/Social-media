import { useEffect, useRef } from 'react';

/**
 * Hook to handle page visibility changes on mobile
 * Mobile browsers aggressively suspend tabs when backgrounded
 * This hook helps reconnect socket/refresh data when user returns
 */
export const usePageVisibility = (onVisible, onHidden) => {
  // Use refs so the event listeners always call the latest callbacks
  // without needing to re-register on every render
  const onVisibleRef = useRef(onVisible);
  const onHiddenRef = useRef(onHidden);

  // Keep refs up to date on every render
  useEffect(() => {
    onVisibleRef.current = onVisible;
    onHiddenRef.current = onHidden;
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (onHiddenRef.current) onHiddenRef.current();
      } else {
        if (onVisibleRef.current) onVisibleRef.current();
      }
    };

    const handleFocus = () => {
      if (!document.hidden && onVisibleRef.current) onVisibleRef.current();
    };

    const handleBlur = () => {
      if (onHiddenRef.current) onHiddenRef.current();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []); // registers once — refs ensure latest callbacks are always used
};

