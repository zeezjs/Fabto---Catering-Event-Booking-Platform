// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
  initializeYear();
  initializeStickyNav();
  initializeMobileNav();
  initializeMenuTabs();
  initializeContactForm();
  initializeScrollReveal();
});

// ============ YEAR IN FOOTER ============
function initializeYear() {
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// ============ STICKY NAV SHADOW ON SCROLL ============
function initializeStickyNav() {
  const nav = document.getElementById('siteNav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }, { passive: true });
}

// ============ MOBILE NAV TOGGLE ============
function initializeMobileNav() {
  const navToggle = document.getElementById('navToggle');
  const mobilePanel = document.getElementById('mobilePanel');

  if (!navToggle || !mobilePanel) return;

  navToggle.addEventListener('click', () => {
    const open = mobilePanel.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });

  // Close mobile panel when a link is clicked
  mobilePanel.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobilePanel.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ============ MENU TABS ============
function initializeMenuTabs() {
  const tabs = document.querySelectorAll('.menu-tab');
  const panels = document.querySelectorAll('.menu-panel');

  if (tabs.length === 0 || panels.length === 0) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active state from all tabs
      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });

      // Remove active state from all panels
      panels.forEach(p => p.classList.remove('is-active'));

      // Add active state to clicked tab and corresponding panel
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      const targetPanel = document.getElementById(tab.dataset.target);
      if (targetPanel) {
        targetPanel.classList.add('is-active');
      }
    });
  });
}

// ============ CONTACT FORM ============
function initializeContactForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  if (!form || !success) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Show success message
    success.classList.add('show');
    
    // Reset form
    form.reset();
    
    // Scroll success message into view
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      success.classList.remove('show');
    }, 5000);
  });
}

// ============ SCROLL REVEAL ANIMATION ============
function initializeScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length === 0) return;

  // Use IntersectionObserver if supported
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => io.observe(el));
  } else {
    // Fallback for older browsers
    revealEls.forEach(el => el.classList.add('in-view'));
  }
}
