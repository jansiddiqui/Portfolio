document.addEventListener('DOMContentLoaded', () => {
  // 1. Inject Theme Toggle Button if not exists
  if (!document.getElementById('themeBtn')) {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.id = 'themeBtn';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.innerHTML = '<i class="fas fa-sun"></i>';
    document.body.appendChild(btn);

    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    btn.querySelector('i').className = current === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

    btn.addEventListener('click', () => {
      const t = document.documentElement.getAttribute('data-theme');
      const n = t === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', n);
      localStorage.setItem('theme', n);
      btn.querySelector('i').className = n === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    });
  }

  // 3. Setup Lightbox Modal for Screenshots
  const lightbox = document.createElement('div');
  lightbox.className = 'cs-lightbox';
  lightbox.setAttribute('aria-hidden', 'true');
  const lightboxImg = document.createElement('img');
  lightbox.appendChild(lightboxImg);
  document.body.appendChild(lightbox);

  document.querySelectorAll('.carousel-container img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('active');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });

  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
    }
  });

  // 2. Initialize Slide Carousels in Subpages
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

    if (dotsContainer && dotsContainer.children.length === 0) {
      images.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('carousel-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });
    }

    const dots = dotsContainer ? dotsContainer.querySelectorAll('.carousel-dot') : [];

    function updateCarousel() {
      images.forEach((img, i) => img.classList.toggle('active', i === currentIndex));
      if (dots.length) dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
      thumbnails.forEach((thumb, i) => thumb.classList.toggle('active', i === currentIndex));
    }
    function goToSlide(index) { currentIndex = index; updateCarousel(); }
    function nextSlide() { currentIndex = (currentIndex + 1) % images.length; updateCarousel(); }
    function prevSlide() { currentIndex = (currentIndex - 1 + images.length) % images.length; updateCarousel(); }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

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

  // 4. Auto-generate Sticky Table of Contents
  const sections = document.querySelectorAll('.cs-section');
  if (sections.length > 0) {
    const toc = document.createElement('nav');
    toc.className = 'cs-toc';
    toc.setAttribute('aria-label', 'Table of contents');
    
    const tocTitle = document.createElement('div');
    tocTitle.className = 'cs-toc-title';
    tocTitle.textContent = 'Directory';
    toc.appendChild(tocTitle);
    
    const ul = document.createElement('ul');
    sections.forEach((sec, i) => {
      if (!sec.id) sec.id = `cs-sec-${i}`;
      
      const labelEl = sec.querySelector('.cs-section-label');
      let labelText = labelEl ? labelEl.textContent : `Section ${i + 1}`;
      labelText = labelText.replace(/^\d+\s*—\s*/, ''); // Remove leading indexes (01 — )
      
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${sec.id}`;
      a.textContent = labelText;
      a.addEventListener('click', e => {
        e.preventDefault();
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, null, `#${sec.id}`);
      });
      li.appendChild(a);
      ul.appendChild(li);
    });
    toc.appendChild(ul);
    document.body.appendChild(toc);
    
    const tocLinks = ul.querySelectorAll('a');
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, observerOptions);
    
    sections.forEach(sec => observer.observe(sec));
  }
});
