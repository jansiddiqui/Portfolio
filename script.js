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
    this.init();
  }
  init() {
    try {
      this.navbarToggle.addEventListener('click', () => this.toggleMenu());
      this.navLinks.forEach(link => link.addEventListener('click', () => this.closeMenu()));
    } catch(e) { console.error('Nav init error:', e); }
  }
  toggleMenu() {
    try {
      const isExpanded = this.navbarToggle.getAttribute('aria-expanded') === 'true';
      this.navbarToggle.setAttribute('aria-expanded', !isExpanded);
      this.navList.classList.toggle('open');
      this.navbarToggle.classList.toggle('open');
    } catch(e) { console.error('Menu toggle error:', e); }
  }
  closeMenu() {
    this.navbarToggle.setAttribute('aria-expanded', 'false');
    this.navList.classList.remove('open');
    this.navbarToggle.classList.remove('open');
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
// UPDATED: supports multi-category data-category values e.g. "ai hackathon"
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
        // support space-separated multi-category: "ai hackathon"
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

// ── SCROLL PROGRESS ───────────────────────────────────────
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

// ── CUSTOM CURSOR ─────────────────────────────────────────
class CustomCursorManager {
  constructor() {
    this.cursor = document.querySelector('.custom-cursor');
    this.init();
  }
  init() {
    try {
      document.addEventListener('mousemove', (e) => { this.cursor.style.left = e.clientX + 'px'; this.cursor.style.top = e.clientY + 'px'; });
      document.addEventListener('mousedown', () => this.cursor.classList.add('active'));
      document.addEventListener('mouseup',   () => this.cursor.classList.remove('active'));
      document.querySelectorAll('a, button, input, textarea').forEach(el => {
        el.addEventListener('mouseenter', () => this.cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => this.cursor.classList.remove('active'));
      });
    } catch(e) { console.error('Custom cursor init error:', e); }
  }
}

// ── SKILL CARD MOUSE EFFECT ───────────────────────────────
function initSkillCardMouseEffect() {
  document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
      card.style.setProperty('--mouse-y', `${((e.clientY - rect.top)  / rect.height) * 100}%`);
    });
  });
}

// ── SKILL PROGRESS ANIMATION ──────────────────────────────
function initSkillProgress() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar      = entry.target.querySelector('.skill-progress');
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

    images.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.classList.add('carousel-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.carousel-dot');

    function updateCarousel() {
      images.forEach((img, i) => img.classList.toggle('active', i === currentIndex));
      dots.forEach((dot, i)   => dot.classList.toggle('active', i === currentIndex));
    }
    function goToSlide(index) { currentIndex = index; updateCarousel(); }
    function nextSlide() { currentIndex = (currentIndex + 1) % images.length; updateCarousel(); }
    function prevSlide() { currentIndex = (currentIndex - 1 + images.length) % images.length; updateCarousel(); }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    let autoplayInterval = setInterval(nextSlide, 5000);
    carousel.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    carousel.addEventListener('mouseleave', () => { autoplayInterval = setInterval(nextSlide, 5000); });
  });
}

// ── TYPEWRITER ────────────────────────────────────────────
function initTypewriter() {
  const typewriter = document.querySelector('.typewriter');
  if (!typewriter) return;
  const text     = typewriter.textContent;
  const tempSpan = document.createElement('span');
  tempSpan.style.cssText = 'visibility:hidden;position:absolute;white-space:nowrap';
  tempSpan.style.font    = window.getComputedStyle(typewriter).font;
  tempSpan.textContent   = text;
  document.body.appendChild(tempSpan);
  const textWidth = tempSpan.offsetWidth;
  document.body.removeChild(tempSpan);
  typewriter.style.width = '0';
  typewriter.offsetHeight;
  typewriter.style.width = `${textWidth}px`;
  setTimeout(() => typewriter.classList.add('typing-complete'), 3500);
}

// ── SKILL TABS ────────────────────────────────────────────
class SkillTabManager {
  constructor() {
    this.tabs  = document.querySelectorAll('.skill-tab');
    this.cards = document.querySelectorAll('.skill-card[data-skill-category]');
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
    this.cards.forEach(card => {
      const show = category === 'all' || card.getAttribute('data-skill-category') === category;
      card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      if (show) {
        card.classList.remove('skill-hidden');
        requestAnimationFrame(() => { card.style.opacity = '1'; card.style.transform = 'scale(1)'; });
      } else {
        card.style.opacity = '0'; card.style.transform = 'scale(0.9)';
        setTimeout(() => card.classList.add('skill-hidden'), 280);
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

// ── MINDMAP ORB ───────────────────────────────────────────
class MindmapOrb {
  constructor() {
    this.canvas = document.getElementById('mindmapCanvas');
    if (!this.canvas) return;
    this.ctx   = this.canvas.getContext('2d');
    this.nodes = [];
    this.init();
  }
  init() {
    this.resize();
    window.addEventListener('resize', debounce(() => this.resize(), 200));
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
    const labels = ['DSA','AI/ML','Web Dev','Node.js','Supabase','Python','C++','Open Source'];
    const radius = Math.min(this.canvas.width, this.canvas.height) * 0.35;
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
  animate() {
    const ctx = this.ctx;
    const t   = Date.now();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.nodes.forEach(n => {
      n.x = n.baseX + Math.cos(t * n.speed + n.offset)       * n.floatR;
      n.y = n.baseY + Math.sin(t * n.speed * 1.3 + n.offset) * n.floatR;
    });
    this.nodes.forEach(n => {
      ctx.beginPath(); ctx.moveTo(this.cx, this.cy); ctx.lineTo(n.x, n.y);
      ctx.strokeStyle = `rgba(56,189,248,${0.1 + 0.06 * Math.sin(t * 0.001 + n.offset)})`;
      ctx.lineWidth = 0.8; ctx.stroke();
    });
    const maxDist = Math.min(this.canvas.width, this.canvas.height) * 0.38;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const d = Math.hypot(this.nodes[i].x - this.nodes[j].x, this.nodes[i].y - this.nodes[j].y);
        if (d < maxDist) {
          ctx.beginPath(); ctx.moveTo(this.nodes[i].x, this.nodes[i].y); ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
          ctx.strokeStyle = `rgba(56,189,248,${(1 - d / maxDist) * 0.07})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
    const pulse = 1 + 0.04 * Math.sin(t * 0.002);
    const orbR  = Math.min(this.canvas.width, this.canvas.height) * 0.06 * pulse;
    const grad  = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, orbR * 2.2);
    grad.addColorStop(0, 'rgba(56,189,248,0.18)'); grad.addColorStop(1, 'rgba(56,189,248,0)');
    ctx.beginPath(); ctx.arc(this.cx, this.cy, orbR * 2.2, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.arc(this.cx, this.cy, orbR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(56,189,248,0.12)'; ctx.strokeStyle = 'rgba(56,189,248,0.5)'; ctx.lineWidth = 1; ctx.fill(); ctx.stroke();
    this.nodes.forEach(n => {
      ctx.beginPath(); ctx.arc(n.x, n.y, 4, 0, Math.PI * 2); ctx.fillStyle = 'rgba(56,189,248,0.6)'; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, Math.PI * 2); ctx.fillStyle = 'rgba(56,189,248,1)';   ctx.fill();
    });
    requestAnimationFrame(() => this.animate());
  }
}

// ── PARTICLES ─────────────────────────────────────────────
function initParticlesSafe() {
  if (typeof particlesJS === 'undefined') {
    console.error("particles.js not loaded");
    return;
  }

  const el = document.getElementById('particles-js');
  if (!el) {
    console.error("particles-js div not found");
    return;
  }

  particlesJS('particles-js', {
    particles: {
      number: { value: 80 },
      color: { value: "#38bdf8" },
      shape: { type: "circle" },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 140,
        color: "#38bdf8",
        opacity: 0.4,
        width: 1
      },
      move: { enable: true, speed: 3 }
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

// ── MAIN INIT ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  try {
    new ThemeManager();
    new NavigationManager();
    new FormManager();
    new ProjectFilterManager();
    new ScrollProgressManager();
    new CookieConsentManager();
    new BackToTopManager();
    new CustomCursorManager();
    new CertificateManager();
    new SkillTabManager();
    new CounterAnimation();
    new MindmapOrb();

    initSkillCardMouseEffect();
    initSkillProgress();
    initCarousels();
    initTypewriter();
    initParticlesSafe();

  } catch(e) { console.error('App init error:', e); }
});