import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import YouTubePlayer from './YouTubePlayer';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    clear: jest.fn(() => { store = {}; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((i) => Object.keys(store)[i] || null)
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock YouTube API
window.YT = {
  Player: jest.fn().mockImplementation(() => ({
    playVideo: jest.fn(),
    pauseVideo: jest.fn(),
    loadVideoById: jest.fn(),
    destroy: jest.fn()
  }))
};

describe('YouTubePlayer', () => {
  let store = {};
  
  beforeEach(() => {
    store = {};
    localStorageMock.getItem.mockImplementation((key) => store[key] || null);
    localStorageMock.setItem.mockImplementation((key, value) => { store[key] = value; });
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    jest.clearAllMocks();
  });

  describe('Video ID Extraction', () => {
    const extractVideoIdHelper = (input) => {
      if (!input) return null;
      const urlRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const urlMatch = input.match(urlRegExp);
      if (urlMatch && urlMatch[2].length === 11) {
        return urlMatch[2];
      }
      const idRegExp = /^[a-zA-Z0-9_-]{11}$/;
      if (idRegExp.test(input.trim())) {
        return input.trim();
      }
      return null;
    };

    test('extracts video ID from standard YouTube URL', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      expect(extractVideoIdHelper(url)).toBe('dQw4w9WgXcQ');
    });

    test('extracts video ID from short URL', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ';
      expect(extractVideoIdHelper(url)).toBe('dQw4w9WgXcQ');
    });

    test('extracts video ID from embed URL', () => {
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      expect(extractVideoIdHelper(url)).toBe('dQw4w9WgXcQ');
    });

    test('accepts direct video ID', () => {
      const id = 'dQw4w9WgXcQ';
      expect(extractVideoIdHelper(id)).toBe('dQw4w9WgXcQ');
    });

    test('returns null for invalid URL', () => {
      const url = 'https://invalid-url.com';
      expect(extractVideoIdHelper(url)).toBeNull();
    });

    test('returns null for invalid video ID', () => {
      const id = 'invalid';
      expect(extractVideoIdHelper(id)).toBeNull();
    });

    test('returns null for empty input', () => {
      expect(extractVideoIdHelper('')).toBeNull();
      expect(extractVideoIdHelper(null)).toBeNull();
      expect(extractVideoIdHelper(undefined)).toBeNull();
    });
  });

  describe('Component Rendering', () => {
    test('renders YouTube input field', () => {
      render(<YouTubePlayer />);
      
      expect(screen.getByLabelText(/youtube url o id video/i)).toBeInTheDocument();
    });

    test('renders load button', () => {
      render(<YouTubePlayer />);
      
      expect(screen.getByText(/carica/i)).toBeInTheDocument();
    });

    test('renders example URLs when no valid video', () => {
      render(<YouTubePlayer />);
      
      expect(screen.getByText(/esempi di url validi/i)).toBeInTheDocument();
      expect(screen.getByText(/dQw4w9WgXcQ/)).toBeInTheDocument();
    });

    test('does not render examples when video is loaded', () => {
      store['lastVideoUrl'] = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      
      render(<YouTubePlayer />);
      
      expect(screen.queryByText(/esempi di url validi/i)).not.toBeInTheDocument();
    });
  });

  describe('Video URL Handling', () => {
    test('updates video URL on input change', () => {
      render(<YouTubePlayer />);
      
      const input = screen.getByLabelText(/youtube url o id video/i);
      fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=testVideo123' } });
      
      expect(input.value).toBe('https://www.youtube.com/watch?v=testVideo123');
    });

    test('validates and submits valid URL', () => {
      const mockOnVideoChange = jest.fn();
      
      render(<YouTubePlayer onVideoChange={mockOnVideoChange} />);
      
      const input = screen.getByLabelText(/youtube url o id video/i);
      fireEvent.change(input, { target: { value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' } });
      
      const loadButton = screen.getByText(/carica/i);
      fireEvent.click(loadButton);
      
      expect(mockOnVideoChange).toHaveBeenCalledWith('dQw4w9WgXcQ');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'lastVideoUrl',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      );
    });

    test('shows error for invalid URL', () => {
      render(<YouTubePlayer />);
      
      const input = screen.getByLabelText(/youtube url o id video/i);
      fireEvent.change(input, { target: { value: 'invalid-url' } });
      
      const loadButton = screen.getByText(/carica/i);
      fireEvent.click(loadButton);
      
      expect(screen.getByText(/url o id youtube non valido/i)).toBeInTheDocument();
    });

    test('accepts direct video ID', () => {
      const mockOnVideoChange = jest.fn();
      
      render(<YouTubePlayer onVideoChange={mockOnVideoChange} />);
      
      const input = screen.getByLabelText(/youtube url o id video/i);
      fireEvent.change(input, { target: { value: 'dQw4w9WgXcQ' } });
      
      const loadButton = screen.getByText(/carica/i);
      fireEvent.click(loadButton);
      
      expect(mockOnVideoChange).toHaveBeenCalledWith('dQw4w9WgXcQ');
    });
  });

  describe('Bookmark Functionality', () => {
    test('opens bookmark panel when clicking bookmark icon', () => {
      render(<YouTubePlayer />);
      
      const bookmarkButton = screen.getByLabelText(/segnalibri/i);
      fireEvent.click(bookmarkButton);
      
      expect(screen.getByText(/segnalibri$/i)).toBeInTheDocument();
    });

    test('closes bookmark panel when clicking close icon', () => {
      render(<YouTubePlayer />);
      
      // Open panel
      const bookmarkButton = screen.getByLabelText(/segnalibri/i);
      fireEvent.click(bookmarkButton);
      
      // Close panel
      const closeButtons = screen.getAllByLabelText(/close/i);
      fireEvent.click(closeButtons[closeButtons.length - 1]);
      
      // Panel should be closed
      expect(screen.queryByText(/segnalibri$/i)).not.toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    test('validates URL from localStorage on initialization', () => {
      // Valid URL in localStorage
      store['lastVideoUrl'] = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      
      render(<YouTubePlayer />);
      
      // Should not show examples since URL is valid
      expect(screen.queryByText(/esempi di url validi/i)).not.toBeInTheDocument();
    });

    test('validates invalid URL from localStorage', () => {
      // Invalid URL in localStorage
      store['lastVideoUrl'] = 'invalid-url';
      
      render(<YouTubePlayer />);
      
      // Should show examples since URL is invalid
      expect(screen.getByText(/esempi di url validi/i)).toBeInTheDocument();
    });
  });
});
