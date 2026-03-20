/* ═══════════════════════════════════════════════════════════
   main.js  –  Bootstrap: splash stars, progress bar,
               scroll reveal, scroll-to, section sparkles
   ═══════════════════════════════════════════════════════════ */

const App = (() => {

  /* Splash: generar estrellas animadas */
  function buildStars () {
    const container = document.getElementById('splash-stars');
    if (!container) return;
    const frag = document.createDocumentFragment();
    const count = window.innerWidth <= 640 ? 35 : 100;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.classList.add('splash-star');
      s.style.cssText =
        `left:${(Math.random()*100).toFixed(1)}%;` +
        `top:${(Math.random()*100).toFixed(1)}%;` +
        `--delay:${(Math.random()*4).toFixed(2)}s;` +
        `--dur:${(Math.random()*2.5+2).toFixed(2)}s;`;
      frag.appendChild(s);
    }
    container.appendChild(frag);
  }

  /* Twinkling sparkle dots inside each section (except hero) */
  function initSectionStars () {
    const sections = document.querySelectorAll('section:not(#hero), footer');
    sections.forEach(section => {
      const wrap = document.createElement('div');
      wrap.className = 'section-sparkles';
      wrap.setAttribute('aria-hidden', 'true');
      const frag = document.createDocumentFragment();
      const count = 45;
      for (let i = 0; i < count; i++) {
        const s = document.createElement('i');
        s.className = 'sparkle';
        const isBig  = Math.random() < 0.12;
        const size   = isBig
          ? (Math.random() * 2 + 1.8).toFixed(1)
          : (Math.random() * 1.2 + 0.4).toFixed(1);
        s.style.cssText = [
          `left:${(Math.random()*100).toFixed(1)}%`,
          `top:${(Math.random()*100).toFixed(1)}%`,
          `--delay:${(Math.random()*6).toFixed(2)}s`,
          `--dur:${(Math.random()*3.5+2.5).toFixed(2)}s`,
          `--size:${size}px`,
          `--op:${(Math.random()*0.4+0.12).toFixed(2)}`,
        ].join(';');
        frag.appendChild(s);
      }
      wrap.appendChild(frag);
      section.insertBefore(wrap, section.firstChild);
    });
  }

  /* Entrar al sitio desde splash */
  function enter (withMusic) {
    const splash = document.getElementById('splash');
    if (splash) splash.classList.add('hidden');

    /* Desbloquear scroll y asegurar posición top */
    document.documentElement.classList.remove('splash-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('touch-action');
    /* Forzar scroll al inicio — sin esto iOS/Android quedan scrolleados */
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    Music.init(withMusic);
  }

  /* Barra de progreso de scroll */
  function initProgress () {
    const bar = document.getElementById('progress-bar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    }, { passive: true });
  }

  /* Reveal al hacer scroll */
  function initReveal () {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!els.length) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    els.forEach(el => io.observe(el));
  }

  /* Scroll suave a sección */
  function scrollTo (id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  /* Init */
  function boot () {
    buildStars();
    initSectionStars();
    initProgress();
    initReveal();
    Particles.init();
    Countdown.init();
    Carousel.init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  return { enter, scrollTo };
})();
