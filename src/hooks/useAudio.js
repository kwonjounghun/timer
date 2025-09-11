import { useEffect, useRef } from 'react';

export const useAudio = () => {
  const audioRef = useRef(null);

  useEffect(() => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const createBeep = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };
    
    audioRef.current = createBeep;
  }, []);

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current();
    }
  };

  return { playNotification };
};
