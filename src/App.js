import React, { useState, useEffect, useCallback, useRef } from 'react';
import PomodoroTimer from './PomodoroTimer';
import YouTubePlayer from './YouTubePlayer';
import { Container, CssBaseline, Box, createTheme, ThemeProvider, useMediaQuery, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function App() {
  const [videoId, setVideoId] = useState('');
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const playerRef = useRef(null);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);

  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleWorkTimeChange = useCallback((isWorkTime) => {
    setIsWorkTime(isWorkTime);
  }, []);

  const handleTimerActiveChange = useCallback((isActive) => {
    setIsTimerActive(isActive);
  }, []);

  // Control video playback based on timer state
  useEffect(() => {
    // Skip video control in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    if (playerRef.current) {
      const shouldPlay = isWorkTime && isTimerActive;
      if (shouldPlay) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isWorkTime, isTimerActive]);

  // Load YouTube IFrame API
  useEffect(() => {
    // Skip loading API in test environment
    if (process.env.NODE_ENV === 'test') {
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
      // API ready, player will be created when videoId changes
    };
  }, []);

  // Create/update player when videoId changes
  useEffect(() => {
    // Skip player creation in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    if (videoId && window.YT && window.YT.Player) {
      if (!playerRef.current) {
        playerRef.current = new window.YT.Player('youtube-player', {
          videoId: videoId,
          events: {
            onReady: (event) => {
              // Video ready, initial state is paused
              event.target.pauseVideo();
            }
          }
        });
      } else {
        // Update video if different
        playerRef.current.loadVideoById(videoId);
        playerRef.current.pauseVideo();
      }
    }
  }, [videoId]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <CssBaseline />
        <Box sx={{
          my: 4,
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: 'background.paper',
          position: 'relative'
        }}>
          <IconButton
            onClick={toggleDarkMode}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              color: darkMode ? 'white' : 'black',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
              }
            }}
          >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <PomodoroTimer 
            onWorkTimeChange={handleWorkTimeChange}
            onTimerActiveChange={handleTimerActiveChange}
          />
          <YouTubePlayer onVideoChange={setVideoId} />
          {videoId && (
            <Box sx={{ mt: 4, borderRadius: 2, overflow: 'hidden' }}>
              <div
                id="youtube-player"
                style={{ width: '100%', height: '315px' }}
              />
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
