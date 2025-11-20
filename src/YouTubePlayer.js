import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Box,
  Button,
  Typography,
  Stack
} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';

const YouTubePlayer = ({ onVideoChange }) => {
  const [videoUrl, setVideoUrl] = useState(() => {
    const saved = localStorage.getItem('lastVideoUrl');
    return saved || '';
  });
  const [error, setError] = useState('');
  const [hasValidVideo, setHasValidVideo] = useState(() => {
    return !!localStorage.getItem('lastVideoUrl');
  });

  const extractVideoId = useCallback((input) => {
    // Try to extract from URL first
    const urlRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const urlMatch = input.match(urlRegExp);
    if (urlMatch && urlMatch[2].length === 11) {
      return urlMatch[2];
    }
    
    // If not a URL, check if it's a direct video ID (11 characters)
    const idRegExp = /^[a-zA-Z0-9_-]{11}$/;
    if (idRegExp.test(input.trim())) {
      return input.trim();
    }
    
    return null;
  }, []);

  // Load saved video on component mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('lastVideoUrl');
    if (savedUrl) {
      const videoId = extractVideoId(savedUrl);
      if (videoId) {
        onVideoChange(videoId);
      }
    }
  }, [onVideoChange, extractVideoId]);

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }

    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      onVideoChange(videoId);
      setError('');
      setHasValidVideo(true);
      localStorage.setItem('lastVideoUrl', videoUrl);
    } else {
      setError('URL o ID YouTube non valido. Inserisci un URL completo o un ID video di 11 caratteri.');
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Inserisci un URL YouTube o un ID video di 11 caratteri
      </Typography>
      
      <Stack
        component="form"
        onSubmit={handleSubmit}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={1}
      >
        <TextField
          fullWidth
          label="YouTube URL o ID Video"
          variant="outlined"
          value={videoUrl}
          onChange={(e) => {
            setVideoUrl(e.target.value);
            if (error) setError('');
          }}
          error={!!error}
          helperText={error}
          placeholder="https://www.youtube.com/watch?v=... o ID video"
          sx={{ minWidth: 240 }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<YouTubeIcon />}
          sx={{ 
            minWidth: 120,
            alignSelf: { xs: 'center', sm: 'auto' }
          }}
        >
          Carica
        </Button>
      </Stack>
      
      {!hasValidVideo && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Esempi di URL validi:
          </Typography>
          <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 2 }}>
            <Typography variant="caption" component="li" color="text.secondary">
              https://www.youtube.com/watch?v=dQw4w9WgXcQ
            </Typography>
            <Typography variant="caption" component="li" color="text.secondary">
              https://youtu.be/dQw4w9WgXcQ
            </Typography>
            <Typography variant="caption" component="li" color="text.secondary">
              dQw4w9WgXcQ (solo ID video)
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default YouTubePlayer;
