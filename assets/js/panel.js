document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-links a');
  const dashboardViews = document.querySelectorAll('.dashboard-view');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Don't prevent default if it's the "return-store" link or an external link
      if (link.classList.contains('return-store') || !link.getAttribute('data-target')) return;
      
      e.preventDefault();
      
      const targetId = link.getAttribute('data-target');
      
      // Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active'));
      
      // Add active class to clicked link
      link.classList.add('active');

      // Hide all views and show the target view
      dashboardViews.forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
      });

      const targetView = document.getElementById(targetId);
      if (targetView) {
        targetView.style.display = 'block';
        // Small timeout to allow display:block to apply before animating opacity
        setTimeout(() => {
          targetView.classList.add('active');
        }, 10);
      }
    });
  });
});
