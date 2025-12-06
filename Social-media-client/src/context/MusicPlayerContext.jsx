import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

const MusicPlayerContext = createContext();

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context) {
    throw new Error('useMusicPlayer must be used within MusicPlayerProvider');
  }
  return context;
};

export const MusicPlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isPlayerDialogOpen, setIsPlayerDialogOpen] = useState(false);
  const [isMusicSearchOpen, setIsMusicSearchOpen] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  
  const playerRef = useRef(null);
  const progressInterval = useRef(null);

  // Initialize YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube IFrame API Ready');
    };
  }, []);

  // Create player when a song is selected
  useEffect(() => {
    if (currentSong && window.YT && window.YT.Player) {
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player('youtube-audio-player', {
          height: '0',
          width: '0',
          videoId: currentSong.videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(volume);
              event.target.playVideo();
              setIsPlaying(true);
              setDuration(event.target.getDuration());
              startProgressTracking();
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                handleNext();
              } else if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                setDuration(event.target.getDuration());
                startProgressTracking();
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
                stopProgressTracking();
              }
            },
          },
        });
      } else {
        playerRef.current.loadVideoById(currentSong.videoId);
        playerRef.current.setVolume(volume);
      }
    }
  }, [currentSong]);

  const startProgressTracking = () => {
    stopProgressTracking();
    progressInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const playSong = useCallback((song, songQueue = null, index = 0) => {
    setCurrentSong(song);
    setCurrentIndex(index);
    if (songQueue) {
      setQueue(songQueue);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    }
  }, [isPlaying]);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (isRepeat) {
      nextIndex = currentIndex;
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }
    
    setCurrentIndex(nextIndex);
    setCurrentSong(queue[nextIndex]);
  }, [queue, currentIndex, isShuffle, isRepeat]);

  const handlePrevious = useCallback(() => {
    if (queue.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentSong(queue[prevIndex]);
  }, [queue, currentIndex]);

  const changeVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  }, []);

  const seekTo = useCallback((seconds) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  const addToQueue = useCallback((song) => {
    setQueue(prev => [...prev, song]);
  }, []);

  const removeFromQueue = useCallback((index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
    if (index < currentIndex) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndex(0);
  }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat(prev => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const value = {
    currentSong,
    isPlaying,
    queue,
    currentIndex,
    volume,
    duration,
    currentTime,
    isRepeat,
    isShuffle,
    isPlayerDialogOpen,
    isMusicSearchOpen,
    playSong,
    togglePlay,
    handleNext,
    handlePrevious,
    changeVolume,
    seekTo,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleRepeat,
    toggleShuffle,
    setIsPlayerDialogOpen,
    setIsMusicSearchOpen,
    playerRef,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      {/* Hidden YouTube player */}
      <div id="youtube-audio-player" style={{ display: 'none' }}></div>
    </MusicPlayerContext.Provider>
  );
};
