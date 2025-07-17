import { useState, useEffect, useRef } from "react";

export function useNotificationSound() {
  const [muted, setMuted] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new window.Audio("/ting.mp3");
  }, []);

  const playSound = () => {
    if (!muted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  return { playSound, muted, setMuted };
}
