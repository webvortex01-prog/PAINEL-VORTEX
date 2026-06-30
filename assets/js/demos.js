// demos.js - Shared functionality for 01 WEB Demo Sites

document.addEventListener('DOMContentLoaded', () => {
  // --- Toast System ---
  const createToastContainer = () => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  };

  window.showToast = (message, icon = 'fa-solid fa-circle-check') => {
    const container = createToastContainer();
    const toast = document.createElement('div');
    toast.className = 'demo-toast';
    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    // Remove toast after animation (3 seconds total)
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // --- E-commerce Logic (Cart) ---
  let cartCount = 0;
  const updateCartHeader = () => {
    // Find any element with the cart count class or try to find a shopping cart icon
    const cartBtns = document.querySelectorAll('.demo-header .btn-main i.fa-cart-shopping, .demo-header .btn-main i.fa-cart-plus');
    cartBtns.forEach(icon => {
      const btn = icon.parentElement;
      if (btn.innerText.includes('Carrinho') || btn.innerText.includes('(')) {
        btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> (${cartCount})`;
      }
    });
  };

  // Add to cart buttons
  const addToCartBtns = document.querySelectorAll('.menu-card .btn, .prod-card .prod-img');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation(); // prevent other clicks if it's an image
      cartCount++;
      updateCartHeader();
      showToast('Produto adicionado ao carrinho!', 'fa-solid fa-cart-plus');
    });
  });

  // --- Form Logic ---
  const forms = document.querySelectorAll('input[type="email"], textarea');
  forms.forEach(input => {
    const container = input.closest('div'); // find closest wrapper
    if (container) {
      const submitBtn = container.querySelector('button');
      if (submitBtn && !submitBtn.dataset.bound) {
        submitBtn.dataset.bound = 'true';
        submitBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';
          submitBtn.disabled = true;
          
          setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            showToast('Sua solicitação foi enviada com sucesso!', 'fa-solid fa-envelope-circle-check');
            
            // clear inputs
            container.querySelectorAll('input, textarea').forEach(inp => inp.value = '');
          }, 1500);
        });
      }
    }
  });
  
  // Imob Search logic
  const searchBtn = document.querySelector('.search-mock button');
  if(searchBtn) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const originalText = searchBtn.innerHTML;
      searchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      setTimeout(() => {
        searchBtn.innerHTML = originalText;
        showToast('Nenhum imóvel off-market encontrado com esses filtros. Acione nossa equipe Hunter.', 'fa-solid fa-magnifying-glass');
      }, 1000);
    });
  }

  // --- Scheduling / Conversion Buttons ---
  const actionBtns = document.querySelectorAll('.hero .btn-main, .price-list .btn-main, .pricing-card .btn-main, .btn-buy');
  actionBtns.forEach(btn => {
    // If it's not a cart button or form button
    if (!btn.innerText.includes('Carrinho') && !btn.querySelector('.fa-spinner')) {
      btn.addEventListener('click', (e) => {
        if(btn.getAttribute('href') === '#') {
          e.preventDefault();
          showToast('Redirecionando para o ambiente seguro...', 'fa-solid fa-lock');
        }
      });
    }
  });

});
