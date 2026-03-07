import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Custom hook for managing YouTube player integration.
 * Handles API loading, player creation, cleanup, and playback control.
 */
const useYouTubePlayer = (videoId) => {
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    // Skip loading API in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = () => {
      // API ready
    };
  }, []);

  // Create/update player when videoId changes
  useEffect(() => {
    // Skip player creation in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    if (!videoId || !window.YT || !window.YT.Player) {
      return;
    }

    setIsLoading(true);

    // Destroy existing player before creating a new one
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying existing player:', e);
      }
      playerRef.current = null;
    }

    // Create new player
    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      events: {
        onReady: (event) => {
          setIsReady(true);
          setIsLoading(false);
          // Initial state is paused
          event.target.pauseVideo();
        },
        onError: () => {
          setIsReady(false);
          setIsLoading(false);
        }
      }
    });

    return () => {
      // Cleanup player on unmount or when videoId changes
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying player during cleanup:', e);
        }
        playerRef.current = null;
      }
    };
  }, [videoId]);

  const playVideo = useCallback(() => {
    if (playerRef.current && playerRef.current.playVideo) {
      playerRef.current.playVideo();
    }
  }, []);

  const pauseVideo = useCallback(() => {
    if (playerRef.current && playerRef.current.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, []);

  return {
    playerRef,
    isReady,
    isLoading,
    playVideo,
    pauseVideo
  };
};

export default useYouTubePlayer;
