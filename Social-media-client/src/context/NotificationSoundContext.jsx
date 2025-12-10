import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const NotificationSoundContext = createContext();

export const useNotificationSound = () => {
  const context = useContext(NotificationSoundContext);
  if (!context) {
    throw new Error('useNotificationSound must be used within NotificationSoundProvider');
  }
  return context;
};

export const NotificationSoundProvider = ({ children }) => {
  // Load initial state from localStorage, default to false (off)
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationSoundEnabled');
    return saved === 'true';
  });
  
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.5; // Set volume to 50%
  }, []);

  // Save to localStorage whenever soundEnabled changes
  useEffect(() => {
    localStorage.setItem('notificationSoundEnabled', soundEnabled);
  }, [soundEnabled]);

  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log('Failed to play notification sound:', err);
      });
    }
  };

  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  return (
    <NotificationSoundContext.Provider 
      value={{ 
        soundEnabled, 
        toggleSound, 
        playNotificationSound 
      }}
    >
      {children}
    </NotificationSoundContext.Provider>
  );
};
