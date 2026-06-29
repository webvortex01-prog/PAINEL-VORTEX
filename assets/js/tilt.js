class CardTilt {
  constructor() {
    this.cards = document.querySelectorAll('.portfolio-card');
    this.maxAngle = 12; // Maximum tilt angle in degrees
    this.init();
  }
  
  init() {
    this.cards.forEach(card => {
      // Create glare overlay dynamically if not exists
      let glare = card.querySelector('.card-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.classList.add('card-glare');
        card.appendChild(glare);
      }
      
      card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card, glare));
      card.addEventListener('mouseleave', () => this.handleMouseLeave(card, glare));
    });
  }
  
  handleMouseMove(e, card, glare) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize coordinates between -0.5 and 0.5
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;
    
    // Calculate rotation angles
    const rotateX = (py * -this.maxAngle).toFixed(2);
    const rotateY = (px * this.maxAngle).toFixed(2);
    
    // Apply 3D rotation and scale
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    // Update glare position
    glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.12) 0%, transparent 60%)`;
  }
  
  handleMouseLeave(card, glare) {
    // Smooth reset
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)';
    
    // Remove inline transition after it runs to avoid lagging mousemove
    setTimeout(() => {
      card.style.transition = '';
    }, 500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CardTilt();
});
