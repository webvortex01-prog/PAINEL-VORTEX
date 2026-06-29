class MagneticCursor {
  constructor() {
    this.dot = document.querySelector('.custom-cursor');
    this.follower = document.querySelector('.custom-cursor-follower');
    
    if (!this.dot || !this.follower) return;
    
    // Only activate on fine pointer devices (desktops)
    const isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop) {
      this.dot.style.display = 'none';
      this.follower.style.display = 'none';
      return;
    }
    
    document.body.classList.add('custom-cursor-active');
    
    this.mouse = { x: 0, y: 0 };
    this.dotPos = { x: 0, y: 0 };
    this.followerPos = { x: 0, y: 0 };
    
    this.isHovered = false;
    this.magneticTarget = null;
    
    this.setupEvents();
    this.animate();
  }
  
  setupEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    
    // Select all interactive targets
    const targets = document.querySelectorAll('a, button, .btn, .portfolio-card, .calc-option-btn, .calc-check-item, .filter-btn, .audio-toggle');
    
    targets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.isHovered = true;
        this.dot.classList.add('hovered');
        this.follower.classList.add('hovered');
        
        // Add magnetic target check
        if (el.classList.contains('btn-primary') || el.classList.contains('audio-toggle') || el.classList.contains('logo') || el.classList.contains('filter-btn')) {
          this.magneticTarget = el;
          this.follower.classList.add('magnetic');
        }
      });
      
      el.addEventListener('mouseleave', () => {
        this.isHovered = false;
        this.dot.classList.remove('hovered');
        this.follower.classList.remove('hovered');
        
        if (this.magneticTarget) {
          this.magneticTarget.style.transform = 'translate3d(0, 0, 0)';
          this.magneticTarget = null;
          this.follower.classList.remove('magnetic');
        }
      });
    });
  }
  
  animate() {
    // 1. Lerp dot position
    this.dotPos.x += (this.mouse.x - this.dotPos.x) * 0.3;
    this.dotPos.y += (this.mouse.y - this.dotPos.y) * 0.3;
    this.dot.style.transform = `translate3d(${this.dotPos.x}px, ${this.dotPos.y}px, 0)`;
    
    // 2. Lerp follower position
    if (this.magneticTarget) {
      // Magnetic pull: slide follower to center of target + slightly towards mouse
      const rect = this.magneticTarget.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      
      // Pull follower towards target center
      this.followerPos.x += (targetX - this.followerPos.x) * 0.25;
      this.followerPos.y += (targetY - this.followerPos.y) * 0.25;
      
      // Pull actual target slightly towards mouse (magnetic push/pull effect)
      const pullX = (this.mouse.x - targetX) * 0.25;
      const pullY = (this.mouse.y - targetY) * 0.25;
      this.magneticTarget.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
    } else {
      // Normal lag behavior
      this.followerPos.x += (this.mouse.x - this.followerPos.x) * 0.15;
      this.followerPos.y += (this.mouse.y - this.followerPos.y) * 0.15;
    }
    
    this.follower.style.transform = `translate3d(${this.followerPos.x}px, ${this.followerPos.y}px, 0)`;
    
    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MagneticCursor();
});
