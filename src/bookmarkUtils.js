// Utility functions for bookmark management
const STORAGE_KEY = 'pomodoroBookmarks';
const MAX_BOOKMARKS = 1000;
const WARNING_THRESHOLD = 0.9;

// Storage guard for SSR/test environments
const isStorageAvailable = () => {
  return typeof window !== 'undefined' && window.localStorage;
};

export const getBookmarks = () => {
  if (!isStorageAvailable()) return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const bookmarks = stored ? JSON.parse(stored) : [];
    return Array.isArray(bookmarks) ? bookmarks : [];
  } catch (error) {
    console.error('Error loading bookmarks:', error);
    return [];
  }
};

export const saveBookmarks = (bookmarks) => {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    return true;
  } catch (error) {
    console.error('Error saving bookmarks:', error);
    return false;
  }
};

export const addBookmark = (videoId, description) => {
  if (!videoId || !description) {
    throw new Error('Video ID and description are required');
  }
  
  if (description.includes(';')) {
    throw new Error('Description cannot contain semicolon (;) character');
  }
  
  const bookmarks = getBookmarks();
  
  // Check if bookmark already exists
  const existingIndex = bookmarks.findIndex(b => b.id === videoId);
  if (existingIndex !== -1) {
    throw new Error('Bookmark already exists');
  }
  
  // Check capacity
  if (bookmarks.length >= MAX_BOOKMARKS) {
    throw new Error('Maximum bookmark limit reached');
  }
  
  const newBookmark = {
    id: videoId,
    description: description.trim(),
    views: 0
  };
  
  bookmarks.push(newBookmark);
  saveBookmarks(bookmarks);
  return newBookmark;
};

export const removeBookmark = (videoId) => {
  const bookmarks = getBookmarks();
  const filteredBookmarks = bookmarks.filter(b => b.id !== videoId);
  
  if (filteredBookmarks.length === bookmarks.length) {
    return false; // Bookmark not found
  }
  
  saveBookmarks(filteredBookmarks);
  return true;
};

export const incrementBookmarkViews = (videoId) => {
  const bookmarks = getBookmarks();
  const bookmark = bookmarks.find(b => b.id === videoId);
  
  if (bookmark) {
    bookmark.views++;
    saveBookmarks(bookmarks);
    return true;
  }
  
  return false;
};

export const getBookmarkByVideoId = (videoId) => {
  const bookmarks = getBookmarks();
  return bookmarks.find(b => b.id === videoId);
};

export const isBookmarkAtCapacity = () => {
  const bookmarks = getBookmarks();
  return {
    isNearLimit: bookmarks.length >= Math.floor(MAX_BOOKMARKS * WARNING_THRESHOLD),
    isAtLimit: bookmarks.length >= MAX_BOOKMARKS,
    current: bookmarks.length,
    max: MAX_BOOKMARKS
  };
};

export const exportBookmarksToCSV = () => {
  const bookmarks = getBookmarks();
  const headers = 'IDVideo;Description;Views\n';
  const rows = bookmarks
    .sort((a, b) => b.views - a.views) // Sort by views descending
    .map(bookmark => `${bookmark.id};${bookmark.description};${bookmark.views}`)
    .join('\n');
  
  return headers + rows;
};

export const importBookmarksFromCSV = (csvContent, mode = 'merge') => {
  const lines = csvContent.trim().split('\n');
  
  if (lines.length < 2) {
    throw new Error('CSV file must contain at least a header and one data row');
  }
  
  // Validate headers
  const headers = lines[0].split(';').map(h => h.trim());
  const expectedHeaders = ['IDVideo', 'Description', 'Views'];
  
  if (headers.length < 3 || 
      headers[0] !== expectedHeaders[0] || 
      headers[1] !== expectedHeaders[1] || 
      headers[2] !== expectedHeaders[2]) {
    throw new Error('Invalid CSV headers. Expected: IDVideo, Description, Views');
  }
  
  const importedBookmarks = [];
  let skippedRows = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(';');
    
    if (columns.length < 3) {
      skippedRows++;
      continue;
    }
    
    const videoId = columns[0].trim();
    const description = columns[1].trim();
    const views = parseInt(columns[2], 10) || 0;
    
    if (!videoId || !description) {
      skippedRows++;
      continue;
    }
    
    if (description.includes(';')) {
      skippedRows++;
      continue;
    }
    
    importedBookmarks.push({
      id: videoId,
      description,
      views
    });
  }
  
  let finalBookmarks;
  if (mode === 'replace') {
    finalBookmarks = importedBookmarks;
  } else {
    // Merge mode
    const existingBookmarks = getBookmarks();
    const existingMap = new Map(existingBookmarks.map(b => [b.id, b]));
    
    // Add or update bookmarks
    importedBookmarks.forEach(imported => {
      existingMap.set(imported.id, imported);
    });
    
    finalBookmarks = Array.from(existingMap.values());
  }
  
  // Check capacity
  if (finalBookmarks.length > MAX_BOOKMARKS) {
    throw new Error(`Import would exceed maximum bookmark limit (${MAX_BOOKMARKS})`);
  }
  
  saveBookmarks(finalBookmarks);
  
  return {
    imported: importedBookmarks.length,
    skipped: skippedRows,
    total: finalBookmarks.length
  };
};