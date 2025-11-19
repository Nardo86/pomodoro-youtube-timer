import React, { useState } from 'react';
import {
  TextField,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Typography,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import YouTubeIcon from '@mui/icons-material/YouTube';

const YouTubePlayer = ({ onVideoChange }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const apiKey = process.env.REACT_APP_YT_API_KEY;

  const handleSubmit = (event) => {
    if (event) {
      event.preventDefault();
    }

    if (!videoUrl.trim()) {
      openSearch();
      return;
    }

    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      onVideoChange(videoId);
    }
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleSearchIconClick = () => {
    handleSubmit();
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    setSearchError('');
    setSearchResults([]);
    setSearchQuery('');
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSearchError('');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (!apiKey) {
      setSearchError('Per usare la ricerca imposta la variabile REACT_APP_YT_API_KEY.');
      return;
    }

    try {
      setIsSearching(true);
      setSearchError('');
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=8&q=${encodeURIComponent(searchQuery)}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Impossibile completare la ricerca.');
      }

      setSearchResults(data.items || []);
    } catch (error) {
      setSearchError(error.message || 'Errore durante la ricerca.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (video) => {
    const videoId = video?.id?.videoId;
    if (videoId) {
      onVideoChange(videoId);
      setVideoUrl(`https://www.youtube.com/watch?v=${videoId}`);
      closeSearch();
    }
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
      >
        <TextField
          fullWidth
          label="YouTube Video URL"
          variant="outlined"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          sx={{ flex: 1, minWidth: 240 }}
        />
        <IconButton type="button" color="primary" aria-label="search" onClick={handleSearchIconClick}>
          <SearchIcon />
        </IconButton>
        <Button
          type="button"
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={openSearch}
          sx={{ ml: { xs: 0, sm: 1 } }}
        >
          Cerca video
        </Button>
      </Box>

      <Dialog open={isSearchOpen} onClose={closeSearch} fullWidth maxWidth="sm">
        <DialogTitle>Ricerca su YouTube</DialogTitle>
        <DialogContent dividers>
          {!apiKey && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Per abilitare la ricerca, crea un'API key YouTube Data e impostala in REACT_APP_YT_API_KEY.
            </Alert>
          )}
          {searchError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {searchError}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Cerca un video"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="es. Pomodoro focus"
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
            >
              Cerca
            </Button>
          </Box>

          {isSearching && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!isSearching && searchResults.length > 0 && (
            <List dense>
              {searchResults.map((video) => {
                const key = video.id?.videoId || video.etag;
                return (
                  <ListItemButton key={key} onClick={() => handleResultClick(video)}>
                    <ListItemAvatar>
                      {video.snippet?.thumbnails?.medium?.url ? (
                        <Avatar
                          variant="rounded"
                          src={video.snippet.thumbnails.medium.url}
                          alt={video.snippet.title}
                          sx={{ width: 72, height: 40, mr: 2 }}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 72, height: 40, mr: 2 }}>
                          <YouTubeIcon />
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={video.snippet?.title}
                      secondary={video.snippet?.channelTitle}
                      primaryTypographyProps={{ noWrap: true }}
                      secondaryTypographyProps={{ noWrap: true }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          )}

          {!isSearching && searchResults.length === 0 && searchQuery.trim() && !searchError && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
              Nessun risultato. Prova con un'altra parola chiave.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSearch}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default YouTubePlayer;
