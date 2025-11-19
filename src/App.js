import React, { useState, useEffect, useCallback } from 'react';
import PomodoroTimer from './PomodoroTimer';
import YouTubePlayer from './YouTubePlayer';
import { Container, CssBaseline, Box, createTheme, ThemeProvider, useMediaQuery, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function App() {
  const [videoId, setVideoId] = useState('');
  const [isWorkTime, setIsWorkTime] = useState(true);
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
          <PomodoroTimer onWorkTimeChange={handleWorkTimeChange} />
          <YouTubePlayer onVideoChange={setVideoId} />
          {videoId && (
            <Box sx={{ mt: 4, borderRadius: 2, overflow: 'hidden' }}>
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}?${isWorkTime ? 'autoplay=1' : 'autoplay=0'}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="YouTube video player"
                key={`${videoId}-${isWorkTime}`}
              />
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
