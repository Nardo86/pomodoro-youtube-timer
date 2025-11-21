import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip
} from '@mui/material';
import YouTubeIcon from '@mui/icons-material/YouTube';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
  incrementBookmarkViews,
  getBookmarkByVideoId,
  isBookmarkAtCapacity,
  exportBookmarksToCSV,
  importBookmarksFromCSV
} from './bookmarkUtils';

const YouTubePlayer = ({ onVideoChange }) => {
  const [videoUrl, setVideoUrl] = useState(() => {
    const saved = localStorage.getItem('lastVideoUrl');
    return saved || '';
  });
  const [error, setError] = useState('');
  const [hasValidVideo, setHasValidVideo] = useState(() => {
    return !!localStorage.getItem('lastVideoUrl');
  });
  const [currentVideoId, setCurrentVideoId] = useState('');
  
  // Bookmark states
  const [bookmarkPanelOpen, setBookmarkPanelOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [filterText, setFilterText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [addBookmarkDialogOpen, setAddBookmarkDialogOpen] = useState(false);
  const [deleteBookmarkDialogOpen, setDeleteBookmarkDialogOpen] = useState(false);
  const [bookmarkDescription, setBookmarkDescription] = useState('');
  const [bookmarkError, setBookmarkError] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importMode, setImportMode] = useState('merge');
  const [importError, setImportError] = useState('');
  const fileInputRef = React.useRef(null);

  // Load bookmarks on component mount
  useEffect(() => {
    loadBookmarks();
  }, []);

  // Update filtered bookmarks when filter text or bookmarks change
  useEffect(() => {
    const filtered = bookmarks
      .filter(bookmark => 
        bookmark.description.toLowerCase().includes(filterText.toLowerCase())
      )
      .sort((a, b) => b.views - a.views); // Sort by views descending
    setFilteredBookmarks(filtered);
  }, [bookmarks, filterText]);

  // Check if current video is bookmarked
  useEffect(() => {
    if (currentVideoId) {
      setIsBookmarked(!!getBookmarkByVideoId(currentVideoId));
    } else {
      setIsBookmarked(false);
    }
  }, [currentVideoId]);

  const loadBookmarks = () => {
    const bookmarkList = getBookmarks();
    setBookmarks(bookmarkList);
  };

  const handleAddBookmark = () => {
    setBookmarkError('');
    if (!bookmarkDescription.trim()) {
      setBookmarkError('La descrizione non può essere vuota');
      return;
    }
    
    if (bookmarkDescription.includes(';')) {
      setBookmarkError('La descrizione non può contenere il carattere punto e virgola (;)');
      return;
    }

    try {
      addBookmark(currentVideoId, bookmarkDescription.trim());
      setBookmarkDescription('');
      setAddBookmarkDialogOpen(false);
      loadBookmarks();
      setIsBookmarked(true);
    } catch (error) {
      setBookmarkError(error.message);
    }
  };

  const handleRemoveBookmark = () => {
    removeBookmark(currentVideoId);
    setDeleteBookmarkDialogOpen(false);
    loadBookmarks();
    setIsBookmarked(false);
  };

  const handleDeleteBookmarkFromList = (videoId) => {
    removeBookmark(videoId);
    loadBookmarks();
  };

  const handleLoadBookmark = (videoId) => {
    incrementBookmarkViews(videoId);
    loadBookmarks();
    setBookmarkPanelOpen(false);
    
    // Update the video URL and trigger load
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    setVideoUrl(videoUrl);
    setHasValidVideo(true);
    localStorage.setItem('lastVideoUrl', videoUrl);
    onVideoChange(videoId);
    setCurrentVideoId(videoId);
  };

  const handleExportBookmarks = () => {
    try {
      const csvContent = exportBookmarksToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'pomodoro-bookmarks-export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleImportBookmarks = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        importBookmarksFromCSV(e.target.result, importMode);
        loadBookmarks();
        setImportDialogOpen(false);
        setImportError('');
      } catch (error) {
        setImportError(error.message);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
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
        setCurrentVideoId(videoId);
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
      setCurrentVideoId(videoId);
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton
                  onClick={() => setBookmarkPanelOpen(!bookmarkPanelOpen)}
                  aria-label="Segnalibri"
                  size="small"
                >
                  {bookmarkPanelOpen ? <CloseIcon /> : <BookmarkIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
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
        
        {currentVideoId && (
          <Tooltip title={isBookmarked ? "Rimuovi segnalibro" : "Aggiungi segnalibro"}>
            <IconButton
              onClick={() => {
                if (isBookmarked) {
                  setDeleteBookmarkDialogOpen(true);
                } else {
                  setAddBookmarkDialogOpen(true);
                }
              }}
              color={isBookmarked ? 'primary' : 'default'}
              sx={{ 
                alignSelf: { xs: 'center', sm: 'auto' }
              }}
            >
              {isBookmarked ? <StarIcon /> : <StarIcon />}
            </IconButton>
          </Tooltip>
        )}
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

      {/* Bookmark Panel */}
      <Drawer
        anchor="bottom"
        open={bookmarkPanelOpen}
        onClose={() => setBookmarkPanelOpen(false)}
        PaperProps={{
          sx: {
            height: '50vh',
            maxHeight: '50vh',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }
        }}
      >
        <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Segnalibri</Typography>
            <Box>
              <IconButton onClick={handleExportBookmarks}>
                <FileDownloadIcon />
              </IconButton>
              <IconButton onClick={() => setImportDialogOpen(true)}>
                <FileUploadIcon />
              </IconButton>
              <IconButton onClick={() => setBookmarkPanelOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          
          {/* Capacity Warning */}
          {(() => {
            const capacity = isBookmarkAtCapacity();
            if (capacity.isNearLimit) {
              return (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {capacity.isAtLimit 
                    ? 'Hai raggiunto il limite massimo di segnalibri'
                    : `Stai per raggiungere il limite di segnalibri (${capacity.current}/${capacity.max})`
                  }
                </Alert>
              );
            }
            return null;
          })()}
          
          {/* Filter */}
          <TextField
            fullWidth
            placeholder="Filtra segnalibri..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          {/* Bookmark List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List dense>
              {filteredBookmarks.map((bookmark) => (
                <ListItem key={bookmark.id} divider>
                  <ListItemText
                    primary={bookmark.description}
                    secondary={`Visualizzazioni: ${bookmark.views}`}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleLoadBookmark(bookmark.id)}
                      >
                        Carica
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteBookmarkFromList(bookmark.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {filteredBookmarks.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    {filterText ? 'Nessun segnalibro trovato' : 'Nessun segnalibro salvato'}
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
        </Box>
      </Drawer>

      {/* Add Bookmark Dialog */}
      <Dialog open={addBookmarkDialogOpen} onClose={() => setAddBookmarkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Aggiungi Segnalibro</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Descrizione"
            value={bookmarkDescription}
            onChange={(e) => setBookmarkDescription(e.target.value)}
            error={!!bookmarkError}
            helperText={bookmarkError || 'Massimo 200 caratteri, non è consentito il carattere ;'}
            inputProps={{ maxLength: 200 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBookmarkDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleAddBookmark} variant="contained">Salva</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Bookmark Dialog */}
      <Dialog open={deleteBookmarkDialogOpen} onClose={() => setDeleteBookmarkDialogOpen(false)}>
        <DialogTitle>Rimuovi Segnalibro</DialogTitle>
        <DialogContent>
          <Typography>Sei sicuro di voler rimuovere questo segnalibro?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteBookmarkDialogOpen(false)}>Annulla</Button>
          <Button onClick={handleRemoveBookmark} color="error" variant="contained">Rimuovi</Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Importa Segnalibri da CSV</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Seleziona un file CSV con le colonne: IDVideo, Description, Views
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Modalità di importazione:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant={importMode === 'merge' ? 'contained' : 'outlined'}
                onClick={() => setImportMode('merge')}
              >
                Unisci (aggiungi nuovi, aggiorna esistenti)
              </Button>
              <Button
                variant={importMode === 'replace' ? 'contained' : 'outlined'}
                onClick={() => setImportMode('replace')}
              >
                Sostituisci (cancella tutto e importa)
              </Button>
            </Box>
          </Box>
          
          {importError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {importError}
            </Alert>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImportBookmarks}
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            fullWidth
            onClick={() => fileInputRef.current?.click()}
          >
            Scegli file CSV
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Annulla</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default YouTubePlayer;
