class 01 WEBCanvas {
  constructor() {
    this.canvas = document.getElementById('01 WEB-canvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.bind ? this.canvas.getContext('2d') : this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    this.scrollSpeed = 0;
    this.lastScrollY = window.scrollY;
    
    this.init();
    this.animate();
    this.setupEvents();
  }
  
  init() {
    this.resizeCanvas();
    this.createParticles();
  }
  
  resizeCanvas() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }
  
  createParticles() {
    this.particles = [];
    // Calculate density based on screen size
    const particleCount = Math.floor((this.width * this.height) / 9000);
    const limit = Math.min(particleCount, 150); // Cap to preserve performance
    
    for (let i = 0; i < limit; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        // Base distance from center
        angle: Math.random() * Math.PI * 2,
        speed: 0.1 + Math.random() * 0.4,
        radius: 1 + Math.random() * 2,
        color: Math.random() > 0.4 ? 'rgba(0, 242, 254, 0.4)' : 'rgba(127, 0, 255, 0.4)',
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5
      });
    }
  }
  
  setupEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createParticles();
    });
    
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
    
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      this.scrollSpeed = (currentScrollY - this.lastScrollY) * 0.2;
      this.lastScrollY = currentScrollY;
    });
  }
  
  animate() {
    // Subtle overlay clear for trail effect
    this.ctx.fillStyle = 'rgba(3, 3, 8, 0.12)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Gradual decay of scroll speed boost
    this.scrollSpeed *= 0.95;
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      // 1. Move particles
      p.x += p.vx + (p.vx * Math.abs(this.scrollSpeed));
      p.y += p.vy + p.speed + this.scrollSpeed;
      
      // Rotate around center slightly for 01 WEB feel
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Apply subtle rotary force
      const force = 0.00005;
      p.vx += -dy * force;
      p.vy += dx * force;
      
      // 2. Mouse interactions
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const mdx = p.x - this.mouse.x;
        const mdy = p.y - this.mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        
        if (mdist < this.mouse.radius) {
          // Push particles away (repel)
          const pushForce = (this.mouse.radius - mdist) / this.mouse.radius;
          p.x += (mdx / mdist) * pushForce * 3;
          p.y += (mdy / mdist) * pushForce * 3;
        }
      }
      
      // 3. Screen bounds bounce
      if (p.x < 0) { p.x = this.width; }
      else if (p.x > this.width) { p.x = 0; }
      
      if (p.y < 0) { p.y = this.height; }
      else if (p.y > this.height) { p.y = 0; }
      
      // 4. Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      
      // 5. Connect close particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const cdx = p.x - p2.x;
        const cdy = p.y - p2.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        
        if (cdist < 100) {
          const alpha = (100 - cdist) / 100 * 0.15;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
    
    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new 01 WEBCanvas();
});
