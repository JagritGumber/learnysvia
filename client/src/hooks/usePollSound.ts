import { useCallback, useRef } from "react";

export function usePollSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playChingSound = useCallback(() => {
    try {
      // Create audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Resume context if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      // Create a pleasant "ching" sound using Web Audio API
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configure the sound (pleasant chime)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Start frequency
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1); // End frequency

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1); // Fade out

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);

    } catch (error) {
      console.warn('Could not play poll notification sound:', error);
    }
  }, []);

  return { playChingSound };
}
