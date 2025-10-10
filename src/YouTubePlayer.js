import React, { useState } from 'react';
import { TextField, Button, Box, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const YouTubePlayer = ({ onVideoChange }) => {
  const [videoUrl, setVideoUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      onVideoChange(videoId);
    }
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
      <TextField
        fullWidth
        label="YouTube Video URL"
        variant="outlined"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        sx={{ mr: 1 }}
      />
      <IconButton type="submit" color="primary" aria-label="search">
        <SearchIcon />
      </IconButton>
    </Box>
  );
};

export default YouTubePlayer;