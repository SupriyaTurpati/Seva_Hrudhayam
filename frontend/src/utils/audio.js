export const playAlertSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const audioCtx = new AudioContext();
    
    const playTone = (frequency, startTime, duration) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, startTime);
      
      gainNode.gain.setValueAtTime(0.4, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };
    
    const now = audioCtx.currentTime;
    // Dual high-pitch alert chime
    playTone(659.25, now, 0.25); // E5
    playTone(880.00, now + 0.12, 0.45); // A5
  } catch (error) {
    console.error('Failed to play alert sound:', error);
  }
};
