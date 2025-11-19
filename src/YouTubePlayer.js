import React, { useState } from 'react';
import {
  TextField,
  Box,
  Button,
  Typography
} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';

const YouTubePlayer = ({ onVideoChange }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }

    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      onVideoChange(videoId);
      setError('');
    } else {
      setError('URL o ID YouTube non valido. Inserisci un URL completo o un ID video di 11 caratteri.');
    }
  };

  const extractVideoId = (input) => {
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
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Inserisci un URL YouTube o un ID video di 11 caratteri
      </Typography>
      
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
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
          sx={{ flex: 1, minWidth: 240 }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<YouTubeIcon />}
          sx={{ minWidth: 120 }}
        >
          Carica
        </Button>
      </Box>
      
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
    </Box>
  );
};

export default YouTubePlayer;
