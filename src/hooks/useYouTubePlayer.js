import { useRef, useEffect, useState, useCallback } from 'react';

const useYouTubePlayer = (videoId) => {
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiReady, setApiReady] = useState(!!(window.YT && window.YT.Player));

  // Load YouTube IFrame API
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;

    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      setApiReady(true);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, []);

  // Create/update player when videoId or apiReady changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    if (!videoId || !apiReady) return;

    setIsLoading(true);

    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying existing player:', e);
      }
      playerRef.current = null;
    }

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      events: {
        onReady: (event) => {
          setIsReady(true);
          setIsLoading(false);
          event.target.pauseVideo();
          window.dispatchEvent(new Event('youtube-player-ready'));
        },
        onError: () => {
          setIsReady(false);
          setIsLoading(false);
        }
      }
    });

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying player during cleanup:', e);
        }
        playerRef.current = null;
      }
    };
  }, [videoId, apiReady]);

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

  return { playerRef, isReady, isLoading, playVideo, pauseVideo };
};

export default useYouTubePlayer;
