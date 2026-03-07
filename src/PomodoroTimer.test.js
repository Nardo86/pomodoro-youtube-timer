import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import PomodoroTimer from './PomodoroTimer';

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

// Mock Notification API
class MockNotification {
  static permission = 'granted';
  static requestPermission = jest.fn(() => Promise.resolve('granted'));
  
  constructor(title, options) {
    this.title = title;
    this.body = options?.body || '';
  }
}

Object.defineProperty(window, 'Notification', { value: MockNotification });

describe('PomodoroTimer', () => {
  let store = {};
  
  beforeEach(() => {
    store = {};
    localStorageMock.getItem.mockImplementation((key) => store[key] || null);
    localStorageMock.setItem.mockImplementation((key, value) => { store[key] = value; });
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Component Rendering', () => {
    test('renders timer with default values', () => {
      render(<PomodoroTimer />);
      
      expect(screen.getByText(/time to work/i)).toBeInTheDocument();
      expect(screen.getByText(/start/i)).toBeInTheDocument();
    });

    test('renders configuration accordion', () => {
      render(<PomodoroTimer />);
      
      expect(screen.getByText(/configurazione/i)).toBeInTheDocument();
    });

    test('renders all control buttons', () => {
      render(<PomodoroTimer />);
      
      expect(screen.getByLabelText(/reset timer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/skip session/i)).toBeInTheDocument();
    });
  });

  describe('Timer Start/Stop', () => {
    test('starts timer when clicking start button', () => {
      render(<PomodoroTimer />);
      
      const startButton = screen.getByText(/start/i);
      fireEvent.click(startButton);
      
      // Timer should be active now (pause button should appear)
      expect(screen.queryByLabelText(/pause timer/i)).toBeInTheDocument();
    });

    test('pauses timer when clicking pause button', () => {
      render(<PomodoroTimer />);
      
      // Start the timer first
      const startButton = screen.getByText(/start/i);
      fireEvent.click(startButton);
      
      // Now pause
      const pauseButton = screen.getByLabelText(/pause timer/i);
      fireEvent.click(pauseButton);
      
      // Start button should appear again
      expect(screen.getByText(/start/i)).toBeInTheDocument();
    });
  });

  describe('State Transitions', () => {
    test('calls onPhaseComplete when timer completes', () => {
      const mockOnWorkTimeChange = jest.fn();
      const mockOnTimerActiveChange = jest.fn();
      const mockOnPhaseComplete = jest.fn();
      
      render(
        <PomodoroTimer 
          onWorkTimeChange={mockOnWorkTimeChange}
          onTimerActiveChange={mockOnTimerActiveChange}
          onPhaseComplete={mockOnPhaseComplete}
        />
      );
      
      // Start the timer
      const startButton = screen.getByText(/start/i);
      fireEvent.click(startButton);
      
      // Fast forward to complete the timer (25 minutes)
      act(() => {
        jest.advanceTimersByTime(25 * 60 * 1000);
      });
      
      expect(mockOnPhaseComplete).toHaveBeenCalled();
    });
  });

  describe('Cycle Tracking', () => {
    test('renders cycle progress indicator', () => {
      render(<PomodoroTimer />);
      expect(screen.getByText(/cicli/i)).toBeInTheDocument();
    });
  });

  describe('Settings Application', () => {
    test('applies settings correctly', () => {
      render(<PomodoroTimer />);
      
      // Expand accordion
      const accordion = screen.getByText(/configurazione/i).closest('.MuiAccordion-root');
      fireEvent.click(accordion);
      
      // Change work duration
      const workInput = screen.getByLabelText(/work duration/i);
      fireEvent.change(workInput, { target: { value: '30' } });
      
      // Apply settings
      const applyButton = screen.getByText(/apply settings/i);
      fireEvent.click(applyButton);
      
      // Verify localStorage was called
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'pomodoroSettings',
        expect.stringContaining('30')
      );
    });

    test('does not apply settings when timer is active', () => {
      render(<PomodoroTimer />);
      
      // Start timer
      const startButton = screen.getByText(/start/i);
      fireEvent.click(startButton);
      
      // Expand accordion
      const accordion = screen.getByText(/configurazione/i).closest('.MuiAccordion-root');
      fireEvent.click(accordion);
      
      // Try to apply settings
      const applyButton = screen.getByText(/apply settings/i);
      expect(applyButton).toBeDisabled();
    });
  });

  describe('Reset and Skip', () => {
    test('resets timer to initial state', () => {
      const mockOnWorkTimeChange = jest.fn();
      const mockOnTimerActiveChange = jest.fn();
      
      render(
        <PomodoroTimer 
          onWorkTimeChange={mockOnWorkTimeChange}
          onTimerActiveChange={mockOnTimerActiveChange}
        />
      );
      
      // Start timer
      const startButton = screen.getByText(/start/i);
      fireEvent.click(startButton);
      
      // Reset
      const resetButton = screen.getByLabelText(/reset timer/i);
      fireEvent.click(resetButton);
      
      // Verify reset state
      expect(screen.getByText(/time to work/i)).toBeInTheDocument();
      expect(mockOnWorkTimeChange).toHaveBeenCalledWith(true);
      expect(mockOnTimerActiveChange).toHaveBeenCalledWith(false);
    });

    test('skips to next phase', () => {
      const mockOnWorkTimeChange = jest.fn();
      const mockOnTimerActiveChange = jest.fn();
      
      render(
        <PomodoroTimer 
          onWorkTimeChange={mockOnWorkTimeChange}
          onTimerActiveChange={mockOnTimerActiveChange}
        />
      );
      
      // Skip
      const skipButton = screen.getByLabelText(/skip session/i);
      fireEvent.click(skipButton);
      
      // Should now be in break phase
      expect(screen.getByText(/time to rest/i)).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    test('clamps work duration to valid range', () => {
      render(<PomodoroTimer />);
      
      // Expand accordion
      const accordion = screen.getByText(/configurazione/i).closest('.MuiAccordion-root');
      fireEvent.click(accordion);
      
      // Try to set invalid work duration (over max)
      const workInput = screen.getByLabelText(/work duration/i);
      fireEvent.change(workInput, { target: { value: '100' } });
      
      // Value should be clamped to 60
      expect(workInput.value).toBe('60');
    });

    test('clamps break duration to valid range', () => {
      render(<PomodoroTimer />);
      
      // Expand accordion
      const accordion = screen.getByText(/configurazione/i).closest('.MuiAccordion-root');
      fireEvent.click(accordion);
      
      // Try to set invalid break duration (over max)
      const breakInput = screen.getByLabelText(/break duration/i);
      fireEvent.change(breakInput, { target: { value: '100' } });
      
      // Value should be clamped to 30
      expect(breakInput.value).toBe('30');
    });
  });
});
