// Constants
const THEME_KEY = 'theme';
const COOKIES_KEY = 'cookiesAccepted';
const PARTICLE_CONFIG = {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: '#38bdf8' },
    shape: { type: 'circle' },
    opacity: { value: 0.5, random: false },
    size: { value: 3, random: true },
    line_linked: {
      enable: true,
      distance: 150,
      color: '#38bdf8',
      opacity: 0.4,
      width: 1
    },
    move: {
      enable: true,
      speed: 6,
      direction: 'none',
      random: false,
      straight: false,
      out_mode: 'out',
      bounce: false
    }
  },
  interactivity: {
    detect_on: 'canvas',
    events: {
      onhover: { enable: true, mode: 'repulse' },
      onclick: { enable: true, mode: 'push' },
      resize: true
    }
  },
  retina_detect: true
};

// Utility Functions
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Theme Management
class ThemeManager {
  constructor() {
    this.themeToggle = document.querySelector('.theme-toggle');
    this.themeIcon = this.themeToggle.querySelector('i');
    this.savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    this.init();
  }

  init() {
    try {
      document.documentElement.setAttribute('data-theme', this.savedTheme);
      this.updateThemeIcon(this.savedTheme);
      this.themeToggle.addEventListener('click', () => this.toggleTheme());
    } catch (error) {
      console.error('Theme initialization error:', error);
    }
  }

  toggleTheme() {
    try {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
      this.updateThemeIcon(newTheme);
    } catch (error) {
      console.error('Theme toggle error:', error);
    }
  }

  updateThemeIcon(theme) {
    this.themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// Navigation Management
class NavigationManager {
  constructor() {
    this.navbarToggle = document.querySelector('.navbar-toggle');
    this.navList = document.querySelector('nav ul');
    this.navLinks = document.querySelectorAll('nav ul li a');
    this.init();
  }

  init() {
    try {
      this.navbarToggle.addEventListener('click', () => this.toggleMenu());
      this.navLinks.forEach(link => {
        link.addEventListener('click', () => this.closeMenu());
      });
    } catch (error) {
      console.error('Navigation initialization error:', error);
    }
  }

  toggleMenu() {
    try {
      const isExpanded = this.navbarToggle.getAttribute('aria-expanded') === 'true';
      this.navbarToggle.setAttribute('aria-expanded', !isExpanded);
      this.navList.classList.toggle('open');
    } catch (error) {
      console.error('Menu toggle error:', error);
    }
  }

  closeMenu() {
    this.navbarToggle.setAttribute('aria-expanded', 'false');
    this.navList.classList.remove('open');
  }
}

// Form Management
class FormManager {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.formGroups = this.form.querySelectorAll('.form-group');
    this.submitBtn = this.form.querySelector('.submit-btn');
    this.formMessage = this.form.querySelector('.form-message');
    this.init();
  }

  init() {
    try {
      this.formGroups.forEach(group => this.setupFormGroup(group));
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    } catch (error) {
      console.error('Form initialization error:', error);
    }
  }

  setupFormGroup(group) {
    const input = group.querySelector('input, textarea');
    const errorMessage = group.querySelector('.error-message');

    input.addEventListener('input', () => this.validateField(input, group, errorMessage));
    input.addEventListener('blur', () => this.validateField(input, group, errorMessage));
  }

  validateField(input, group, errorMessage) {
    try {
      const value = input.value.trim();
      let isValid = true;

      if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
        errorMessage.textContent = isValid ? '' : 'Please enter a valid email address';
      } else if (input.type === 'text') {
        isValid = value.length >= 2;
        errorMessage.textContent = isValid ? '' : 'Please enter at least 2 characters';
      } else if (input.tagName === 'TEXTAREA') {
        isValid = value.length >= 10;
        errorMessage.textContent = isValid ? '' : 'Please enter at least 10 characters';
      }

      group.classList.toggle('error', !isValid);
      group.classList.toggle('success', isValid && value !== '');
      return isValid;
    } catch (error) {
      console.error('Field validation error:', error);
      return false;
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    try {
      let isValid = true;
      this.formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        const errorMessage = group.querySelector('.error-message');
        if (!this.validateField(input, group, errorMessage)) {
          isValid = false;
        }
      });

      if (!isValid) return;

      this.submitBtn.disabled = true;
      this.submitBtn.textContent = 'Sending...';

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      this.formMessage.textContent = 'Message sent successfully!';
      this.formMessage.className = 'form-message success';
      this.form.reset();
      this.formGroups.forEach(group => group.classList.remove('success'));
    } catch (error) {
      console.error('Form submission error:', error);
      this.formMessage.textContent = 'Failed to send message. Please try again.';
      this.formMessage.className = 'form-message error';
    } finally {
      this.submitBtn.disabled = false;
      this.submitBtn.textContent = 'Send Message';
    }
  }
}

// Project Filter Management
class ProjectFilterManager {
  constructor() {
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.projectCards = document.querySelectorAll('#projects .project-card');
    this.projectsGrid = document.querySelector('#projects .projects-grid');
    this.init();
  }

  init() {
    try {
      this.filterButtons.forEach(button => {
        button.addEventListener('click', () => this.filterProjects(button));
      });
    } catch (error) {
      console.error('Project filter initialization error:', error);
    }
  }

  filterProjects(button) {
    try {
      // Update button states
      this.filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');

      const filterValue = button.getAttribute('data-filter');
      
      // Add transition class to grid
      this.projectsGrid.style.transition = 'all 0.5s ease';
      
      // Filter projects with animation
      this.projectCards.forEach(card => {
        if (filterValue === 'all') {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          setTimeout(() => {
            card.classList.remove('hidden');
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 50);
        } else {
          const cardCategory = card.getAttribute('data-category');
          if (cardCategory === filterValue) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            setTimeout(() => {
              card.classList.remove('hidden');
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            setTimeout(() => {
              card.classList.add('hidden');
            }, 300);
          }
        }
      });

      // Remove transition after animation
      setTimeout(() => {
        this.projectsGrid.style.transition = '';
      }, 500);

    } catch (error) {
      console.error('Project filtering error:', error);
    }
  }
}

// Scroll Progress Indicator
class ScrollProgressManager {
  constructor() {
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'scroll-progress';
    document.body.appendChild(this.progressBar);
    this.init();
  }

  init() {
    try {
      window.addEventListener('scroll', debounce(() => this.updateProgress(), 10));
    } catch (error) {
      console.error('Scroll progress initialization error:', error);
    }
  }

  updateProgress() {
    try {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = (scrolled / documentHeight) * 100;
      this.progressBar.style.transform = `scaleX(${progress / 100})`;
    } catch (error) {
      console.error('Progress update error:', error);
    }
  }
}

// Cookie Consent Management
class CookieConsentManager {
  constructor() {
    this.banner = document.querySelector('.cookie-consent');
    this.acceptButton = this.banner.querySelector('button');
    this.init();
  }

  init() {
    try {
      if (!localStorage.getItem(COOKIES_KEY)) {
        this.showBanner();
        this.acceptButton.addEventListener('click', () => this.acceptCookies());
      }
    } catch (error) {
      console.error('Cookie consent initialization error:', error);
    }
  }

  showBanner() {
    setTimeout(() => {
      this.banner.classList.add('show');
    }, 1000);
  }

  acceptCookies() {
    try {
      localStorage.setItem(COOKIES_KEY, 'true');
      this.banner.classList.remove('show');
    } catch (error) {
      console.error('Cookie acceptance error:', error);
    }
  }
}

// Back to Top Button Management
class BackToTopManager {
  constructor() {
    this.button = document.querySelector('.back-to-top');
    this.init();
  }

  init() {
    try {
      window.addEventListener('scroll', debounce(() => this.toggleButton(), 100));
      this.button.addEventListener('click', () => this.scrollToTop());
    } catch (error) {
      console.error('Back to top initialization error:', error);
    }
  }

  toggleButton() {
    try {
      if (window.scrollY > 300) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    } catch (error) {
      console.error('Button toggle error:', error);
    }
  }

  scrollToTop() {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } catch (error) {
      console.error('Scroll to top error:', error);
    }
  }
}

// Custom Cursor Management
class CustomCursorManager {
  constructor() {
    this.cursor = document.querySelector('.custom-cursor');
    this.init();
  }

  init() {
    try {
      document.addEventListener('mousemove', (e) => this.moveCursor(e));
      document.addEventListener('mousedown', () => this.cursor.classList.add('active'));
      document.addEventListener('mouseup', () => this.cursor.classList.remove('active'));
      
      // Add hover effect for interactive elements
      const interactiveElements = document.querySelectorAll('a, button, input, textarea');
      interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => this.cursor.classList.add('active'));
        element.addEventListener('mouseleave', () => this.cursor.classList.remove('active'));
      });
    } catch (error) {
      console.error('Custom cursor initialization error:', error);
    }
  }

  moveCursor(e) {
    try {
      this.cursor.style.left = e.clientX + 'px';
      this.cursor.style.top = e.clientY + 'px';
    } catch (error) {
      console.error('Cursor movement error:', error);
    }
  }
}

// Skill Card Mouse Movement Effect
document.querySelectorAll('.skill-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  });
});

// Skill Progress Animation
document.addEventListener('DOMContentLoaded', function() {
  const skillCards = document.querySelectorAll('.skill-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const progressBar = entry.target.querySelector('.skill-progress');
        const progress = progressBar.getAttribute('data-progress');
        
        // Reset width to 0
        progressBar.style.width = '0%';
        
        // Force reflow
        progressBar.offsetHeight;
        
        // Animate to final width with a slight delay
        setTimeout(() => {
          progressBar.style.width = `${progress}%`;
        }, 100);
        
        // Stop observing after animation
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px'
  });

  // Observe each skill card
  skillCards.forEach(card => {
    observer.observe(card);
  });
});

// Certificate Management
class CertificateManager {
  constructor() {
    this.certificateCards = document.querySelectorAll('.certificate-card');
    this.init();
  }

  init() {
    try {
      this.certificateCards.forEach(card => {
        card.addEventListener('click', () => this.handleCertificateClick(card));
      });
    } catch (error) {
      console.error('Certificate initialization error:', error);
    }
  }

  handleCertificateClick(card) {
    try {
      const img = card.querySelector('img');
      const imgSrc = img.getAttribute('src');
      const imgAlt = img.getAttribute('alt');
      
      // Create modal container
      const modal = document.createElement('div');
      modal.className = 'certificate-modal';
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <img src="${imgSrc}" alt="${imgAlt}">
        </div>
      `;

      // Add modal to body
      document.body.appendChild(modal);

      // Add event listeners
      const closeBtn = modal.querySelector('.close-modal');
      closeBtn.addEventListener('click', () => this.closeModal(modal));
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal);
        }
      });

      // Add escape key listener
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeModal(modal);
        }
      });

      // Show modal with animation
      setTimeout(() => {
        modal.classList.add('show');
      }, 10);
    } catch (error) {
      console.error('Certificate click handling error:', error);
    }
  }

  closeModal(modal) {
    try {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.remove();
      }, 300);
    } catch (error) {
      console.error('Modal closing error:', error);
    }
  }
}

// Event Image Carousel
document.addEventListener('DOMContentLoaded', function() {
  const carousels = document.querySelectorAll('.event-image-carousel');
  
  carousels.forEach(carousel => {
    const container = carousel.querySelector('.carousel-container');
    const images = container.querySelectorAll('img');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    
    let currentIndex = 0;
    
    // Create dots
    images.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('carousel-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      dotsContainer.appendChild(dot);
    });
    
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    
    function updateCarousel() {
      // Update images
      images.forEach((img, index) => {
        img.classList.toggle('active', index === currentIndex);
      });
      
      // Update dots
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }
    
    function goToSlide(index) {
      currentIndex = index;
      updateCarousel();
    }
    
    function nextSlide() {
      currentIndex = (currentIndex + 1) % images.length;
      updateCarousel();
    }
    
    function prevSlide() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateCarousel();
    }
    
    // Event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Auto-play
    let autoplayInterval = setInterval(nextSlide, 5000);
    
    // Pause on hover
    carousel.addEventListener('mouseenter', () => {
      clearInterval(autoplayInterval);
    });
    
    carousel.addEventListener('mouseleave', () => {
      autoplayInterval = setInterval(nextSlide, 5000);
    });
  });
});

// Contact Form Handler
class ContactFormManager {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.nameInput = document.getElementById('name');
    this.emailInput = document.getElementById('email');
    this.messageInput = document.getElementById('message');
    this.formMessage = document.querySelector('.form-message');
    this.submitButton = this.form.querySelector('.submit-btn');
    
    this.init();
  }

  init() {
    if (!this.form) return;
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    // Show loading state
    const originalButtonText = this.submitButton.textContent;
    this.submitButton.textContent = 'Sending...';
    this.submitButton.disabled = true;

    try {
      // Validate form data
      if (!this.validateForm()) {
        throw new Error('Please fill in all fields correctly');
      }

      // Submit form to Formspree
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: new FormData(this.form),
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        // Show success message
        this.formMessage.textContent = "Thank you! Your message has been sent successfully.";
        this.formMessage.style.color = "var(--success-color)";
        this.form.reset();
      } else {
        throw new Error('Failed to send message');
      }

    } catch (error) {
      console.error("Error sending message:", error);
      this.formMessage.textContent = "Oops! Something went wrong. Please try again later.";
      this.formMessage.style.color = "var(--error-color)";
    }

    // Reset button state
    this.submitButton.textContent = originalButtonText;
    this.submitButton.disabled = false;

    // Clear message after 5 seconds
    setTimeout(() => {
      this.formMessage.textContent = "";
    }, 5000);
  }

  validateForm() {
    let isValid = true;
    
    // Validate name
    if (!this.nameInput.value.trim()) {
      this.nameInput.classList.add('error');
      isValid = false;
    } else {
      this.nameInput.classList.remove('error');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.emailInput.value)) {
      this.emailInput.classList.add('error');
      isValid = false;
    } else {
      this.emailInput.classList.remove('error');
    }

    // Validate message
    if (!this.messageInput.value.trim()) {
      this.messageInput.classList.add('error');
      isValid = false;
    } else {
      this.messageInput.classList.remove('error');
    }

    return isValid;
  }
}

// Typewriter effect
document.addEventListener('DOMContentLoaded', function() {
  const typewriter = document.querySelector('.typewriter');
  if (typewriter) {
    // Get the text content
    const text = typewriter.textContent;
    
    // Create a temporary span to measure the text width
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.style.font = window.getComputedStyle(typewriter).font;
    tempSpan.textContent = text;
    
    // Add the temporary span to the document
    document.body.appendChild(tempSpan);
    
    // Get the width of the text
    const textWidth = tempSpan.offsetWidth;
    
    // Remove the temporary span
    document.body.removeChild(tempSpan);
    
    // Reset the width
    typewriter.style.width = '0';
    
    // Force a reflow
    typewriter.offsetHeight;
    
    // Set the width to the exact text width
    typewriter.style.width = `${textWidth}px`;
    
    // Add class when typing animation is complete
    setTimeout(() => {
      typewriter.classList.add('typing-complete');
    }, 3500); // Match this with the typing animation duration
  }
});

// Initialize all managers
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
    new ContactFormManager();
    
    // Initialize particles.js
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', PARTICLE_CONFIG);
    }
  } catch (error) {
    console.error('Application initialization error:', error);
  }
}); 