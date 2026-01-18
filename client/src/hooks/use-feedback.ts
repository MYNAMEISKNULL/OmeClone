
export function useFeedback() {
  const playSound = (type: 'click' | 'success' | 'message' | 'pop') => {
    // Basic beep sounds using Web Audio API to avoid external assets initially
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      switch (type) {
        case 'click':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(440, now);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;
        case 'success':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(523.25, now);
          oscillator.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
          oscillator.start(now);
          oscillator.stop(now + 0.2);
          break;
        case 'message':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(880, now);
          gainNode.gain.setValueAtTime(0.05, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          oscillator.start(now);
          oscillator.stop(now + 0.15);
          break;
        case 'pop':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(200, now);
          oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.05);
          gainNode.gain.setValueAtTime(0.1, now);
          gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          oscillator.start(now);
          oscillator.stop(now + 0.1);
          break;
      }
    } catch (e) {
      console.error('Audio feedback failed', e);
    }
  };

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      switch (type) {
        case 'light':
          window.navigator.vibrate(10);
          break;
        case 'medium':
          window.navigator.vibrate(20);
          break;
        case 'heavy':
          window.navigator.vibrate(50);
          break;
      }
    }
  };

  return { playSound, triggerHaptic };
}
