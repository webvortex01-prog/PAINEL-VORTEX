class BudgetCalculator {
  constructor() {
    this.pagesSlider = document.getElementById('calc-pages');
    this.pagesValue = document.getElementById('calc-pages-val');
    this.optionBtns = document.querySelectorAll('.calc-option-btn');
    this.checkItems = document.querySelectorAll('.calc-check-item');
    this.priceDisplay = document.getElementById('calc-price-display');
    this.roiValue = document.getElementById('calc-roi-val');
    this.ctaBtn = document.getElementById('calc-cta-btn');
    
    // Configuration values
    this.projectPrices = {
      page: 180,
      panel: 400,
      both: 550
    };
    
    this.pricePerPage = 50; // Each additional page costs +50
    
    // States
    this.currentPages = 1;
    this.currentProjectType = 'page';
    this.selectedFeatures = new Set();
    this.currentTotal = this.projectPrices.page;
    
    this.init();
  }
  
  init() {
    // 1. Setup Pages Slider listener
    if (this.pagesSlider) {
      this.pagesSlider.addEventListener('input', (e) => {
        this.currentPages = parseInt(e.target.value);
        if (this.pagesValue) this.pagesValue.textContent = this.currentPages;
        this.calculate();
      });
    }

    // 2. Setup Project Type listeners
    this.optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.optionBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.currentProjectType = btn.dataset.type;
        this.calculate();
      });
    });
    
    // 3. Setup Feature Checkboxes listeners
    this.checkItems.forEach(item => {
      item.addEventListener('click', () => {
        item.classList.toggle('selected');
        const feature = item.dataset.feature;
        
        if (item.classList.contains('selected')) {
          this.selectedFeatures.add(feature);
        } else {
          this.selectedFeatures.delete(feature);
        }
        
        this.calculate();
      });
    });
    
    this.calculate();
  }
  
  calculate() {
    // Base cost calculations
    let basePrice = this.projectPrices[this.currentProjectType] || 180;
    
    // Add pages cost
    let pagesCost = (this.currentPages - 1) * this.pricePerPage;
    
    // Add feature flat fees
    let featuresSum = 0;
    this.checkItems.forEach(item => {
      if (item.classList.contains('selected')) {
        featuresSum += parseInt(item.dataset.price);
      }
    });
    
    const finalTotal = basePrice + pagesCost + featuresSum;
    
    // Animate price counter
    this.animatePriceCounter(this.currentTotal, finalTotal);
    this.currentTotal = finalTotal;
    
    // Update ROI prediction and Contact Link
    this.updateRoiPrediction(finalTotal);
    this.updateContactLink(finalTotal);
  }
  
  animatePriceCounter(start, end) {
    const duration = 800; // ms
    const startTime = performance.now();
    
    const updateCounter = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * easeProgress);
      
      // Format to Brazilian Real (R$)
      this.priceDisplay.textContent = `R$ ${current.toLocaleString('pt-BR')}`;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };
    
    requestAnimationFrame(updateCounter);
  }
  
  updateRoiPrediction(price) {
    let text = "Excelente Custo Benefício";
    
    if (this.currentProjectType === 'both') {
      text = "Solução de Ponta a Ponta para o Negócio";
    } else if (this.currentProjectType === 'panel') {
      text = "Gestão Profissional e Economia de Tempo";
    } else {
      text = "Ideal para Atrair Mais Clientes";
    }
    
    this.roiValue.innerHTML = `<strong>${text}</strong>`;
  }

  updateContactLink(totalPrice) {
    if (!this.ctaBtn) return;
    
    // Remove previous listener if exists to avoid duplicates
    const newBtn = this.ctaBtn.cloneNode(true);
    this.ctaBtn.parentNode.replaceChild(newBtn, this.ctaBtn);
    this.ctaBtn = newBtn;
    
    this.ctaBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('calc-name');
      const wppInput = document.getElementById('calc-whatsapp');
      
      if (!nameInput.value || !wppInput.value) {
        alert("Por favor, preencha seu Nome e WhatsApp antes de enviar o orçamento!");
        return;
      }

      this.ctaBtn.innerHTML = 'Enviando...';
      this.ctaBtn.disabled = true;

      // Format the project type name
      let typeName = "Página (One Page)";
      if (this.currentProjectType === 'panel') typeName = "Painel de Administração";
      if (this.currentProjectType === 'both') typeName = "Combo (Página + Painel)";
      
      let featuresArray = Array.from(this.selectedFeatures);
      
      const payload = {
        name: nameInput.value,
        whatsapp: wppInput.value,
        typeName: typeName,
        pages: this.currentPages,
        features: featuresArray,
        total: totalPrice
      };

      fetch('/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        this.ctaBtn.innerHTML = '<i class="fa-solid fa-check"></i> Orçamento Enviado!';
        this.ctaBtn.style.backgroundColor = '#10b981';
      })
      .catch(err => {
        console.error(err);
        this.ctaBtn.innerHTML = 'Erro ao enviar. Tente novamente.';
        this.ctaBtn.disabled = false;
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BudgetCalculator();
});
