document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const modelCards = document.querySelectorAll('.model-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filterBtns.forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      // Filter cards
      modelCards.forEach(card => {
        // Remove animation class to re-trigger it
        card.classList.remove('fade-in');
        
        // Hide by default
        card.classList.add('hide-card');

        // Check if it should be shown
        if (filterValue === 'todos' || card.getAttribute('data-category') === filterValue || card.getAttribute('data-category').includes(filterValue)) {
          card.classList.remove('hide-card');
          
          // Force reflow and add animation
          void card.offsetWidth;
          card.classList.add('fade-in');
        }
      });
    });
  });
});
