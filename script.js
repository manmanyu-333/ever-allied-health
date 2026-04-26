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
    const maxOpacity = r < 10 ? 0.68 : r < 28 ? 0.49 : 0.30;
    const baseOpacity = rand(0.21, maxOpacity);

    /* Drift: slow free-floating in a random direction, gently curving */
    const speed = rand(0.036, 0.162);
    const theta = rand(0, Math.PI * 2);        /* random initial direction */

    /* Twinkle: each orb pulses on its own slow sine cycle */
    const twinklePeriod = rand(3000, 8000); /* ms — slow, meditative pulse */
    const twinklePhase  = rand(0, Math.PI * 2);
    const twinkleDepth  = rand(0.15, 0.40); /* how much it fluctuates */

    return {
      x:            rand(0, canvas.width),
      y:            rand(0, canvas.height),
      r,
      rgb,
      baseOpacity,
      twinklePeriod,
      twinklePhase,
      twinkleDepth,
      speed,
      theta,
    };
  }

  resize();

  /* Aim for roughly 1 orb per 9 400 px² of canvas area, min 51 max 94 */
  function targetCount() {
    return Math.min(94, Math.max(51, Math.round((canvas.width * canvas.height) / 9400)));
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
    /* Random-walk the angle each frame — no persistent direction */
    orb.theta += (Math.random() - 0.5) * 0.06;
    orb.x += orb.speed * Math.cos(orb.theta);
    orb.y += orb.speed * Math.sin(orb.theta);

    /* Wrap on all four edges */
    if (orb.x < -orb.r)                  orb.x = canvas.width  + orb.r;
    if (orb.x >  canvas.width  + orb.r)  orb.x = -orb.r;
    if (orb.y < -orb.r)                  orb.y = canvas.height + orb.r;
    if (orb.y >  canvas.height + orb.r)  orb.y = -orb.r;
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
   Contact Form — Formspree Integration
   ========================================================================== */
(function () {
  'use strict';

  const form = document.querySelector('#contact-form');
  if (!form) return;

  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mnjldear';

  /* Clear field-level error on input */
  form.querySelectorAll('input, select, textarea').forEach(function (field) {
    field.addEventListener('input', function () {
      field.classList.remove('form-field-error');
      field.nextElementSibling.textContent = '';
    });
  });

  /* Validate all required fields before submit */
  function validateForm() {
    let isValid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      if (!field.value.trim()) {
        field.classList.add('form-field-error');
        if (field.nextElementSibling && field.nextElementSibling.classList.contains('form-error')) {
          field.nextElementSibling.textContent = 'This field is required';
        }
        isValid = false;
      }
    });
    return isValid;
  }

  /* Handle form submission */
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    /* Validate form */
    if (!validateForm()) {
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const data = {
      name: form.querySelector('[name="name"]').value,
      contact: form.querySelector('[name="contact"]').value,
      suburb: form.querySelector('[name="suburb"]').value,
      funding_type: form.querySelector('[name="funding_type"]').value,
      notes: form.querySelector('[name="notes"]').value
    };

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        form.style.display = 'none';
        document.querySelector('#form-success').style.display = 'block';
        window.scrollTo({ top: document.querySelector('#contact').offsetTop - 80, behavior: 'smooth' });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      document.querySelector('#form-error').style.display = 'block';
      submitBtn.textContent = 'Send Enquiry';
      submitBtn.disabled = false;
    }
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

  /* ---------------------------------------------------------------------- */
  /* 7. h1 section headings (inner pages use h1 not h2)                       */
  /* ---------------------------------------------------------------------- */
  document.querySelectorAll('main section h1.section-heading').forEach(function (el) {
    watch(el);
  });

  /* ---------------------------------------------------------------------- */
  /* 8. Inner page subtitle / intro text                                      */
  /* ---------------------------------------------------------------------- */
  [
    '.wws-page-intro-text',
    '.wws-funding-subtitle',
    '.wws-service-subtitle',
  ].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      watch(el, { delay: 100 });
    });
  });

  /* ---------------------------------------------------------------------- */
  /* 9. Client cards — staggered 110ms                                        */
  /* ---------------------------------------------------------------------- */
  watchGroup(
    document.querySelector('.client-grid'),
    document.querySelectorAll('.client-card'),
    110
  );
  watchGroup(
    document.querySelector('.wws-card-grid'),
    document.querySelectorAll('.wws-card'),
    110
  );

  /* ---------------------------------------------------------------------- */
  /* 10. Philosophy cards — staggered 110ms                                   */
  /* ---------------------------------------------------------------------- */
  watchGroup(
    document.querySelector('.philosophy-cards'),
    document.querySelectorAll('.philosophy-card'),
    110
  );

  /* ---------------------------------------------------------------------- */
  /* 11. Why Choose blocks — staggered 150ms                                  */
  /* ---------------------------------------------------------------------- */
  watchGroup(
    document.querySelector('.why-choose-grid'),
    document.querySelectorAll('.why-choose-block'),
    150
  );

  /* ---------------------------------------------------------------------- */
  /* 12. Feature blocks (Who We Are section) — staggered 110ms               */
  /* ---------------------------------------------------------------------- */
  watchGroup(
    document.querySelector('.feature-grid'),
    document.querySelectorAll('.feature-block'),
    110
  );

  /* ---------------------------------------------------------------------- */
  /* 13. Funding list items — staggered 70ms                                  */
  /* ---------------------------------------------------------------------- */
  watchGroup(
    document.querySelector('.wws-funding-list'),
    document.querySelectorAll('.wws-funding-list li'),
    70
  );

  /* ---------------------------------------------------------------------- */
  /* 14. Suburb groups — staggered 200ms                                      */
  /* ---------------------------------------------------------------------- */
  watchGroup(
    document.querySelector('.wws-suburb-groups'),
    document.querySelectorAll('.suburb-group'),
    200
  );

  /* ---------------------------------------------------------------------- */
  /* 15. Refer steps (contact page) — stagger 280ms so they appear            */
  /*     one by one when the list enters the viewport                         */
  /* ---------------------------------------------------------------------- */
  watchGroup(
    document.querySelector('.refer-steps-list'),
    document.querySelectorAll('.refer-step-item'),
    280
  );

  /* ---------------------------------------------------------------------- */
  /* 16. Closing lines and callout banners — fade only                        */
  /* ---------------------------------------------------------------------- */
  document.querySelectorAll('.refer-closing, .wws-service-callout, .wws-funding-image').forEach(function (el) {
    watch(el, { fadeOnly: true, delay: 80 });
  });

}());
