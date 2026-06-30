class Web01Synth {
  constructor() {
    this.toggleBtn = document.getElementById('audio-toggle-btn');
    if (!this.toggleBtn) return;
    
    this.audioContext = null;
    this.isEnabled = false;
    
    this.setupEvents();
  }
  
  init() {
    if (this.audioContext) return;
    
    // Create audio context
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass();
  }
  
  setupEvents() {
    this.toggleBtn.addEventListener('click', () => {
      this.init();
      
      this.isEnabled = !this.isEnabled;
      
      if (this.isEnabled) {
        // Resume context in case browser suspended it
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }
        document.body.classList.add('audio-active');
        this.playChime(); // Play welcome chime
      } else {
        document.body.classList.remove('audio-active');
      }
    });
    
    // Bind sounds to interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .portfolio-card, .calc-option-btn, .calc-check-item, .filter-btn');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => this.playHoverSound());
      el.addEventListener('click', () => this.playClickSound());
    });
  }
  
  playHoverSound() {
    if (!this.isEnabled || !this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Very quick, soft high-pitch blip
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.012, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.06);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.06);
  }
  
  playClickSound() {
    if (!this.isEnabled || !this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Clean digital click/pop
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(250, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.09);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.09);
  }
  
  playChime() {
    // Welcome sweep: futuristic rising chord
    const now = this.audioContext.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord
    
    notes.forEach((freq, idx) => {
      const osc = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gainNode.gain.setValueAtTime(0.0, now + idx * 0.08);
      gainNode.gain.linearRampToValueAtTime(0.02, now + idx * 0.08 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }
  
  playSuccessSound() {
    if (!this.isEnabled || !this.audioContext) return;
    
    // Nice double ascending positive chirp
    const now = this.audioContext.currentTime;
    const freqs = [440, 554.37, 659.25, 880];
    
    freqs.forEach((freq, index) => {
      const osc = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      osc.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.07);
      
      gainNode.gain.setValueAtTime(0, now + index * 0.07);
      gainNode.gain.linearRampToValueAtTime(0.03, now + index * 0.07 + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.07 + 0.35);
      
      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.35);
    });
  }
}

// Global hook for other files to access
window.Web01Synth = null;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize and attach to global scope
  window.Web01Synth = new Web01Synth();
});
