/* ==========================================================================
   Ever Allied Health — script.js
   Handles: bokeh canvas, mobile nav toggle, sticky nav shadow, smooth scroll
   ========================================================================== */

/* --------------------------------------------------------------------------
   Hero Bokeh Canvas
   Underwater fairy-light effect: many scattered glowing orbs of mixed sizes
   floating slowly upward through warm air, like the Brixen reference.
   Colour scheme: warm whites and creams against #D1C9B1 base.
   -------------------------------------------------------------------------- */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function rand(min, max) { return min + Math.random() * (max - min); }

  /*
   * Three warm tones against the #D1C9B1 base.
   * Heavily weighted toward pure warm white so orbs read clearly.
   *   #FFFAF6  warm white     — dominant, most visible
   *   #EDE5D8  warm cream     — mid tone filler
   *   #C8C0AA  muted greige   — shadow/depth
   */
  const TONES = [
    { rgb: [255, 250, 246], weight: 0.65 },
    { rgb: [237, 229, 216], weight: 0.25 },
    { rgb: [200, 192, 170], weight: 0.10 },
  ];

  function pickTone() {
    const r = Math.random();
    let sum = 0;
    for (const t of TONES) { sum += t.weight; if (r <= sum) return t.rgb; }
    return TONES[0].rgb;
  }

  /*
   * Size tiers mirroring the reference — lots of tiny pinpoints,
   * fewer medium circles, a handful of larger soft blobs.
   */
  function pickRadius() {
    const t = Math.random();
    if (t < 0.50) return rand(2,  10);   /* tiny pinpoints  — 50% */
    if (t < 0.82) return rand(10, 28);   /* medium circles  — 32% */
                  return rand(28, 65);   /* larger soft orbs — 18% */
  }

  function resize() {
    const hero = canvas.parentElement;
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function makeOrb(startAnywhere) {
    const r   = pickRadius();
    const rgb = pickTone();

    /*
     * Opacity by size tier. Small orbs are crisp fairy-light points,
     * medium ones glow warmly, large ones are soft ambient halos.
     */
    const maxOpacity = r < 10 ? 0.80 : r < 28 ? 0.58 : 0.35;
    const baseOpacity = rand(0.25, maxOpacity);

    /* Drift: mostly upward, slight random horizontal lean */
    const speed = rand(0.10, 0.45);
    const lean  = rand(-0.15, 0.15);

    /* Twinkle: each orb pulses on its own slow sine cycle */
    const twinklePeriod = rand(1800, 5000); /* ms — faster than before for sparkle */
    const twinklePhase  = rand(0, Math.PI * 2);
    const twinkleDepth  = rand(0.15, 0.40); /* how much it fluctuates */

    return {
      x:            rand(0, canvas.width),
      y:            startAnywhere ? rand(0, canvas.height) : canvas.height + r + 2,
      r,
      rgb,
      baseOpacity,
      twinklePeriod,
      twinklePhase,
      twinkleDepth,
      vx:           lean * speed,
      vy:           -speed,
    };
  }

  resize();

  /* Aim for roughly 1 orb per 8 000 px² of canvas area, min 60 max 110 */
  function targetCount() {
    return Math.min(110, Math.max(60, Math.round((canvas.width * canvas.height) / 8000)));
  }

  let orbs = Array.from({ length: targetCount() }, () => makeOrb(true));

  function drawOrb(orb, ts) {
    const [R, G, B] = orb.rgb;

    /* Twinkle: sine-wave modulation of opacity each frame */
    const twinkle  = 1 + orb.twinkleDepth * Math.sin(
      (ts / orb.twinklePeriod) * Math.PI * 2 + orb.twinklePhase
    );
    const opacity  = Math.min(1, orb.baseOpacity * twinkle);

    /* --- Outer soft glow halo --- */
    const glow = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
    glow.addColorStop(0,    `rgba(${R},${G},${B},${+(opacity * 0.9).toFixed(4)})`);
    glow.addColorStop(0.40, `rgba(${R},${G},${B},${+(opacity * 0.35).toFixed(4)})`);
    glow.addColorStop(1,    `rgba(${R},${G},${B},0)`);
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    /* --- Bright inner core (fairy-light point) — only for small/medium orbs --- */
    if (orb.r < 32) {
      const coreR = Math.max(1.5, orb.r * 0.22);
      const core  = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, coreR);
      core.addColorStop(0, `rgba(255,253,248,${Math.min(1, opacity * 1.4).toFixed(4)})`);
      core.addColorStop(1, `rgba(255,253,248,0)`);
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, coreR, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();
    }
  }

  function stepOrb(orb) {
    orb.x += orb.vx;
    orb.y += orb.vy;

    /* Wrap horizontally */
    if (orb.x < -orb.r)               orb.x = canvas.width  + orb.r;
    if (orb.x >  canvas.width + orb.r) orb.x = -orb.r;

    /* When an orb floats off the top, recycle it from the bottom */
    if (orb.y < -orb.r) {
      const fresh = makeOrb(false);
      Object.assign(orb, fresh);
    }
  }

  function frame(ts) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const orb of orbs) {
      stepOrb(orb);
      drawOrb(orb, ts);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.addEventListener('resize', function () {
    resize();
    /* Rebuild orb pool sized to new canvas area */
    orbs = Array.from({ length: targetCount() }, () => makeOrb(true));
  }, { passive: true });

}());

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     Sticky nav — add shadow on scroll
     -------------------------------------------------------------------------- */
  const nav = document.getElementById('site-nav');

  window.addEventListener('scroll', function () {
    if (window.scrollY > 8) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });


  /* --------------------------------------------------------------------------
     Mobile hamburger menu toggle
     -------------------------------------------------------------------------- */
  const hamburger = document.getElementById('nav-hamburger');
  const mobileMenu = document.getElementById('nav-mobile-menu');

  hamburger.addEventListener('click', function () {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));

    // Prevent body scroll while menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }
  });


  /* --------------------------------------------------------------------------
     Smooth scroll for anchor links (fallback for browsers that don't support
     CSS scroll-behavior, and to account for sticky nav offset)
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = nav.offsetHeight;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
      });
    });
  });


  /* --------------------------------------------------------------------------
     Active nav link highlight on scroll (IntersectionObserver)
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinkEls = document.querySelectorAll('.nav-links a, .nav-mobile-menu a');

  const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -55% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinkEls.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(function (section) {
    observer.observe(section);
  });

})();


/* ==========================================================================
   Scroll Reveal
   Elements start hidden (added by JS below) and are revealed by
   IntersectionObserver as they enter the viewport. One-shot: fires once,
   never re-hides. Staggered groups are observed as a unit on their parent
   so all siblings receive their delays simultaneously.
   ========================================================================== */
(function () {

  /* Skip entirely if the user prefers reduced motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ---- Single-element observer (headings, paragraphs, quote) ------------ */
  const singleObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal-visible');
      singleObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  /* ---- Group observer — reveals all children with stagger on parent hit - */
  function makeGroupObserver(intervalMs) {
    return new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        /* Reveal each tracked child with its pre-assigned delay */
        entry.target._revealChildren.forEach(function (child) {
          child.classList.add('reveal-visible');
        });
        this.unobserve(entry.target);
      });
    }, { threshold: 0.10 });
  }

  /* Helper: mark a single element for reveal */
  function watch(el, opts) {
    if (!el) return;
    opts = opts || {};
    el.classList.add('reveal-hidden');
    if (opts.fadeOnly) el.classList.add('reveal-fade-only');
    if (opts.delay)   el.style.transitionDelay = opts.delay + 'ms';
    if (opts.duration) {
      el.style.transitionDuration = opts.duration + 's, ' + opts.duration + 's';
    }
    singleObserver.observe(el);
  }

  /* Helper: stagger a NodeList/array as a group — parent triggers all */
  function watchGroup(parent, children, intervalMs) {
    if (!parent || !children.length) return;
    const obs = makeGroupObserver(intervalMs);
    children.forEach(function (child, i) {
      child.classList.add('reveal-hidden');
      child.style.transitionDelay = (i * intervalMs) + 'ms';
    });
    parent._revealChildren = Array.from(children);
    obs.observe(parent);
  }

  /* ---------------------------------------------------------------------- */
  /* 1. Section headings (h2)                                                */
  /* ---------------------------------------------------------------------- */
  document.querySelectorAll('main section h2.section-heading').forEach(function (el) {
    watch(el);
  });

  /* ---------------------------------------------------------------------- */
  /* 2. Key intro / body paragraphs — 100ms delay after heading              */
  /* ---------------------------------------------------------------------- */
  var introParagraphs = [
    '.intro-text p',
    '.philosophy-intro',
    '.who-we-see-intro',
    '.funding-intro',
    '.service-area-desc',
    '.values-tagline',
  ];
  introParagraphs.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      watch(el, { delay: 100 });
    });
  });

  /* ---------------------------------------------------------------------- */
  /* 3. Value blocks — staggered 150ms, triggered by the values-grid parent  */
  /* ---------------------------------------------------------------------- */
  var valuesGrid = document.querySelector('.values-grid');
  var valueBlocks = document.querySelectorAll('.value-block');
  watchGroup(valuesGrid, valueBlocks, 150);

  /* ---------------------------------------------------------------------- */
  /* 4. Stat blocks — staggered 150ms, triggered by the stats section        */
  /* ---------------------------------------------------------------------- */
  var statsSection = document.querySelector('.stats');
  var statBlocks   = document.querySelectorAll('.stat-block');
  watchGroup(statsSection, statBlocks, 150);

  /* ---------------------------------------------------------------------- */
  /* 5. Referral steps — staggered 200ms, triggered by the steps container   */
  /* ---------------------------------------------------------------------- */
  var referSteps      = document.querySelector('.refer-steps');
  var referStepItems  = document.querySelectorAll('.refer-step');
  watchGroup(referSteps, referStepItems, 200);

  /* ---------------------------------------------------------------------- */
  /* 6. Quote block — fade only, no vertical movement, 0.8s                  */
  /* ---------------------------------------------------------------------- */
  document.querySelectorAll('.quote-inner').forEach(function (el) {
    watch(el, { fadeOnly: true });
  });

}());
