import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for playing a bell sound using Web Audio API.
 * Handles AudioContext creation, beep generation, and cleanup.
 */
const useBellSound = () => {
  const audioContextRef = useRef(null);

  // Initialize AudioContext lazily
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a beep sound
  const play = useCallback(() => {
    // Skip in test environment
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    try {
      const audioContext = getAudioContext();
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.frequency.value = 800;
      osc.type = 'sine';

      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Could not play bell sound:', error);
    }
  }, [getAudioContext]);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const audioRef = { play };

  return audioRef;
};

export default useBellSound;
