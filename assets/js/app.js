class Web01App {
  constructor() {
    this.header = document.querySelector('header');
    this.menuToggle = document.getElementById('menu-toggle');
    this.navLinks = document.getElementById('nav-links');
    this.revealElements = document.querySelectorAll('.reveal');
    this.filterBtns = document.querySelectorAll('.filter-btn');
    this.projectCards = document.querySelectorAll('.portfolio-card');
    
    // Modal Elements
    this.modal = document.getElementById('project-modal');
    this.modalClose = document.getElementById('modal-close');
    
    // Form Elements
    this.contactForm = document.getElementById('contact-form');
    this.successMsg = document.getElementById('success-message');
    
    // Testimonial Carousel
    this.carouselTrack = document.querySelector('.carousel-track');
    
    this.init();
  }
  
  init() {
    // 1. Header scroll logic
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
    });
    
    // 2. Mobile Menu Toggle
    if (this.menuToggle && this.navLinks) {
      this.menuToggle.addEventListener('click', () => {
        this.menuToggle.classList.toggle('open');
        this.navLinks.classList.toggle('open');
      });
      
      // Close menu when links are clicked
      this.navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          this.menuToggle.classList.remove('open');
          this.navLinks.classList.remove('open');
        });
      });
    }
    
    // 3. Scroll Reveal (Intersection Observer)
    this.setupScrollReveal();
    
    // 4. Portfolio Filters
    this.setupPortfolioFilters();
    
    // 5. Portfolio Modal
    this.setupPortfolioModal();
    
    // 6. Testimonial Carousel clone for infinite scroll loop
    this.setupCarouselLoop();
    
    // 7. Contact Form Simulation
    this.setupContactForm();
    
    // 8. Gauge animation activation in Hero Section
    this.animateHeroGauge();
  }
  
  setupScrollReveal() {
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          
          // If this is a counter element, trigger counter animation
          if (entry.target.classList.contains('counter-val')) {
            this.animateCounter(entry.target);
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    this.revealElements.forEach(el => observer.observe(el));
    
    // Also observe counter values
    document.querySelectorAll('.counter-val').forEach(counter => {
      observer.observe(counter);
    });
  }
  
  animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = 0;
    const startTime = performance.now();
    
    const count = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad
      const val = Math.floor(start + (target - start) * (progress * (2 - progress)));
      el.textContent = val + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(count);
      }
    };
    
    requestAnimationFrame(count);
  }
  
  setupPortfolioFilters() {
    this.filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Toggle Active Button
        this.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filterValue = btn.dataset.filter;
        
        // Filter elements
        const wrappers = document.querySelectorAll('.portfolio-card-wrap');
        wrappers.forEach(wrap => {
          const card = wrap.querySelector('.portfolio-card');
          if (filterValue === 'all' || card.dataset.category === filterValue) {
            wrap.style.display = 'block';
            setTimeout(() => {
              wrap.style.opacity = '1';
              wrap.style.transform = 'scale(1)';
            }, 50);
          } else {
            wrap.style.opacity = '0';
            wrap.style.transform = 'scale(0.8)';
            setTimeout(() => {
              wrap.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }
  
  setupPortfolioModal() {
    this.projectCards.forEach(card => {
      card.addEventListener('click', () => {
        // Retrieve project parameters
        const id = card.dataset.id;
        const title = card.querySelector('h4').textContent;
        const subtitle = card.dataset.subtitle || "Website Premium";
        const desc = card.dataset.desc || "Website institucional desenvolvido com as tecnologias mais modernas de animações e otimização de SEO.";
        const imgSrc = card.querySelector('.portfolio-img').src;
        
        const metric1Val = card.dataset.metric1Val || "+100%";
        const metric1Lbl = card.dataset.metric1Lbl || "Conversão";
        const metric2Val = card.dataset.metric2Val || "0.4s";
        const metric2Lbl = card.dataset.metric2Lbl || "Carregamento";
        
        // Inject into modal elements
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-subtitle').textContent = subtitle;
        document.getElementById('modal-description').textContent = desc;
        document.getElementById('modal-img').src = imgSrc;
        
        document.getElementById('modal-metric1-val').textContent = metric1Val;
        document.getElementById('modal-metric1-lbl').textContent = metric1Lbl;
        document.getElementById('modal-metric2-val').textContent = metric2Val;
        document.getElementById('modal-metric2-lbl').textContent = metric2Lbl;
        
        // Open Modal
        this.modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    
    // Close events
    if (this.modalClose) {
      this.modalClose.addEventListener('click', () => this.closeModal());
    }
    
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
      
      // ESC key close
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal.classList.contains('open')) {
          this.closeModal();
        }
      });
    }
  }
  
  closeModal() {
    this.modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  
  setupCarouselLoop() {
    if (!this.carouselTrack) return;
    
    // Clone all testimonials to double the list for infinite scrolling illusion
    const cards = Array.from(this.carouselTrack.children);
    cards.forEach(card => {
      const clone = card.cloneNode(true);
      this.carouselTrack.appendChild(clone);
    });
  }
  
  setupContactForm() {
    if (!this.contactForm) return;
    
    this.contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = this.contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="spin-slow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="margin-right: 8px;">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10"/>
        </svg> Enviando...
      `;
      
      const payload = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        whatsapp: document.getElementById('whatsapp').value,
        company: document.getElementById('company').value,
        message: document.getElementById('message').value
      };
      
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        this.contactForm.style.display = 'none';
        this.successMsg.style.display = 'block';
        
        // Play sound if synthesizer is loaded and active
        if (window.Web01Synth && window.Web01Synth.isEnabled) {
          window.Web01Synth.playSuccessSound();
        }
      })
      .catch(err => {
        console.error(err);
        submitBtn.innerHTML = 'Erro! Tentar Novamente';
        submitBtn.disabled = false;
      });
    });
  }
  
  animateHeroGauge() {
    const gaugeFill = document.getElementById('hero-gauge-fill');
    if (!gaugeFill) return;
    
    // Trigger progress fill after a brief delay
    setTimeout(() => {
      // 440 is full circle circumference
      // 99 score means we fill 99% of circle (leaving 1% stroke-dashoffset)
      const targetPercent = 0.99;
      const circumference = 440;
      const offset = circumference - (circumference * targetPercent);
      
      gaugeFill.style.strokeDashoffset = offset;
    }, 500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new Web01App();
});
