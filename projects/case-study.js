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

  // ── INFOGRAPHIC SIMULATORS ──────────────────────────────
  
  // 1. LangGraph Agent Orchestrator Simulator (CompanyIQ)
  class SubpageLangGraphVisualizer {
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

  // 2. SplitSync Algorithm Simulator (SplitSync)
  class SubpageSplitSyncVisualizer {
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
        if (this.balA) this.balA.innerText = 'Owes $10';
        
        if (this.logEl) {
          this.logEl.classList.remove('success');
          this.logEl.innerText = '[Greedy Alg] Ledger reset to unoptimized circular transactions.';
        }
      }
    }
  }

  // 3. Book Donation Pipeline Simulator (Courage Library)
  class BookPipelineVisualizer {
    constructor() {
      this.btn = document.getElementById('btnRunBookPipeline');
      this.statusTag = document.getElementById('bookPipelineStatus');
      this.logEl = document.getElementById('bookPipelineLog');
      this.stepDonation = document.getElementById('stepDonation');
      this.stepAudit = document.getElementById('stepAudit');
      this.stepRegistry = document.getElementById('stepRegistry');
      this.flow1 = document.getElementById('bookFlow1');
      this.flow2 = document.getElementById('bookFlow2');
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
      this.btn.innerText = 'Processing...';
      this.btn.disabled = true;
      
      const nodes = [this.stepDonation, this.stepAudit, this.stepRegistry];
      nodes.forEach(n => {
        if (n) {
          n.classList.remove('active', 'completed');
          n.querySelector('.agent-status').innerText = 'Pending';
        }
      });
      if (this.flow1) this.flow1.classList.remove('active');
      if (this.flow2) this.flow2.classList.remove('active');
      
      this.statusTag.innerText = 'Donation node active';
      if (this.stepDonation) {
        this.stepDonation.classList.add('active');
        this.stepDonation.querySelector('.agent-status').innerText = 'Receiving';
      }
      if (this.logEl) {
        this.logEl.classList.remove('success');
        this.logEl.innerText = '[Donation Ingest] Creating transient donor record and printing receipt...';
      }
      
      setTimeout(() => {
        if (this.stepDonation) {
          this.stepDonation.classList.remove('active');
          this.stepDonation.classList.add('completed');
          this.stepDonation.querySelector('.agent-status').innerText = 'Received';
        }
        if (this.flow1) this.flow1.classList.add('active');
        
        this.statusTag.innerText = 'Quality check active';
        if (this.stepAudit) {
          this.stepAudit.classList.add('active');
          this.stepAudit.querySelector('.agent-status').innerText = 'Checking';
        }
        if (this.logEl) {
          this.logEl.innerText = '[Quality Audit] Inspecting binding condition, cataloging category and tags...';
        }
      }, 1200);
      
      setTimeout(() => {
        if (this.stepAudit) {
          this.stepAudit.classList.remove('active');
          this.stepAudit.classList.add('completed');
          this.stepAudit.querySelector('.agent-status').innerText = 'Verified';
        }
        if (this.flow2) this.flow2.classList.add('active');
        
        this.statusTag.innerText = 'Registry storage active';
        if (this.stepRegistry) {
          this.stepRegistry.classList.add('active');
          this.stepRegistry.querySelector('.agent-status').innerText = 'Saving';
        }
        if (this.logEl) {
          this.logEl.innerText = '[Supabase Registry] Committing ledger record to global library index...';
        }
      }, 2400);
      
      setTimeout(() => {
        if (this.stepRegistry) {
          this.stepRegistry.classList.remove('active');
          this.stepRegistry.classList.add('completed');
          this.stepRegistry.querySelector('.agent-status').innerText = 'Committed';
        }
        this.statusTag.innerText = 'Allocation successful';
        this.btn.innerText = 'Simulate Book Flow';
        this.btn.disabled = false;
        this.running = false;
        if (this.logEl) {
          this.logEl.classList.add('success');
          this.logEl.innerText = '[System] Book allocated. Dispatched auto-notification to Kanpur aspirants.';
        }
      }, 3600);
    }
  }

  // 4. Deadline Hero Timeline Rescue Simulator (Deadline Hero AI)
  class DeadlineHeroVisualizer {
    constructor() {
      this.btn = document.getElementById('btnRunDeadlineHero');
      this.statusTag = document.getElementById('deadlineHeroStatus');
      this.logEl = document.getElementById('deadlineHeroLog');
      this.stepController = document.getElementById('stepController');
      this.stepRisk = document.getElementById('stepRisk');
      this.stepRescue = document.getElementById('stepRescue');
      this.flow1 = document.getElementById('deadlineFlow1');
      this.flow2 = document.getElementById('deadlineFlow2');
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
      this.btn.innerText = 'Calculating...';
      this.btn.disabled = true;
      
      const nodes = [this.stepController, this.stepRisk, this.stepRescue];
      nodes.forEach(n => {
        if (n) {
          n.classList.remove('active', 'completed');
          n.querySelector('.agent-status').innerText = 'Pending';
        }
      });
      if (this.flow1) this.flow1.classList.remove('active');
      if (this.flow2) this.flow2.classList.remove('active');
      
      this.statusTag.innerText = 'Controller active';
      if (this.stepController) {
        this.stepController.classList.add('active');
        this.stepController.querySelector('.agent-status').innerText = 'Parsing';
      }
      if (this.logEl) {
        this.logEl.classList.remove('success');
        this.logEl.innerText = '[Mission Controller] Parsing schedule matrix and task dependencies...';
      }
      
      setTimeout(() => {
        if (this.stepController) {
          this.stepController.classList.remove('active');
          this.stepController.classList.add('completed');
          this.stepController.querySelector('.agent-status').innerText = 'Parsed';
        }
        if (this.flow1) this.flow1.classList.add('active');
        
        this.statusTag.innerText = 'Risk analyzer active';
        if (this.stepRisk) {
          this.stepRisk.classList.add('active');
          this.stepRisk.querySelector('.agent-status').innerText = 'Modeling';
        }
        if (this.logEl) {
          this.logEl.innerText = '[Risk Agent] Calculating probability curves and predicting task slips...';
        }
      }, 1200);
      
      setTimeout(() => {
        if (this.stepRisk) {
          this.stepRisk.classList.remove('active');
          this.stepRisk.classList.add('completed');
          this.stepRisk.querySelector('.agent-status').innerText = 'Reported';
        }
        if (this.flow2) this.flow2.classList.add('active');
        
        this.statusTag.innerText = 'Rescue planner active';
        if (this.stepRescue) {
          this.stepRescue.classList.add('active');
          this.stepRescue.querySelector('.agent-status').innerText = 'Solving';
        }
        if (this.logEl) {
          this.logEl.innerText = '[Rescue Agent] Building dynamic focus list and mitigation strategies...';
        }
      }, 2400);
      
      setTimeout(() => {
        if (this.stepRescue) {
          this.stepRescue.classList.remove('active');
          this.stepRescue.classList.add('completed');
          this.stepRescue.querySelector('.agent-status').innerText = 'Generated';
        }
        this.statusTag.innerText = 'Rescue plan ready';
        this.btn.innerText = 'Simulate Timeline Rescue';
        this.btn.disabled = false;
        this.running = false;
        if (this.logEl) {
          this.logEl.classList.add('success');
          this.logEl.innerText = '[Gemini AI] Recalculated timeline risk. Reallocated buffer times successfully.';
        }
      }, 3600);
    }
  }

  // 5. CNTS Onboarding Pipeline Simulator (CNTS Platform)
  class CntsPipelineVisualizer {
    constructor() {
      this.btn = document.getElementById('btnRunCntsPipeline');
      this.statusTag = document.getElementById('cntsPipelineStatus');
      this.logEl = document.getElementById('cntsPipelineLog');
      this.stepOnboarding = document.getElementById('stepOnboarding');
      this.stepGrading = document.getElementById('stepGrading');
      this.stepAnalytics = document.getElementById('stepAnalytics');
      this.flow1 = document.getElementById('cntsFlow1');
      this.flow2 = document.getElementById('cntsFlow2');
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
      this.btn.innerText = 'Onboarding...';
      this.btn.disabled = true;
      
      const nodes = [this.stepOnboarding, this.stepGrading, this.stepAnalytics];
      nodes.forEach(n => {
        if (n) {
          n.classList.remove('active', 'completed');
          n.querySelector('.agent-status').innerText = 'Pending';
        }
      });
      if (this.flow1) this.flow1.classList.remove('active');
      if (this.flow2) this.flow2.classList.remove('active');
      
      this.statusTag.innerText = 'Ingestion active';
      if (this.stepOnboarding) {
        this.stepOnboarding.classList.add('active');
        this.stepOnboarding.querySelector('.agent-status').innerText = 'Loading';
      }
      if (this.logEl) {
        this.logEl.classList.remove('success');
        this.logEl.innerText = '[Data Ingest] Uploading student Excel matrix and generating tracking IDs...';
      }
      
      setTimeout(() => {
        if (this.stepOnboarding) {
          this.stepOnboarding.classList.remove('active');
          this.stepOnboarding.classList.add('completed');
          this.stepOnboarding.querySelector('.agent-status').innerText = 'Loaded';
        }
        if (this.flow1) this.flow1.classList.add('active');
        
        this.statusTag.innerText = 'Grading active';
        if (this.stepGrading) {
          this.stepGrading.classList.add('active');
          this.stepGrading.querySelector('.agent-status').innerText = 'Scoring';
        }
        if (this.logEl) {
          this.logEl.innerText = '[Grading Engine] Aligning multiple-choice sheets and calculating marks...';
        }
      }, 1200);
      
      setTimeout(() => {
        if (this.stepGrading) {
          this.stepGrading.classList.remove('active');
          this.stepGrading.classList.add('completed');
          this.stepGrading.querySelector('.agent-status').innerText = 'Scored';
        }
        if (this.flow2) this.flow2.classList.add('active');
        
        this.statusTag.innerText = 'Podium analysis active';
        if (this.stepAnalytics) {
          this.stepAnalytics.classList.add('active');
          this.stepAnalytics.querySelector('.agent-status').innerText = 'Analyzing';
        }
        if (this.logEl) {
          this.logEl.innerText = '[Roster Leaderboard] Generating podial metrics, percentiles, and ranks...';
        }
      }, 2400);
      
      setTimeout(() => {
        if (this.stepAnalytics) {
          this.stepAnalytics.classList.remove('active');
          this.stepAnalytics.classList.add('completed');
          this.stepAnalytics.querySelector('.agent-status').innerText = 'Published';
        }
        this.statusTag.innerText = 'Results published';
        this.btn.innerText = 'Simulate Onboarding';
        this.btn.disabled = false;
        this.running = false;
        if (this.logEl) {
          this.logEl.classList.add('success');
          this.logEl.innerText = '[System] Database sync complete. Auto-notified school principals & dispatched admit cards.';
        }
      }, 3600);
    }
  }

  // 6. PCB Defect Ingestion & Classification Pipeline Simulator (PCB Defect Detector)
  class PcbPipelineVisualizer {
    constructor() {
      this.btn = document.getElementById('btnRunPcbPipeline');
      this.statusTag = document.getElementById('pcbPipelineStatus');
      this.logEl = document.getElementById('pcbPipelineLog');
      this.stepAlignment = document.getElementById('stepAlignment');
      this.stepSubtract = document.getElementById('stepSubtract');
      this.stepClassifier = document.getElementById('stepClassifier');
      this.flow1 = document.getElementById('pcbFlow1');
      this.flow2 = document.getElementById('pcbFlow2');
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
      this.btn.innerText = 'Inspecting...';
      this.btn.disabled = true;
      
      const nodes = [this.stepAlignment, this.stepSubtract, this.stepClassifier];
      nodes.forEach(n => {
        if (n) {
          n.classList.remove('active', 'completed');
          n.querySelector('.agent-status').innerText = 'Pending';
        }
      });
      if (this.flow1) this.flow1.classList.remove('active');
      if (this.flow2) this.flow2.classList.remove('active');
      
      this.statusTag.innerText = 'Alignment active';
      if (this.stepAlignment) {
        this.stepAlignment.classList.add('active');
        this.stepAlignment.querySelector('.agent-status').innerText = 'Aligning';
      }
      if (this.logEl) {
        this.logEl.classList.remove('success');
        this.logEl.innerText = '[SIFT Feature Engine] Aligning PCB image orientation using homography matrices...';
      }
      
      setTimeout(() => {
        if (this.stepAlignment) {
          this.stepAlignment.classList.remove('active');
          this.stepAlignment.classList.add('completed');
          this.stepAlignment.querySelector('.agent-status').innerText = 'Aligned';
        }
        if (this.flow1) this.flow1.classList.add('active');
        
        this.statusTag.innerText = 'Subtraction active';
        if (this.stepSubtract) {
          this.stepSubtract.classList.add('active');
          this.stepSubtract.querySelector('.agent-status').innerText = 'Subtracting';
        }
        if (this.logEl) {
          this.logEl.innerText = '[Matrix Subtraction] Running pixel-delta difference on NumPy arrays...';
        }
      }, 1200);
      
      setTimeout(() => {
        if (this.stepSubtract) {
          this.stepSubtract.classList.remove('active');
          this.stepSubtract.classList.add('completed');
          this.stepSubtract.querySelector('.agent-status').innerText = 'Highlighted';
        }
        if (this.flow2) this.flow2.classList.add('active');
        
        this.statusTag.innerText = 'Classification active';
        if (this.stepClassifier) {
          this.stepClassifier.classList.add('active');
          this.stepClassifier.querySelector('.agent-status').innerText = 'Evaluating';
        }
        if (this.logEl) {
          this.logEl.innerText = '[TensorFlow CNN] Running classification convolutions on highlighted pixel deltas...';
        }
      }, 2400);
      
      setTimeout(() => {
        if (this.stepClassifier) {
          this.stepClassifier.classList.remove('active');
          this.stepClassifier.classList.add('completed');
          this.stepClassifier.querySelector('.agent-status').innerText = 'Classified';
        }
        this.statusTag.innerText = 'Inspection ready';
        this.btn.innerText = 'Simulate PCB Inspection';
        this.btn.disabled = false;
        this.running = false;
        if (this.logEl) {
          this.logEl.classList.add('success');
          this.logEl.innerText = '[CNN Model] Inspection complete. Defect classified: Missing Capacitor (98.6% confidence).';
        }
      }, 3600);
    }
  }

  // Instantiate subpage visualizers
  new SubpageLangGraphVisualizer();
  new SubpageSplitSyncVisualizer();
  new BookPipelineVisualizer();
  new DeadlineHeroVisualizer();
  new CntsPipelineVisualizer();
  new PcbPipelineVisualizer();
});
