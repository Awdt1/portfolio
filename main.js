/* ===================================================
   MAIN.JS — Fashion Portfolio (Aditi)
   Intersection Observer, Sticky Header, Mobile Nav
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ————————————————————————————————————————————
  // 1. HERO TITLE ANIMATION
  // ————————————————————————————————————————————
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    // Small delay to ensure CSS transition works
    setTimeout(() => {
      heroTitle.classList.add('animate');
    }, 200);
  }

  // ————————————————————————————————————————————
  // 2. STAGGERED INTERSECTION OBSERVER
  // ————————————————————————————————————————————
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target); // Only animate once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  // Assign staggered delays
  revealElements.forEach((el, index) => {
    // Group by parent section for staggering within each section
    const parent = el.closest('.section, .contact-section');
    if (parent) {
      const siblings = parent.querySelectorAll('.reveal');
      const localIndex = Array.from(siblings).indexOf(el);
      el.style.transitionDelay = `${localIndex * 0.1}s`;
    }
    revealObserver.observe(el);
  });

  // ————————————————————————————————————————————
  // 3. STICKY HEADER
  // ————————————————————————————————————————————
  const header = document.getElementById('header');
  let lastScroll = 0;

  const handleScroll = () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  };

  // Throttle scroll events
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  // Initial check
  handleScroll();

  // ————————————————————————————————————————————
  // 4. MOBILE NAV TOGGLE
  // ————————————————————————————————————————————
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
      mobileNav.classList.toggle('open');
    });

    // Close nav on link click
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        document.body.classList.remove('nav-open');
        mobileNav.classList.remove('open');
      });
    });
  }

  // ————————————————————————————————————————————
  // 5. SMOOTH SCROLL FOR ANCHOR LINKS
  // ————————————————————————————————————————————
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = header.offsetHeight;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerHeight - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ————————————————————————————————————————————
  // 6. PROJECT CARD TILT EFFECT (subtle)
  // ————————————————————————————————————————————
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -3;
      const rotateY = (x - centerX) / centerX * 3;

      card.style.transform = `translateY(-6px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) perspective(1000px) rotateX(0) rotateY(0)';
    });
  });

  // ————————————————————————————————————————————
  // 7. PARALLAX-STYLE SECTION LABEL
  // ————————————————————————————————————————————
  const sectionLabels = document.querySelectorAll('.section-label');

  window.addEventListener('scroll', () => {
    sectionLabels.forEach(label => {
      const rect = label.getBoundingClientRect();
      const screenCenter = window.innerHeight / 2;
      const offset = (rect.top - screenCenter) * 0.03;
      label.style.transform = `translateX(${offset}px)`;
    });
  });

  // ————————————————————————————————————————————
  // 8. MEMORY LANE GAME
  // ————————————————————————————————————————————
  const memoryGrid = document.getElementById('memory-grid');
  const movesDisplay = document.getElementById('moves-count');
  const missesDisplay = document.getElementById('misses-count');
  const restartBtn = document.getElementById('memory-restart');
  const popupOverlay = document.getElementById('memory-popup');
  const popupMoves = document.getElementById('popup-moves');
  const popupMisses = document.getElementById('popup-misses');
  const playAgainBtn = document.getElementById('play-again-btn');
  const goBackBtn = document.getElementById('go-back-btn');
  const confettiContainer = document.getElementById('confetti-container');

  // 8 image pairs (using random unsplash photos as placeholders)
  const imageData = [
    { id: 1, src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&q=80', label: 'Mountains' },
    { id: 2, src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80', label: 'Portrait' },
    { id: 3, src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&h=300&fit=crop&q=80', label: 'Nature' },
    { id: 4, src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=300&fit=crop&q=80', label: 'Starry Night' },
    { id: 5, src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&h=300&fit=crop&q=80', label: 'Lake View' },
    { id: 6, src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=300&fit=crop&q=80', label: 'Forest' },
    { id: 7, src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop&q=80', label: 'Woodland' },
    { id: 8, src: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&h=300&fit=crop&q=80', label: 'Meadow' }
  ];

  let moves = 0;
  let misses = 0;
  let matchedPairs = 0;
  let flippedTiles = [];
  let lockBoard = false;

  // Fisher-Yates shuffle
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Create tile DOM element
  function createTile(data) {
    const tile = document.createElement('div');
    tile.classList.add('memory-tile');
    tile.dataset.id = data.id;

    tile.innerHTML = `
      <div class="memory-tile-inner">
        <div class="memory-tile-front">
          <span class="memory-tile-question">?</span>
        </div>
        <div class="memory-tile-back">
          <img src="${data.src}" alt="${data.label}" loading="lazy">
          <span class="tile-label">${data.label}</span>
        </div>
      </div>
    `;

    tile.addEventListener('click', () => handleTileClick(tile));
    return tile;
  }

  // Handle tile click
  function handleTileClick(tile) {
    // Ignore clicks when board is locked, tile is already flipped, or already matched
    if (lockBoard) return;
    if (tile.classList.contains('flipped')) return;
    if (tile.classList.contains('matched')) return;

    tile.classList.add('flipped');
    flippedTiles.push(tile);

    if (flippedTiles.length === 2) {
      lockBoard = true;
      moves++;
      movesDisplay.textContent = moves;

      const [tile1, tile2] = flippedTiles;

      if (tile1.dataset.id === tile2.dataset.id) {
        // MATCH!
        setTimeout(() => {
          tile1.classList.add('matched');
          tile2.classList.add('matched');
          matchedPairs++;
          flippedTiles = [];
          lockBoard = false;

          // Check win condition
          if (matchedPairs === 8) {
            setTimeout(() => showCongratulations(), 600);
          }
        }, 400);
      } else {
        // NO MATCH
        misses++;
        missesDisplay.textContent = misses;

        setTimeout(() => {
          tile1.classList.add('no-match');
          tile2.classList.add('no-match');

          setTimeout(() => {
            tile1.classList.remove('flipped', 'no-match');
            tile2.classList.remove('flipped', 'no-match');
            flippedTiles = [];
            lockBoard = false;
          }, 600);
        }, 700);
      }
    }
  }

  // Initialize / Reset the game
  function initGame() {
    moves = 0;
    misses = 0;
    matchedPairs = 0;
    flippedTiles = [];
    lockBoard = false;

    movesDisplay.textContent = '0';
    missesDisplay.textContent = '0';

    // Create pairs and shuffle
    const pairs = shuffle([...imageData, ...imageData]);

    // Clear grid
    memoryGrid.innerHTML = '';

    // Generate tiles
    pairs.forEach(data => {
      memoryGrid.appendChild(createTile(data));
    });
  }

  // Show congratulations popup
  function showCongratulations() {
    popupMoves.textContent = moves;
    popupMisses.textContent = misses;
    popupOverlay.classList.add('active');
    spawnConfetti();
  }

  // Hide popup
  function hidePopup() {
    popupOverlay.classList.remove('active');
  }

  // Confetti effect
  function spawnConfetti() {
    confettiContainer.innerHTML = '';
    const colors = ['#FF4444', '#FFEF00', '#4444FF', '#44FF44', '#FF44FF', '#44FFFF', '#FFFFFF', '#FF8844'];

    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.classList.add('confetti-piece');
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = `${Math.random() * 0.8}s`;
      piece.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
      piece.style.width = `${4 + Math.random() * 6}px`;
      piece.style.height = `${8 + Math.random() * 10}px`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      confettiContainer.appendChild(piece);
    }
  }

  // Event listeners
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      initGame();
    });
  }

  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', () => {
      hidePopup();
      setTimeout(() => initGame(), 300);
    });
  }

  if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
      hidePopup();
    });
  }

  // Start the game on page load
  if (memoryGrid) {
    initGame();
  }

  // ————————————————————————————————————————————
  // 9. GSAP CIRCULAR SKILLS ORBIT
  // ————————————————————————————————————————————
  // Check if GSAP is loaded
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const skillsSection = document.querySelector('.skills-section');
    const skillsOrbit = document.querySelector('.skills-orbit');
    const skillItems = document.querySelectorAll('.skill-item');

    if (skillsSection && skillItems.length > 0) {
      // 1. Initial State: items scaled down and hidden
      gsap.set(skillItems, { scale: 0, opacity: 0 });

      // Calculate radius dynamically based on screen size
      const getRadius = () => {
        if (window.innerWidth < 480) return 130;
        if (window.innerWidth < 768) return 180;
        return 280;
      };
      
      // Main scroll timeline pin
      let orbitTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: skillsSection,
          start: 'top top',
          end: '+=150%', // Pins for 150vh, meaning 1.5 full scrolls
          scrub: 1,      // Smooth scrubbing 
          pin: true,     // Pin the section in place
        }
      });

      // Animate items out from center to form a circle
      skillItems.forEach((item, index) => {
        // 6 items = 360/6 = 60 degrees apart. Start at top (-90deg)
        const angle = (index * 60 - 90) * (Math.PI / 180);
        
        orbitTimeline.to(item, {
          x: () => Math.cos(angle) * getRadius(),
          y: () => Math.sin(angle) * getRadius(),
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "back.out(1.2)" // Slight bounce when scaling up
        }, index * 0.1); // Stagger by 0.1s in the timeline
      });

      // After items are placed, slowly rotate the entire orbit
      // and counter-rotate the items so text stays upright
      orbitTimeline.to(skillsOrbit, {
        rotation: 180, // Rotate a half circle while scrolling
        duration: 2,
        ease: "none"
      }, 0.5); // Start rotating slightly after placement begins
      
      skillItems.forEach(item => {
        orbitTimeline.to(item, {
          rotation: -180, // Counter rotate
          duration: 2,
          ease: "none"
        }, 0.5);
      });
      
      // Force refresh ScrollTrigger on resize mapping to new radii
      window.addEventListener("resize", () => {
        ScrollTrigger.refresh();
      });
    }

    // Modal Interaction Logic
    const skillData = {
      photography: {
        title: "Photography",
        icon: "📸",
        skills: ["Commercial", "Street", "Portrait", "Editorial", "E-commerce", "Wildlife"]
      },
      styling: {
        title: "Styling & Art Direction",
        icon: "✨",
        skills: ["Window Display", "Product Styling", "Food Styling", "Merchandising"]
      },
      writing: {
        title: "Content Writing",
        icon: "✍️",
        skills: ["Editorial Writing", "Blogs", "Articles", "Website Content"]
      },
      branding: {
        title: "Brand Identity",
        icon: "🎯",
        skills: ["Brand Strategy", "Logo Design", "Visual Guidelines", "Typography", "Color Theory"]
      },
      research: {
        title: "Visual Research",
        icon: "🔍",
        skills: ["Moodboarding", "Trend Forecasting", "Market Analysis", "Cultural Research", "Competitor Study"]
      },
      illustrations: {
        title: "Illustrations",
        icon: "🎨",
        skills: ["Digital Art", "Vector Illustration", "Storyboarding", "Iconography", "Sketching"]
      }
    };

    const overlay = document.getElementById('skill-overlay');
    const overlayClose = document.getElementById('skill-overlay-close');
    const overlayIcon = document.getElementById('overlay-icon');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayList = document.getElementById('overlay-list');

    skillItems.forEach(item => {
      item.addEventListener('click', () => {
        const key = item.dataset.skill;

        // Photography has its own dedicated 3D experience page
        if (key === 'photography') {
          window.location.href = 'photography.html';
          return;
        }

        if (skillData[key]) {
          // Populate data
          overlayIcon.textContent = skillData[key].icon;
          overlayTitle.textContent = skillData[key].title;
          
          overlayList.innerHTML = ''; // Clear prev
          skillData[key].skills.forEach(skill => {
            const li = document.createElement('li');
            li.textContent = skill;
            overlayList.appendChild(li);
          });
          
          // Show overlay
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden'; // Lock background scrolling
        }
      });
    });

    if (overlayClose) {
      overlayClose.addEventListener('click', () => {
        overlay.classList.remove('active');
        document.body.style.overflow = ''; // Unlock scrolling
      });
    }
  }

});

