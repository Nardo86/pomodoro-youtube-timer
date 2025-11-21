import { getBookmarks, addBookmark, removeBookmark, incrementBookmarkViews, exportBookmarksToCSV, importBookmarksFromCSV } from './bookmarkUtils';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock window object
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('bookmarkUtils', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  describe('getBookmarks', () => {
    it('should return empty array when no bookmarks exist', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(getBookmarks()).toEqual([]);
    });

    it('should return parsed bookmarks when they exist', () => {
      const mockBookmarks = [{ id: 'test123', description: 'Test Video', views: 5 }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
      expect(getBookmarks()).toEqual(mockBookmarks);
    });

    it('should return empty array for invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      expect(getBookmarks()).toEqual([]);
    });
  });

  describe('addBookmark', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue('[]');
    });

    it('should add a new bookmark successfully', () => {
      const bookmark = addBookmark('test123', 'Test Video');
      expect(bookmark).toEqual({
        id: 'test123',
        description: 'Test Video',
        views: 0
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pomodoroBookmarks',
        expect.stringContaining('test123')
      );
    });

    it('should throw error for missing video ID', () => {
      expect(() => addBookmark('', 'Test Video')).toThrow('Video ID and description are required');
    });

    it('should throw error for missing description', () => {
      expect(() => addBookmark('test123', '')).toThrow('Video ID and description are required');
    });

    it('should throw error for semicolon in description', () => {
      expect(() => addBookmark('test123', 'Test; Video')).toThrow('Description cannot contain semicolon (;) character');
    });
  });

  describe('removeBookmark', () => {
    it('should remove existing bookmark', () => {
      const mockBookmarks = [
        { id: 'test123', description: 'Test Video', views: 5 },
        { id: 'test456', description: 'Another Video', views: 3 }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
      
      const result = removeBookmark('test123');
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pomodoroBookmarks',
        expect.stringContaining('test456')
      );
    });

    it('should return false for non-existing bookmark', () => {
      const mockBookmarks = [{ id: 'test123', description: 'Test Video', views: 5 }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
      
      const result = removeBookmark('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('incrementBookmarkViews', () => {
    it('should increment views for existing bookmark', () => {
      const mockBookmarks = [{ id: 'test123', description: 'Test Video', views: 5 }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
      
      const result = incrementBookmarkViews('test123');
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pomodoroBookmarks',
        expect.stringContaining('"views":6')
      );
    });

    it('should return false for non-existing bookmark', () => {
      const mockBookmarks = [{ id: 'test123', description: 'Test Video', views: 5 }];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
      
      const result = incrementBookmarkViews('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('exportBookmarksToCSV', () => {
    it('should export bookmarks to CSV format', () => {
      const mockBookmarks = [
        { id: 'test123', description: 'Test Video', views: 5 },
        { id: 'test456', description: 'Another Video', views: 3 }
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockBookmarks));
      
      const csv = exportBookmarksToCSV();
      expect(csv).toContain('IDVideo;Description;Views');
      expect(csv).toContain('test456;Another Video;3');
      expect(csv).toContain('test123;Test Video;5');
      // Should be sorted by views descending
      expect(csv.indexOf('test123')).toBeLessThan(csv.indexOf('test456'));
    });
  });

  describe('importBookmarksFromCSV', () => {
    it('should import valid CSV in merge mode', () => {
      const csvContent = 'IDVideo;Description;Views\ntest123;Test Video;5\ntest456;Another Video;3';
      localStorageMock.getItem.mockReturnValue('[]');
      
      const result = importBookmarksFromCSV(csvContent, 'merge');
      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(0);
      expect(result.total).toBe(2);
    });

    it('should throw error for invalid headers', () => {
      const csvContent = 'WrongHeader;Description;Views\ntest123;Test Video;5';
      
      expect(() => importBookmarksFromCSV(csvContent, 'merge')).toThrow('Invalid CSV headers');
    });

    it('should skip invalid rows', () => {
      const csvContent = 'IDVideo;Description;Views\ntest123;Test Video;5\ninvalid;row\ntest456;Another Video;3';
      localStorageMock.getItem.mockReturnValue('[]');
      
      const result = importBookmarksFromCSV(csvContent, 'merge');
      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(1);
    });
  });
});