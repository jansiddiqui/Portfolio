/* ═══════════════════════════════════════════════════════════
   JAN MOHAMMAD PORTFOLIO — script.js
   ═══════════════════════════════════════════════════════════ */

const THEME_KEY   = 'theme';
const COOKIES_KEY = 'cookiesAccepted';

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => { clearTimeout(timeout); func(...args); };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ── THEME MANAGER ─────────────────────────────────────────
class ThemeManager {
  constructor() {
    this.themeToggle = document.querySelector('.theme-toggle');
    this.themeIcon   = this.themeToggle.querySelector('i');
    this.savedTheme  = localStorage.getItem(THEME_KEY) || 'dark';
    this.init();
  }
  init() {
    try {
      document.documentElement.setAttribute('data-theme', this.savedTheme);
      this.updateThemeIcon(this.savedTheme);
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    } catch(e) { console.error('Theme init error:', e); }
  }
  toggleTheme() {
    try {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      this.updateThemeIcon(next);
      // Re-initialize particles to update their color matching the new theme
      initParticlesSafe();
    } catch(e) { console.error('Theme toggle error:', e); }
  }
  updateThemeIcon(theme) {
    this.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// ── NAVIGATION MANAGER ────────────────────────────────────
class NavigationManager {
  constructor() {
    this.navbarToggle = document.querySelector('.navbar-toggle');
    this.navList      = document.querySelector('nav ul');
    this.navLinks     = document.querySelectorAll('nav ul li a');
    this.dropdowns    = document.querySelectorAll('.nav-dropdown');
    this.init();
  }
  init() {
    try {
      this.navbarToggle.addEventListener('click', () => this.toggleMenu());
      
      this.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          if (link.classList.contains('dropdown-trigger')) {
            e.preventDefault();
            this.toggleDropdown(link);
          } else {
            this.closeMenu();
          }
        });
      });

      // Close dropdowns on outside click
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown') && !e.target.closest('.navbar-toggle')) {
          this.closeAllDropdowns();
        }
      });
      
      // Close mobile menu on Escape key
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeMenu();
        }
      });
    } catch(e) { console.error('Nav init error:', e); }
  }
  toggleMenu() {
    try {
      const isExpanded = this.navbarToggle.getAttribute('aria-expanded') === 'true';
      this.navbarToggle.setAttribute('aria-expanded', !isExpanded);
      this.navList.classList.toggle('open');
      this.navbarToggle.classList.toggle('open');
      if (isExpanded) {
        this.closeAllDropdowns();
      }
    } catch(e) { console.error('Menu toggle error:', e); }
  }
  closeMenu() {
    this.navbarToggle.setAttribute('aria-expanded', 'false');
    this.navList.classList.remove('open');
    this.navbarToggle.classList.remove('open');
    this.closeAllDropdowns();
  }
  toggleDropdown(trigger) {
    const parent = trigger.parentElement;
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    
    // Close other dropdowns first (accordion behavior on mobile)
    this.dropdowns.forEach(dropdown => {
      if (dropdown !== parent) {
        dropdown.classList.remove('open');
        dropdown.querySelector('.dropdown-trigger').setAttribute('aria-expanded', 'false');
      }
    });
    
    parent.classList.toggle('open');
    trigger.setAttribute('aria-expanded', !isExpanded);
  }
  closeAllDropdowns() {
    this.dropdowns.forEach(dropdown => {
      dropdown.classList.remove('open');
      const trigger = dropdown.querySelector('.dropdown-trigger');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    });
  }
}

// ── HEADER SCROLL MANAGER (HIDE ON SCROLL DOWN, SHOW UP) ──
class HeaderScrollManager {
  constructor() {
    this.header = document.querySelector('header');
    this.lastScroll = 0;
    this.init();
  }
  init() {
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScroll > 100) {
        if (currentScroll > this.lastScroll) {
          this.header.classList.add('hide');
        } else {
          this.header.classList.remove('hide');
        }
      } else {
        this.header.classList.remove('hide');
      }
      this.lastScroll = currentScroll <= 0 ? 0 : currentScroll;
    }, { passive: true });
  }
}

// ── SCROLLSPY MANAGER ─────────────────────────────────────
class ScrollSpyManager {
  constructor() {
    this.sections = document.querySelectorAll('section[id]');
    this.navLinks = document.querySelectorAll('nav ul li a:not(.dropdown-trigger)');
    this.dropdowns = document.querySelectorAll('.nav-dropdown');
    this.init();
  }
  init() {
    window.addEventListener('scroll', debounce(() => this.onScroll(), 50), { passive: true });
    // Run once on load
    this.onScroll();
  }
  onScroll() {
    const scrollPos = window.scrollY || document.documentElement.scrollTop;
    // Add offset for floating header height
    const headerHeight = document.querySelector('header').offsetHeight || 80;
    const triggerOffset = scrollPos + headerHeight + 150;
    
    let activeSectionId = '';
    
    this.sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (triggerOffset >= top && triggerOffset < top + height) {
        activeSectionId = section.getAttribute('id');
      }
    });

    if (!activeSectionId) return;

    // Remove active class from all links and dropdowns
    this.navLinks.forEach(link => link.classList.remove('active'));
    this.dropdowns.forEach(dropdown => dropdown.classList.remove('active'));

    // Highlight the active link and parent dropdown if applicable
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeSectionId}`) {
        link.classList.add('active');
        
        // If this link is inside a dropdown, highlight the dropdown parent
        const parentDropdown = link.closest('.nav-dropdown');
        if (parentDropdown) {
          parentDropdown.classList.add('active');
        }
      }
    });
  }
}

// ── FORM MANAGER ──────────────────────────────────────────
class FormManager {
  constructor() {
    this.form        = document.getElementById('contactForm');
    if (!this.form) return;
    this.formGroups  = this.form.querySelectorAll('.form-group');
    this.submitBtn   = this.form.querySelector('.submit-btn');
    this.formMessage = this.form.querySelector('.form-message');
    this.init();
  }
  init() {
    try {
      this.formGroups.forEach(group => this.setupFormGroup(group));
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    } catch(e) { console.error('Form init error:', e); }
  }
  setupFormGroup(group) {
    const input = group.querySelector('input, textarea');
    const errorMessage = group.querySelector('.error-message');
    input.addEventListener('input', () => this.validateField(input, group, errorMessage));
    input.addEventListener('blur',  () => this.validateField(input, group, errorMessage));
  }
  validateField(input, group, errorMessage) {
    try {
      const value = input.value.trim();
      let isValid = true;
      if (input.type === 'email') {
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        errorMessage.textContent = isValid ? '' : 'Please enter a valid email address';
      } else if (input.type === 'text') {
        isValid = value.length >= 2;
        errorMessage.textContent = isValid ? '' : 'Please enter at least 2 characters';
      } else if (input.tagName === 'TEXTAREA') {
        isValid = value.length >= 10;
        errorMessage.textContent = isValid ? '' : 'Please enter at least 10 characters';
      }
      group.classList.toggle('error',   !isValid);
      group.classList.toggle('success', isValid && value !== '');
      return isValid;
    } catch(e) { console.error('Field validation error:', e); return false; }
  }
  async handleSubmit(e) {
    e.preventDefault();
    try {
      let isValid = true;
      this.formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        const err   = group.querySelector('.error-message');
        if (!this.validateField(input, group, err)) isValid = false;
      });
      if (!isValid) return;
      this.submitBtn.disabled    = true;
      this.submitBtn.textContent = 'Sending...';
      const response = await fetch(this.form.action, {
        method: 'POST', body: new FormData(this.form), headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        this.formMessage.textContent = 'Thank you! Your message has been sent successfully.';
        this.formMessage.className   = 'form-message success';
        this.form.reset();
        this.formGroups.forEach(group => group.classList.remove('success'));
      } else { throw new Error('Failed to send message'); }
    } catch(e) {
      console.error('Form submission error:', e);
      this.formMessage.textContent = 'Oops! Something went wrong. Please try again later.';
      this.formMessage.className   = 'form-message error';
    } finally {
      this.submitBtn.disabled    = false;
      this.submitBtn.textContent = 'Send Message';
      setTimeout(() => { this.formMessage.textContent = ''; this.formMessage.className = 'form-message'; }, 5000);
    }
  }
}

// ── PROJECT FILTER MANAGER ────────────────────────────────
class ProjectFilterManager {
  constructor() {
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.projectCards  = document.querySelectorAll('#projects .project-card');
    this.init();
  }
  init() {
    try {
      this.filterButtons.forEach(btn => btn.addEventListener('click', () => this.filterProjects(btn)));
    } catch(e) { console.error('Project filter init error:', e); }
  }
  filterProjects(button) {
    try {
      this.filterButtons.forEach(btn => { btn.classList.remove('active'); btn.setAttribute('aria-pressed', 'false'); });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      const filterValue = button.getAttribute('data-filter');
      this.projectCards.forEach(card => {
        const cats = (card.getAttribute('data-category') || '').split(' ');
        const show = filterValue === 'all' || cats.includes(filterValue);
        if (show) {
          card.style.opacity = '0'; card.style.transform = 'scale(0.8)';
          setTimeout(() => { card.classList.remove('hidden'); card.style.opacity = '1'; card.style.transform = 'scale(1)'; }, 50);
        } else {
          card.style.opacity = '0'; card.style.transform = 'scale(0.8)';
          setTimeout(() => card.classList.add('hidden'), 300);
        }
      });
    } catch(e) { console.error('Project filtering error:', e); }
  }
}

// ── SCROLL PROGRESS (GLOBAL TOP BAR) ──────────────────────
class ScrollProgressManager {
  constructor() {
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'scroll-progress';
    document.body.appendChild(this.progressBar);
    this.init();
  }
  init() {
    try {
      window.addEventListener('scroll', debounce(() => this.updateProgress(), 10), { passive: true });
    } catch(e) { console.error('Scroll progress init error:', e); }
  }
  updateProgress() {
    try {
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.scrollY / documentHeight;
      this.progressBar.style.transform = `scaleX(${progress})`;
    } catch(e) {}
  }
}

// ── COOKIE CONSENT ────────────────────────────────────────
class CookieConsentManager {
  constructor() {
    this.banner       = document.querySelector('.cookie-consent');
    this.acceptButton = this.banner.querySelector('button');
    this.init();
  }
  init() {
    try {
      if (!localStorage.getItem(COOKIES_KEY)) {
        setTimeout(() => this.banner.classList.add('show'), 1000);
        this.acceptButton.addEventListener('click', () => this.acceptCookies());
      }
    } catch(e) { console.error('Cookie consent init error:', e); }
  }
  acceptCookies() {
    try { localStorage.setItem(COOKIES_KEY, 'true'); this.banner.classList.remove('show'); }
    catch(e) { console.error('Cookie acceptance error:', e); }
  }
}

function acceptCookies() {
  try { localStorage.setItem(COOKIES_KEY, 'true'); document.querySelector('.cookie-consent').classList.remove('show'); }
  catch(e) {}
}

// ── BACK TO TOP ───────────────────────────────────────────
class BackToTopManager {
  constructor() {
    this.button = document.querySelector('.back-to-top');
    this.init();
  }
  init() {
    try {
      window.addEventListener('scroll', debounce(() => this.toggleButton(), 100), { passive: true });
      this.button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    } catch(e) { console.error('Back to top init error:', e); }
  }
  toggleButton() { this.button.classList.toggle('visible', window.scrollY > 300); }
}

// ── ROLE MORPHER CONTROLLER (INFINITE LOOPS) ──────────────
class RoleMorpherController {
  constructor() {
    this.slides = document.querySelectorAll('.role-morpher .role-slide');
    this.currentIndex = 0;
    this.intervalId = null;
    this.init();
  }
  init() {
    if (!this.slides.length) return;
    this.intervalId = setInterval(() => this.morphRole(), 3000);
  }
  morphRole() {
    this.slides[this.currentIndex].classList.remove('active');
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.slides[this.currentIndex].classList.add('active');
  }
}

// ── SCROLL TIMELINE PROGRESS TRACKER ─────────────────────
class ScrollTimelineTracker {
  constructor() {
    this.progressLine = document.querySelector('.timeline-progress-line');
    this.timeline = document.querySelector('.journey-timeline-wrap');
    this.cards = document.querySelectorAll('.journey-card');
    if (!this.timeline || !this.progressLine) return;
    this.init();
  }
  init() {
    window.addEventListener('scroll', () => this.trackProgress(), { passive: true });
    this.trackProgress();
  }
  trackProgress() {
    const rect = this.timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const start = rect.top - windowHeight / 2;
    const totalHeight = rect.height;
    
    let progress = 0;
    if (start < 0) {
      progress = Math.min(Math.abs(start) / totalHeight, 1);
    }
    
    this.progressLine.style.height = `${progress * 100}%`;
    
    this.cards.forEach(card => {
      const cardRect = card.getBoundingClientRect();
      if (cardRect.top < windowHeight * 0.6) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }
}

// ── CLICK COPY EMAIL ACTION ──────────────────────────────
function initCopyEmail() {
  const card = document.getElementById('copy-email-card');
  if (!card) return;
  const emailText = card.querySelector('p').textContent.trim();
  card.addEventListener('click', () => {
    navigator.clipboard.writeText(emailText).then(() => {
      card.classList.add('copied');
      const notice = card.querySelector('.copy-notice');
      const original = notice.textContent;
      notice.textContent = 'Copied to Clipboard!';
      setTimeout(() => {
        card.classList.remove('copied');
        notice.textContent = original;
      }, 2000);
    }).catch(err => {
      console.error('Copy failed: ', err);
    });
  });
}

// ── SKILL PROGRESS ANIMATION ──────────────────────────────
function initSkillProgress() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar      = entry.target.querySelector('.skill-progress');
        if (!bar) return;
        const progress = bar.getAttribute('data-progress');
        bar.style.width = '0%';
        bar.offsetHeight;
        setTimeout(() => { bar.style.width = `${progress}%`; }, 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.skill-card').forEach(card => observer.observe(card));
}

// ── CERTIFICATE MANAGER ───────────────────────────────────
class CertificateManager {
  constructor() {
    this.certificateCards = document.querySelectorAll('.certificate-card');
    this.init();
  }
  init() {
    try { this.certificateCards.forEach(card => card.addEventListener('click', () => this.handleCertificateClick(card))); }
    catch(e) { console.error('Certificate init error:', e); }
  }
  handleCertificateClick(card) {
    try {
      const img   = card.querySelector('img');
      const modal = document.createElement('div');
      modal.className = 'certificate-modal';
      modal.innerHTML = `<div class="modal-content"><span class="close-modal">&times;</span><img src="${img.getAttribute('src')}" alt="${img.getAttribute('alt')}"></div>`;
      document.body.appendChild(modal);
      modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
      modal.addEventListener('click', (e) => { if (e.target === modal) this.closeModal(modal); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.closeModal(modal); }, { once: true });
      setTimeout(() => modal.classList.add('show'), 10);
    } catch(e) { console.error('Certificate click error:', e); }
  }
  closeModal(modal) { modal.classList.remove('show'); setTimeout(() => modal.remove(), 300); }
}

// ── EVENT IMAGE CAROUSEL ──────────────────────────────────
function initCarousels() {
  document.querySelectorAll('.event-image-carousel').forEach(carousel => {
    const container     = carousel.querySelector('.carousel-container');
    const images        = container.querySelectorAll('img');
    const prevBtn       = carousel.querySelector('.prev');
    const nextBtn       = carousel.querySelector('.next');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    let currentIndex    = 0;
 
    let thumbnails = [];
    if (carousel.classList.contains('project-image-carousel')) {
      let thumbsContainer = carousel.nextElementSibling;
      if (!thumbsContainer || !thumbsContainer.classList.contains('carousel-thumbnails')) {
        thumbsContainer = document.createElement('div');
        thumbsContainer.classList.add('carousel-thumbnails');
        carousel.parentNode.insertBefore(thumbsContainer, carousel.nextSibling);
      }
      thumbsContainer.innerHTML = '';
      images.forEach((img, i) => {
        const thumb = document.createElement('img');
        thumb.src = img.src;
        thumb.alt = `Thumbnail ${i + 1}`;
        thumb.classList.add('carousel-thumb');
        if (i === 0) thumb.classList.add('active');
        thumb.addEventListener('click', () => {
          goToSlide(i);
          resetAutoplay();
        });
        thumb.addEventListener('mouseenter', () => {
          goToSlide(i);
          resetAutoplay();
        });
        thumbsContainer.appendChild(thumb);
        thumbnails.push(thumb);
      });
    }

    if (dotsContainer.children.length === 0) {
      images.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });
    }

    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    function updateCarousel() {
      images.forEach((img, i) => img.classList.toggle('active', i === currentIndex));
      dots.forEach((dot, i)   => dot.classList.toggle('active', i === currentIndex));
      thumbnails.forEach((thumb, i) => thumb.classList.toggle('active', i === currentIndex));
    }
    function goToSlide(index) { currentIndex = index; updateCarousel(); }
    function nextSlide() { currentIndex = (currentIndex + 1) % images.length; updateCarousel(); }
    function prevSlide() { currentIndex = (currentIndex - 1 + images.length) % images.length; updateCarousel(); }

    nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
    prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

    let autoplayInterval = setInterval(nextSlide, 5000);
    function resetAutoplay() {
      clearInterval(autoplayInterval);
      autoplayInterval = setInterval(nextSlide, 5000);
    }
    carousel.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    carousel.addEventListener('mouseleave', () => { autoplayInterval = setInterval(nextSlide, 5000); });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    carousel.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    carousel.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 50) {
        nextSlide();
        resetAutoplay();
      } else if (touchEndX > touchStartX + 50) {
        prevSlide();
        resetAutoplay();
      }
    }, { passive: true });
  });
}

// ── SKILL TABS ────────────────────────────────────────────
class SkillTabManager {
  constructor() {
    this.tabs  = document.querySelectorAll('.skill-tab');
    this.wrappers = document.querySelectorAll('.skill-category-wrap');
    this.init();
  }
  init() {
    if (!this.tabs.length) return;
    this.tabs.forEach(tab => tab.addEventListener('click', () => this.switchTab(tab)));
  }
  switchTab(tab) {
    this.tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    const category = tab.getAttribute('data-category');
    this.wrappers.forEach(wrap => {
      const show = category === 'all' || wrap.getAttribute('data-skill-category') === category;
      wrap.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      if (show) {
        wrap.classList.remove('hidden');
        requestAnimationFrame(() => { wrap.style.opacity = '1'; wrap.style.transform = 'scale(1)'; });
      } else {
        wrap.style.opacity = '0'; wrap.style.transform = 'scale(0.9)';
        setTimeout(() => wrap.classList.add('hidden'), 280);
      }
    });
  }
}

// ── COUNTER ANIMATION ─────────────────────────────────────
class CounterAnimation {
  constructor() {
    this.counters = document.querySelectorAll('.stat-number[data-target]');
    this.animated = false;
    this.init();
  }
  init() {
    if (!this.counters.length) return;
    const aboutStats = document.querySelector('.about-stats');
    if (!aboutStats) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated) {
          this.animated = true;
          this.counters.forEach(counter => this.animateCount(counter));
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(aboutStats);
  }
  animateCount(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const start    = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  }
}

// ── INTERACTIVE MINDMAP CANVAS ────────────────────────────
class MindmapOrb {
  constructor() {
    this.canvas = document.getElementById('mindmapCanvas');
    if (!this.canvas) return;
    this.ctx   = this.canvas.getContext('2d');
    this.nodes = [];
    this.mouseX = null;
    this.mouseY = null;
    this.init();
  }
  init() {
    this.resize();
    window.addEventListener('resize', debounce(() => this.resize(), 200));

    const hero = document.getElementById('hero');
    if (hero) {
      hero.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        const hoveredNode = this.nodes.find(n => Math.hypot(this.mouseX - n.x, this.mouseY - n.y) < 18);
        if (hoveredNode && window.tooltipManager) {
          window.tooltipManager.show(
            `Click to scroll to ${hoveredNode.label}`,
            e.clientX,
            e.clientY - 10
          );
        } else if (window.tooltipManager && !hoveredNode) {
          if (!e.target.closest('[data-tooltip]')) {
            window.tooltipManager.hide();
          }
        }
      });
      hero.addEventListener('mouseleave', () => {
        this.mouseX = null;
        this.mouseY = null;
        if (window.tooltipManager) window.tooltipManager.hide();
      });
    }

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const clickedNode = this.nodes.find(n => Math.hypot(clickX - n.x, clickY - n.y) < 18);
      if (clickedNode) {
        this.navigate(clickedNode.label);
      }
    });

    this.animate();
  }
  resize() {
    const container    = this.canvas.parentElement;
    this.canvas.width  = container.offsetWidth;
    this.canvas.height = container.offsetHeight;
    this.cx = this.canvas.width  / 2;
    this.cy = this.canvas.height / 2;
    this.buildNodes();
  }
  buildNodes() {
    const labels = [
      'Courage Library',
      'LangGraph Agents',
      'Supabase',
      'System Design',
      'CNTS Platform',
      'Oryza Agency',
      'AI Products',
      'Full Stack'
    ];
    let radiusScale = 0.33;
    if (this.canvas.width < 600) {
      radiusScale = 0.22;
    }
    const radius = Math.min(this.canvas.width, this.canvas.height) * radiusScale;
    this.nodes = labels.map((label, i) => {
      const angle = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
      return {
        label, angle,
        baseX: this.cx + Math.cos(angle) * radius,
        baseY: this.cy + Math.sin(angle) * radius,
        x: 0, y: 0,
        speed:  0.0003 + Math.random() * 0.0004,
        offset: Math.random() * Math.PI * 2,
        floatR: 4 + Math.random() * 5
      };
    });
  }
  navigate(label) {
    const mapping = {
      'Courage Library': '#projects',
      'CNTS Platform': '#projects',
      'Supabase': '#projects',
      'Full Stack': '#skills',
      'System Design': '#experience',
      'AI Products': '#projects',
      'LangGraph Agents': '#projects',
      'Oryza Agency': '#experience'
    };
    
    const target = mapping[label];
    if (target) {
      smoothScrollToTarget(target);
      
      if (target === '#projects') {
        let projectTitle = '';
        if (label === 'Courage Library') projectTitle = 'Courage Library';
        if (label === 'CNTS Platform') projectTitle = 'Courage CNTS';
        if (label === 'Supabase') projectTitle = 'SplitSync';
        if (label === 'AI Products' || label === 'LangGraph Agents') projectTitle = 'CompanyIQ';
        
        if (projectTitle) {
          setTimeout(() => {
            const cards = document.querySelectorAll('.project-landing-card');
            const matchedCard = Array.from(cards).find(c => c.querySelector('h3').textContent === projectTitle);
            if (matchedCard) {
              matchedCard.classList.add('highlight-tech-glow');
              setTimeout(() => matchedCard.classList.remove('highlight-tech-glow'), 2000);
            }
          }, 800);
        }
      }
    }
  }
  animate() {
    const ctx = this.ctx;
    const t   = Date.now();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    const colorRGB = theme === 'dark' ? '45,212,191' : '29,78,216';

    this.nodes.forEach(n => {
      let targetX = n.baseX + Math.cos(t * n.speed + n.offset)       * n.floatR;
      let targetY = n.baseY + Math.sin(t * n.speed * 1.3 + n.offset) * n.floatR;

      if (this.mouseX !== null && this.mouseY !== null) {
        const dx = this.mouseX - targetX;
        const dy = this.mouseY - targetY;
        const dist = Math.hypot(dx, dy);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          targetX += dx * force * 0.16;
          targetY += dy * force * 0.16;
        }
      }

      if (!n.x) {
        n.x = targetX;
        n.y = targetY;
      } else {
        n.x += (targetX - n.x) * 0.1;
        n.y += (targetY - n.y) * 0.1;
      }
    });

    let hoveredNode = null;
    if (this.mouseX !== null && this.mouseY !== null) {
      hoveredNode = this.nodes.find(n => Math.hypot(this.mouseX - n.x, this.mouseY - n.y) < 18);
    }
    this.canvas.style.cursor = hoveredNode ? 'pointer' : 'default';

    this.nodes.forEach(n => {
      ctx.beginPath(); ctx.moveTo(this.cx, this.cy); ctx.lineTo(n.x, n.y);
      ctx.strokeStyle = `rgba(${colorRGB},${0.07 + 0.05 * Math.sin(t * 0.001 + n.offset)})`;
      ctx.lineWidth = 0.8; ctx.stroke();
    });

    const maxDist = Math.min(this.canvas.width, this.canvas.height) * 0.38;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const d = Math.hypot(this.nodes[i].x - this.nodes[j].x, this.nodes[i].y - this.nodes[j].y);
        if (d < maxDist) {
          ctx.beginPath(); ctx.moveTo(this.nodes[i].x, this.nodes[i].y); ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          ctx.strokeStyle = `rgba(${colorRGB},${(1 - d / maxDist) * 0.05})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }

    const pulse = 1 + 0.04 * Math.sin(t * 0.002);
    const orbR  = Math.min(this.canvas.width, this.canvas.height) * 0.06 * pulse;
    const grad  = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, orbR * 2.2);
    grad.addColorStop(0, `rgba(${colorRGB},0.15)`); grad.addColorStop(1, `rgba(${colorRGB},0)`);
    ctx.beginPath(); ctx.arc(this.cx, this.cy, orbR * 2.2, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.arc(this.cx, this.cy, orbR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${colorRGB},0.12)`; ctx.strokeStyle = `rgba(${colorRGB},0.45)`; ctx.lineWidth = 1; ctx.fill(); ctx.stroke();

    ctx.fillStyle = theme === 'dark' ? '#F8FAFC' : '#111827';
    ctx.font = '700 11px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Jan', this.cx, this.cy);

    this.nodes.forEach(n => {
      ctx.beginPath(); ctx.arc(n.x, n.y, 4.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(${colorRGB},0.45)`; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, Math.PI * 2); ctx.fillStyle = `rgba(${colorRGB},0.95)`;   ctx.fill();

      ctx.fillStyle = theme === 'dark' ? 'rgba(248,250,252,0.85)' : 'rgba(17,24,39,0.85)';
      ctx.font = '600 11px "Space Grotesk", sans-serif';
      ctx.textAlign = n.x < this.cx ? 'right' : 'left';
      ctx.textBaseline = 'middle';
      const offsetAmt = n.x < this.cx ? -10 : 10;
      ctx.fillText(n.label, n.x + offsetAmt, n.y);
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ── COMMAND PALETTE MANAGER ──────────────────────────────
class CommandPaletteManager {
  constructor() {
    this.modal = document.getElementById('cmdPaletteModal');
    this.searchInput = document.getElementById('cmdSearchInput');
    this.resultsList = document.getElementById('cmdResultsList');
    this.searchBtn = document.querySelector('.nav-search-btn');
    
    this.commands = [
      { id: 'courage-library', title: 'Open Courage Library', desc: 'Case study for EdTech Startup', category: 'projects', icon: 'fas fa-book', action: () => this.scrollTo('#projects') },
      { id: 'companyiq', title: 'Open CompanyIQ', desc: 'Case study for AI Agent Platform', category: 'projects', icon: 'fas fa-brain', action: () => this.scrollTo('#projects') },
      { id: 'splitsync', title: 'Open SplitSync', desc: 'Case study for Expense SaaS', category: 'projects', icon: 'fas fa-file-invoice-dollar', action: () => this.scrollTo('#projects') },
      { id: 'deadline-hero', title: 'Open Deadline Hero AI', desc: 'Case study for Planner OS', category: 'projects', icon: 'fas fa-hourglass-half', action: () => this.scrollTo('#projects') },
      { id: 'cnts', title: 'Open Courage CNTS', desc: 'Case study for Assessment Portal', category: 'projects', icon: 'fas fa-graduation-cap', action: () => this.scrollTo('#projects') },
      
      { id: 'home', title: 'Go to Home', desc: 'Go to hero top section', category: 'navigation', icon: 'fas fa-home', action: () => this.scrollTo('#hero') },
      { id: 'who-i-am', title: 'Go to Who I Am', desc: 'About bio and values', category: 'navigation', icon: 'fas fa-user', action: () => this.scrollTo('#about') },
      { id: 'journey', title: 'Go to Journey', desc: 'Experience and timeline', category: 'navigation', icon: 'fas fa-briefcase', action: () => this.scrollTo('#experience') },
      { id: 'toolkit', title: 'Go to Toolkit', desc: 'Technical stack & skills', category: 'navigation', icon: 'fas fa-code', action: () => this.scrollTo('#skills') },
      { id: 'cp-profiles', title: 'Go to CP Profiles', desc: 'GFG, LeetCode, Codolio', category: 'navigation', icon: 'fas fa-laptop-code', action: () => this.scrollTo('#competitive-programming') },
      { id: 'achievements', title: 'Go to Achievements', desc: 'Milestones & contests', category: 'navigation', icon: 'fas fa-trophy', action: () => this.scrollTo('#achievements') },
      { id: 'events', title: 'Go to Events', desc: 'Conferences and Hackathons', category: 'navigation', icon: 'fas fa-calendar-alt', action: () => this.scrollTo('#tech-events') },
      { id: 'contact', title: 'Go to Contact', desc: 'Send a message or check email', category: 'navigation', icon: 'fas fa-envelope', action: () => this.scrollTo('#contact') },
      
      { id: 'fast-track', title: 'Recruiter Fast-Track Mode', desc: 'Instant highlight on SIH/Startups + scroll to contact', category: 'recruiter', icon: 'fas fa-bolt', action: () => this.runFastTrack() },
      { id: 'cv', title: 'Download Resume (CV)', desc: 'Download Jan Mohammad CV', category: 'utilities', icon: 'fas fa-download', action: () => this.downloadCV() },
      { id: 'theme', title: 'Toggle Theme', desc: 'Switch Light / Dark theme', category: 'utilities', icon: 'fas fa-adjust', action: () => this.toggleTheme() },
      { id: 'copy-email', title: 'Copy Email Address', desc: 'Copy to clipboard', category: 'utilities', icon: 'fas fa-copy', action: () => this.copyEmail() },
      
      { id: 'accent-teal', title: 'Accent: Cyber Cyan', desc: 'Switch accent color to Cyan', category: 'customizer', icon: 'fas fa-circle accent-teal-icon', action: () => this.setAccent('teal') },
      { id: 'accent-purple', title: 'Accent: Amethyst Purple', desc: 'Switch accent color to Purple', category: 'customizer', icon: 'fas fa-circle accent-purple-icon', action: () => this.setAccent('purple') },
      { id: 'accent-gold', title: 'Accent: Matte Gold', desc: 'Switch accent color to Gold', category: 'customizer', icon: 'fas fa-circle accent-gold-icon', action: () => this.setAccent('gold') },
      { id: 'accent-ruby', title: 'Accent: Ruby Crimson', desc: 'Switch accent color to Red', category: 'customizer', icon: 'fas fa-circle accent-ruby-icon', action: () => this.setAccent('ruby') }
    ];
    
    this.activeIndex = 0;
    this.filteredCommands = [...this.commands];
    this.init();
  }
  
  init() {
    if (!this.modal) return;
    
    // Ctrl+K / Cmd+K shortcut listener
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      }
      if (e.key === 'Escape') {
        this.close();
      }
    });
    
    // Navbar search button trigger
    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.open();
      });
    }
    
    // Close overlay on click outside command palette container
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
    
    // Keyboard navigation within the input field
    this.searchInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    this.searchInput.addEventListener('input', () => this.handleInput());
    
    this.render();
  }
  
  open() {
    this.modal.classList.add('show');
    this.searchInput.value = '';
    this.activeIndex = 0;
    this.filteredCommands = [...this.commands];
    this.render();
    setTimeout(() => this.searchInput.focus(), 50);
  }
  
  close() {
    this.modal.classList.remove('show');
    this.searchInput.blur();
  }
  
  scrollTo(selector) {
    const el = document.querySelector(selector);
    if (el) {
      this.close();
      smoothScrollToTarget(selector);
    }
  }
  
  toggleTheme() {
    this.close();
    // Use the ThemeManager toggle directly if initialized
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.click();
  }
  
  downloadCV() {
    this.close();
    const link = document.createElement('a');
    link.href = 'Jan_Mohammad_CV.pdf';
    link.download = 'Jan_Mohammad_CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  copyEmail() {
    this.close();
    navigator.clipboard.writeText('jansiddiqui11@gmail.com').then(() => {
      const emailCard = document.querySelector('.contact-card-premium');
      if (emailCard) {
        emailCard.classList.add('copied');
        const notice = emailCard.querySelector('.copy-notice');
        if (notice) notice.innerText = 'Email Copied!';
        setTimeout(() => emailCard.classList.remove('copied'), 2000);
      }
    }).catch(err => console.error('Copy fail:', err));
  }
  
  setAccent(color) {
    if (window.themeCustomizer) {
      window.themeCustomizer.setAccent(color);
    }
    this.close();
  }
  
  runFastTrack() {
    this.close();
    // 1. Highlight SIH/Startup work by filtering the projects list
    const filterBtn = document.querySelector('.filter-btn[data-filter="web"]');
    if (filterBtn) filterBtn.click();
    
    // 2. Scroll to Projects section first
    this.scrollTo('#projects');
    
    // 3. Highlight Contact after 1 second delay
    setTimeout(() => {
      this.scrollTo('#contact');
      const contactForm = document.querySelector('form');
      if (contactForm) {
        contactForm.style.transition = 'outline 0.5s ease';
        contactForm.style.outline = '4px solid var(--accent-color)';
        setTimeout(() => {
          contactForm.style.outline = 'none';
        }, 1500);
      }
    }, 1200);
  }
  
  handleInput() {
    const query = this.searchInput.value.toLowerCase().trim();
    if (!query) {
      this.filteredCommands = [...this.commands];
    } else {
      this.filteredCommands = this.commands.filter(cmd => 
        cmd.title.toLowerCase().includes(query) || 
        cmd.desc.toLowerCase().includes(query) ||
        cmd.category.toLowerCase().includes(query)
      );
    }
    this.activeIndex = 0;
    this.render();
  }
  
  handleKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % this.filteredCommands.length;
      this.render();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + this.filteredCommands.length) % this.filteredCommands.length;
      this.render();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.filteredCommands[this.activeIndex]) {
        this.filteredCommands[this.activeIndex].action();
      }
    }
  }
  
  render() {
    this.resultsList.innerHTML = '';
    if (this.filteredCommands.length === 0) {
      this.resultsList.innerHTML = `
        <div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          No commands found matching "${this.searchInput.value}"
        </div>
      `;
      return;
    }
    
    this.filteredCommands.forEach((cmd, idx) => {
      const activeClass = idx === this.activeIndex ? 'active' : '';
      const div = document.createElement('div');
      div.className = `cmd-item ${activeClass}`;
      div.innerHTML = `
        <i class="${cmd.icon}"></i>
        <div class="cmd-item-info">
          <span class="cmd-item-title">${cmd.title}</span>
          <span class="cmd-item-desc">${cmd.desc}</span>
        </div>
        <span class="cmd-shortcut">${cmd.category}</span>
      `;
      
      div.addEventListener('click', () => {
        cmd.action();
      });
      
      this.resultsList.appendChild(div);
      
      if (idx === this.activeIndex) {
        div.scrollIntoView({ block: 'nearest' });
      }
    });
  }
}

// ── PARTICLES ─────────────────────────────────────────────
function initParticlesSafe() {
  if (typeof particlesJS === 'undefined') return;
  const el = document.getElementById('particles-js');
  if (!el) return;

  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const rootStyles = getComputedStyle(document.documentElement);
  const particleColor = rootStyles.getPropertyValue('--accent-color').trim() || (theme === 'dark' ? '#06b6d4' : '#4F46E5');

  particlesJS('particles-js', {
    particles: {
      number: { value: 60 },
      color: { value: particleColor },
      shape: { type: "circle" },
      opacity: { value: theme === 'dark' ? 0.3 : 0.15 },
      size: { value: 2.5, random: true },
      line_linked: {
        enable: true,
        distance: 130,
        color: particleColor,
        opacity: theme === 'dark' ? 0.25 : 0.15,
        width: 1
      },
      move: { enable: true, speed: 2 }
    },
    interactivity: {
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: true, mode: "push" }
      }
    },
    retina_detect: true
  });
}

// ── TERMINAL CONTROLLER ──────────────────────────────────
class TerminalController {
  constructor() {
    this.input = document.getElementById('aboutTerminalInput');
    this.output = document.getElementById('aboutTerminalOutput');
    this.body = document.getElementById('aboutTerminalBody');
    this.history = [];
    this.historyIndex = -1;
    this.commands = {
      help: () => `Available commands:
  - <span class="term-highlight">projects</span>: View list of core case studies
  - <span class="term-highlight">skills</span>: List expert technologies in toolkit
  - <span class="term-highlight">streak</span>: View current coding consistency stats
  - <span class="term-highlight">sih</span>: Read details about Smart India Hackathon 2025
  - <span class="term-highlight">whoami</span>: Print professional overview bio
  - <span class="term-highlight">clear</span>: Clear terminal console buffer`,
      projects: () => `JanOS Projects Registry:
  1. [Courage Library]: Hybrid EdTech startup (1.2k+ users)
  2. [CompanyIQ]: Multi-agent LangGraph equity analysis system
  3. [SplitSync]: Database-native O(N) bill splitter app
  4. [Deadline Hero AI]: Gemini timeline risk adaptation OS
  5. [Courage CNTS]: Class 5-8 assessment system`,
      skills: () => `Toolkit Core Stack:
  - Frontend: JavaScript, TypeScript, React, Next.js, TailwindCSS
  - Backend: Node.js, Python, Flask, LangGraph.js, Prisma
  - Database: PostgreSQL, Supabase ACID blocks, SQL`,
      streak: () => `Coding Streak Performance Metrics:
  - Platform Streak: 175+ Days (Codolio), 155+ Days (GFG), 153+ (LeetCode)
  - Total solved problems: 610+
  - Best contest rating: 1839+ (GeeksforGeeks)`,
      sih: () => `Smart India Hackathon 2025 - Team NovaSix (SIH-S:133):
  - Project: MindWell (AI Student Mental Health OS)
  - Role: Led ML and WebRTC video/audio analysis layers.
  - Recognition: Top nationwide finals competitive qualifier.`,
      whoami: () => `Role: Co-Founder, AI Builder & Software Engineer.
Focus: Multi-agent architectures, ACID transactional ledger systems,
high-performance EdTech pipelines, and clean algorithmic codebases.`,
      clear: () => {
        this.output.innerHTML = '';
        return '';
      }
    };
    this.init();
  }
  init() {
    if (!this.input) return;
    this.input.addEventListener('keydown', (e) => this.handleKey(e));
    if (this.body) {
      this.body.addEventListener('click', () => this.input.focus());
    }
  }
  handleKey(e) {
    if (e.key === 'Enter') {
      const rawCmd = this.input.value;
      const cmd = rawCmd.trim().toLowerCase();
      this.input.value = '';
      
      const inputLine = document.createElement('div');
      inputLine.className = 'terminal-line';
      inputLine.innerHTML = `<span class="terminal-prompt">jan@dev:~$</span> ${rawCmd}`;
      this.output.appendChild(inputLine);
      
      if (cmd) {
        this.history.push(rawCmd);
        this.historyIndex = this.history.length;
        
        let response = '';
        if (this.commands[cmd]) {
          response = this.commands[cmd]();
        } else {
          response = `Command not found: "${cmd}". Type <span class="term-highlight">help</span> for list of items.`;
        }
        
        if (response) {
          const resLine = document.createElement('div');
          resLine.className = 'terminal-line';
          resLine.innerHTML = response;
          this.output.appendChild(resLine);
        }
      }
      
      this.body.scrollTop = this.body.scrollHeight;
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.input.value = this.history[this.historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.input.value = this.history[this.historyIndex];
      } else {
        this.historyIndex = this.history.length;
        this.input.value = '';
      }
    }
  }
}

// ── SPLITSYNC VISUALIZER ─────────────────────────────────
class SplitSyncVisualizer {
  constructor() {
    this.btn = document.getElementById('btnOptimizeSplitSync');
    this.statusTag = document.getElementById('splitsyncStatus');
    this.logEl = document.getElementById('splitsyncLog');
    this.balA = document.getElementById('balA');
    this.balB = document.getElementById('balB');
    this.balC = document.getElementById('balC');
    this.edgeAB = document.getElementById('edgeAB');
    this.edgeBC = document.getElementById('edgeBC');
    this.edgeAC = document.getElementById('edgeAC');
    this.nodeB = document.getElementById('nodeB');
    
    this.optimized = false;
    this.init();
  }
  init() {
    if (!this.btn) return;
    this.btn.addEventListener('click', () => this.toggleOptimization());
  }
  toggleOptimization() {
    if (!this.optimized) {
      this.optimized = true;
      this.btn.innerText = 'Reset Simulator';
      this.statusTag.innerText = 'Optimized';
      this.statusTag.classList.add('optimized');
      
      if (this.logEl) {
        this.logEl.classList.remove('success');
        this.logEl.innerText = '[Greedy Alg] Merging intermediate ledger nodes A -> B and B -> C...';
      }
      
      setTimeout(() => {
        this.edgeAB.classList.add('hidden');
        this.edgeBC.classList.add('hidden');
        this.edgeAC.classList.remove('hidden');
        
        if (this.nodeB) this.nodeB.style.opacity = '0.35';
        if (this.balB) this.balB.innerText = 'Settled';
        
        if (this.logEl) {
          this.logEl.classList.add('success');
          this.logEl.innerText = '[Greedy Alg] Optimized. Direct shortcut path A -> C ($10) settled.';
        }
      }, 700);
      
    } else {
      this.optimized = false;
      this.btn.innerText = 'Run Greedy Optimization';
      this.statusTag.innerText = 'Unoptimized';
      this.statusTag.classList.remove('optimized');
      
      this.edgeAB.classList.remove('hidden');
      this.edgeBC.classList.remove('hidden');
      this.edgeAC.classList.add('hidden');
      
      if (this.nodeB) this.nodeB.style.opacity = '1';
      if (this.balB) this.balB.innerText = 'Owed $0';
      
      if (this.logEl) {
        this.logEl.classList.remove('success');
        this.logEl.innerText = 'Ledger reset. System awaiting transactions.';
      }
    }
  }
}

// ── TECH STACK HIGHLIGHT MANAGER ─────────────────────────
class TechStackHighlightManager {
  constructor() {
    this.projectCards = document.querySelectorAll('.project-landing-card, .projects-grid .project-card');
    this.techTags = document.querySelectorAll('.project-tech-tags span, .skill-card');
    this.init();
  }
  
  getTechKey(text) {
    const norm = text.toLowerCase().trim();
    if (norm.includes('supabase')) return 'supabase';
    if (norm.includes('postgres') || norm.includes('sql') || norm.includes('prisma')) return 'database';
    if (norm.includes('next') || norm.includes('node')) return 'nextjs';
    if (norm.includes('react') || norm.includes('vite')) return 'react';
    if (norm.includes('typescript') || norm.includes('ts')) return 'typescript';
    if (norm.includes('javascript') || norm.includes('js')) return 'javascript';
    if (norm.includes('python')) return 'python';
    if (norm.includes('gemini') || norm.includes('ai') || norm.includes('ml') || norm.includes('brain') || norm.includes('learning')) return 'ai';
    if (norm.includes('tailwind') || norm.includes('css') || norm.includes('html')) return 'webfront';
    return norm.replace(/[\s\.\-\/0-9]/g, '');
  }
  
  init() {
    this.projectCards.forEach(card => {
      const spans = card.querySelectorAll('.project-tech-tags span');
      const keys = Array.from(spans).map(span => this.getTechKey(span.textContent));
      card.setAttribute('data-tech-keys', keys.join(','));
    });
    
    this.techTags.forEach(tag => {
      let text = '';
      if (tag.classList.contains('skill-card')) {
        const span = tag.querySelector('.skill-card-header span');
        text = span ? span.textContent : '';
      } else {
        text = tag.textContent;
      }
      const key = this.getTechKey(text);
      tag.setAttribute('data-tech-key', key);
      
      tag.addEventListener('mouseenter', () => this.highlight(key));
      tag.addEventListener('mouseleave', () => this.clearHighlight());
    });
  }
  
  highlight(key) {
    this.projectCards.forEach(card => {
      const keys = card.getAttribute('data-tech-keys') || '';
      if (keys.split(',').includes(key)) {
        card.classList.add('highlight-tech-glow');
      } else {
        card.style.opacity = '0.35';
        card.style.filter = 'blur(1px)';
      }
    });
  }
  
  clearHighlight() {
    this.projectCards.forEach(card => {
      card.classList.remove('highlight-tech-glow');
      card.style.opacity = '';
      card.style.filter = '';
    });
  }
}

// ── CUSTOM SMOOTH SCROLL SYSTEM ──────────────────────────
const smoothScrollToTarget = (targetSelector) => {
  const targetEl = document.querySelector(targetSelector);
  if (!targetEl) return;
  const navbarHeight = 85; 
  const targetPosition = targetEl.getBoundingClientRect().top + window.scrollY - navbarHeight;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const duration = 850; 

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  let start = null;

  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = easeOutCubic(progress);
    window.scrollTo(0, startPosition + distance * ease);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
};

// Global click intercept for smooth scrolling anchor tags
document.addEventListener('click', (e) => {
  const anchor = e.target.closest('a');
  if (anchor && anchor.hash && anchor.hash.startsWith('#')) {
    const targetEl = document.querySelector(anchor.hash);
    if (targetEl) {
      e.preventDefault();
      smoothScrollToTarget(anchor.hash);
      history.pushState(null, null, anchor.hash);
    }
  }
});

// ── TOOLTIP MANAGER ──────────────────────────────────────
class TooltipManager {
  constructor() {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.className = 'custom-tooltip';
    document.body.appendChild(this.tooltipEl);
    this.init();
  }
  
  init() {
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        const text = target.getAttribute('data-tooltip');
        this.tooltipEl.textContent = text;
        this.tooltipEl.classList.add('show');
        this.positionTooltip(target);
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-tooltip]');
      if (target) {
        this.tooltipEl.classList.remove('show');
      }
    });
  }
  
  show(text, x, y) {
    this.tooltipEl.textContent = text;
    this.tooltipEl.classList.add('show');
    this.tooltipEl.style.left = `${x}px`;
    this.tooltipEl.style.top = `${y}px`;
  }
  
  hide() {
    this.tooltipEl.classList.remove('show');
  }
  
  positionTooltip(target) {
    const rect = target.getBoundingClientRect();
    const tooltipX = rect.left + rect.width / 2;
    this.tooltipEl.style.left = `${tooltipX}px`;
    this.tooltipEl.style.top = `${rect.top}px`;
  }
}



// ── SYSTEM PERFORMANCE TELEMETRY TRACKER ──────────────────
class PerformanceTelemetryTracker {
  constructor() {
    this.domEl = document.getElementById('telDomTime');
    this.fpsEl = document.getElementById('telFps');
    this.fpsCount = 0;
    this.lastTime = performance.now();
    this.init();
  }
  
  init() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const t = performance.timing;
        const loadTime = t.domContentLoadedEventEnd - t.navigationStart;
        if (this.domEl && loadTime > 0) {
          this.domEl.textContent = `DOM Ready: ${loadTime}ms`;
        } else if (this.domEl) {
          this.domEl.textContent = `DOM Ready: 142ms`;
        }
      }, 0);
    });
    
    this.tick();
  }
  
  tick() {
    const now = performance.now();
    this.fpsCount++;
    if (now > this.lastTime + 1000) {
      const fps = Math.round((this.fpsCount * 1000) / (now - this.lastTime));
      if (this.fpsEl) {
        this.fpsEl.textContent = `FPS: ${fps}`;
      }
      this.fpsCount = 0;
      this.lastTime = now;
    }
    requestAnimationFrame(() => this.tick());
  }
}

// ── LANGGRAPH AGENT ORCHESTRATOR VISUALIZER ──────────────
class LangGraphVisualizer {
  constructor() {
    this.btn = document.getElementById('btnRunLangGraph');
    this.statusTag = document.getElementById('langgraphStatus');
    this.logEl = document.getElementById('langgraphLog');
    this.factNode = document.getElementById('agentFact');
    this.analyzeNode = document.getElementById('agentAnalyze');
    this.writerNode = document.getElementById('agentWriter');
    this.flow1 = document.getElementById('flow1');
    this.flow2 = document.getElementById('flow2');
    
    this.running = false;
    this.init();
  }
  
  init() {
    if (!this.btn) return;
    this.btn.addEventListener('click', () => this.triggerPipeline());
  }
  
  triggerPipeline() {
    if (this.running) return;
    this.running = true;
    this.btn.innerText = 'Orchestrating...';
    this.btn.disabled = true;
    
    const nodes = [this.factNode, this.analyzeNode, this.writerNode];
    nodes.forEach(n => {
      if (n) {
        n.classList.remove('active', 'completed');
        n.querySelector('.agent-status').innerText = 'Pending';
      }
    });
    if (this.flow1) this.flow1.classList.remove('active');
    if (this.flow2) this.flow2.classList.remove('active');
    
    this.statusTag.innerText = 'Fact Retriever active';
    if (this.factNode) {
      this.factNode.classList.add('active');
      this.factNode.querySelector('.agent-status').innerText = 'Running';
    }
    if (this.logEl) {
      this.logEl.classList.remove('success');
      this.logEl.innerText = '[Fact Retriever] Querying corporate cash-flow statements from PostgreSQL ledger...';
    }
    
    setTimeout(() => {
      if (this.factNode) {
        this.factNode.classList.remove('active');
        this.factNode.classList.add('completed');
        this.factNode.querySelector('.agent-status').innerText = 'Complete';
      }
      if (this.flow1) this.flow1.classList.add('active');
      
      this.statusTag.innerText = 'Analyst Agent active';
      if (this.analyzeNode) {
        this.analyzeNode.classList.add('active');
        this.analyzeNode.querySelector('.agent-status').innerText = 'Running';
      }
      if (this.logEl) {
        this.logEl.innerText = '[Analyst Agent] Performing trend delta regressions and computing debt ratios...';
      }
    }, 1200);
    
    setTimeout(() => {
      if (this.analyzeNode) {
        this.analyzeNode.classList.remove('active');
        this.analyzeNode.classList.add('completed');
        this.analyzeNode.querySelector('.agent-status').innerText = 'Complete';
      }
      if (this.flow2) this.flow2.classList.add('active');
      
      this.statusTag.innerText = 'Writer Agent active';
      if (this.writerNode) {
        this.writerNode.classList.add('active');
        this.writerNode.querySelector('.agent-status').innerText = 'Running';
      }
      if (this.logEl) {
        this.logEl.innerText = '[Writer Agent] Synthesizing investment report into markdown formatting...';
      }
    }, 2400);
    
    setTimeout(() => {
      if (this.writerNode) {
        this.writerNode.classList.remove('active');
        this.writerNode.classList.add('completed');
        this.writerNode.querySelector('.agent-status').innerText = 'Complete';
      }
      this.statusTag.innerText = 'Verification complete';
      this.btn.innerText = 'Run Pipeline';
      this.btn.disabled = false;
      this.running = false;
      if (this.logEl) {
        this.logEl.classList.add('success');
        this.logEl.innerText = '[System] Fact audits verified. Generated CompanyIQ equity report (99.8% precision).';
      }
    }, 3600);
  }
}

// ── ACCENT COLOR CUSTOMIZER CONTROLLER ───────────────────
class ThemeCustomizer {
  constructor() {
    this.dots = document.querySelectorAll('.color-dot');
    this.themes = {
      teal: {
        accent: '#06b6d4',
        glow: 'rgba(6, 182, 212, 0.15)',
        secondary: '#10b981'
      },
      purple: {
        accent: '#8b5cf6',
        glow: 'rgba(139, 92, 246, 0.15)',
        secondary: '#ec4899'
      },
      gold: {
        accent: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.15)',
        secondary: '#10b981'
      },
      ruby: {
        accent: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.15)',
        secondary: '#f59e0b'
      }
    };
    this.init();
  }
  
  init() {
    const saved = localStorage.getItem('theme-accent') || 'teal';
    this.setAccent(saved);
    
    this.dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const color = e.target.getAttribute('data-color');
        this.setAccent(color);
      });
    });
  }
  
  setAccent(color) {
    if (!this.themes[color]) return;
    const theme = this.themes[color];
    
    document.documentElement.style.setProperty('--accent-color', theme.accent);
    document.documentElement.style.setProperty('--accent-glow', theme.glow);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    
    localStorage.setItem('theme-accent', color);
    
    this.dots.forEach(dot => {
      if (dot.getAttribute('data-color') === color) {
        dot.classList.add('active');
        dot.style.boxShadow = `0 0 10px ${theme.accent}`;
      } else {
        dot.classList.remove('active');
        dot.style.boxShadow = '';
      }
    });
    
    // Dynamically update particles color scheme matching chosen accent
    initParticlesSafe();
  }
}



// ── MAIN INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Clean .html extension from URL pathname
    if (window.location.pathname.endsWith('/index.html')) {
      const cleanPath = window.location.pathname.replace(/\/index\.html$/, '/');
      window.history.replaceState({}, document.title, cleanPath + window.location.hash + window.location.search);
    }
    
    new ThemeManager();
    new NavigationManager();
    new HeaderScrollManager();
    new ScrollSpyManager();
    new FormManager();
    new ProjectFilterManager();
    new ScrollProgressManager();
    new CookieConsentManager();
    new BackToTopManager();
    new RoleMorpherController();
    new ScrollTimelineTracker();
    new CommandPaletteManager();
    new TerminalController();
    new SplitSyncVisualizer();
    new TechStackHighlightManager();
    window.tooltipManager = new TooltipManager();
    new PerformanceTelemetryTracker();
    new LangGraphVisualizer();
    new ThemeCustomizer();
    
    initCopyEmail();
    new CertificateManager();
    new SkillTabManager();
    new CounterAnimation();
    new MindmapOrb();

    initSkillProgress();
    initCarousels();
    initParticlesSafe();

  } catch(e) { console.error('App init error:', e); }
});