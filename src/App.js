import React, { useState, useEffect, useCallback } from 'react';
import PomodoroTimer from './PomodoroTimer';
import YouTubePlayer from './YouTubePlayer';
import useBellSound from './hooks/useBellSound';
import useYouTubePlayer from './hooks/useYouTubePlayer';
import { Container, CssBaseline, Box, createTheme, ThemeProvider, useMediaQuery, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function App() {
  const [videoId, setVideoId] = useState('');
  const [isWorkTime, setIsWorkTime] = useState(true);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);

  // Use custom hooks
  const audioRef = useBellSound();
  const { playVideo, pauseVideo } = useYouTubePlayer(videoId);

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

  const themeToggleButton = (
    <IconButton
      onClick={toggleDarkMode}
      aria-label={darkMode ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
      sx={{
        borderRadius: '50%',
        border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)'}`,
        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        color: darkMode ? 'warning.light' : 'primary.main',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 0, 0, 0.08)'
        }
      }}
    >
      {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );

  const handleWorkTimeChange = useCallback((isWorkTime) => {
    setIsWorkTime(isWorkTime);
  }, []);

  const handleTimerActiveChange = useCallback((isActive) => {
    setIsTimerActive(isActive);
  }, []);

  const handlePhaseComplete = useCallback(() => {
    // Skip in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    // Pause YouTube video
    pauseVideo();

    // Play bell sound
    if (audioRef && audioRef.play) {
      try {
        audioRef.play();
      } catch (error) {
        console.warn('Could not play bell sound:', error);
      }
    }
  }, [pauseVideo, audioRef]);

  // Control video playback based on timer state
  useEffect(() => {
    // Skip video control in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const shouldPlay = isWorkTime && isTimerActive;
    if (shouldPlay) {
      playVideo();
    } else {
      pauseVideo();
    }
  }, [isWorkTime, isTimerActive, playVideo, pauseVideo]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <CssBaseline />
        <Box
          sx={{
            my: { xs: 2, md: 4 },
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            boxShadow: { xs: 2, md: 6 },
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <PomodoroTimer
            onWorkTimeChange={handleWorkTimeChange}
            onTimerActiveChange={handleTimerActiveChange}
            onPhaseComplete={handlePhaseComplete}
            themeToggle={themeToggleButton}
          />
          <YouTubePlayer onVideoChange={setVideoId} />
          {videoId && (
            <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
              <div id="youtube-player" style={{ width: '100%', height: '315px' }} />
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
