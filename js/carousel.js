/* ═══════════════════════════════════════════════════════════
   carousel.js  –  Full-width 3-up carousel (desktop) / 1-up (mobile)
   ═══════════════════════════════════════════════════════════ */

const Carousel = (() => {
  const TOTAL   = 5;
  const AUTO_MS = 5_500;

  let current    = 0;
  let autoTimer;
  let touchStartX = 0;

  /* Responsive: how many slides are visible */
  function getVisible () {
    return window.innerWidth >= 640 ? 3 : 1;
  }
  /* How many positions we can advance to */
  function getPositions () {
    return TOTAL - getVisible() + 1;   // desktop: 3 / mobile: 5
  }

  /* Pixel width of one slide = container width ÷ visible count.
     Using pixels avoids the translateX-% ambiguity where % is relative
     to the element's own layout box width, not its scroll-width.        */
  function slideWidth () {
    const t = track();
    if (!t) return 0;
    return t.parentElement.offsetWidth / getVisible();
  }

  /* Force each slide's CSS min-width to match the JS pixel calculation,
     so CSS layout and JS translation are always in sync.                 */
  function setSlideSizes () {
    const sw = slideWidth();
    document.querySelectorAll('.carousel-slide').forEach(s => {
      s.style.minWidth = sw + 'px';
      s.style.width    = sw + 'px';
    });
  }

  const track = () => document.getElementById('carousel-track');
  const dots  = () => document.querySelectorAll('#carousel-dots .dot');

  function goTo (index) {
    const positions = getPositions();
    current = ((index % positions) + positions) % positions;
    const t = track();
    if (t) t.style.transform = `translateX(-${current * slideWidth()}px)`;
    dots().forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next () { goTo(current + 1); }
  function prev () { goTo(current - 1); }

  function resetAuto () {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, AUTO_MS);
  }

  function bindDots () {
    dots().forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.index, 10));
        resetAuto();
      });
    });
  }

  function bindArrows () {
    const btnNext = document.getElementById('carousel-next');
    const btnPrev = document.getElementById('carousel-prev');
    if (btnNext) btnNext.addEventListener('click', () => { next(); resetAuto(); });
    if (btnPrev) btnPrev.addEventListener('click', () => { prev(); resetAuto(); });
  }

  function bindSwipe () {
    const t = track();
    if (!t) return;
    t.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    t.addEventListener('touchend', e => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 40) {
        delta > 0 ? next() : prev();
        resetAuto();
      }
    }, { passive: true });
  }

  function bindKeyboard () {
    document.addEventListener('keydown', e => {
      const gallery = document.getElementById('gallery');
      if (!gallery) return;
      const rect = gallery.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (e.key === 'ArrowRight') { next(); resetAuto(); }
        if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
      }
    });
  }

  /* On resize, recalculate position in pixels for new viewport width */
  function bindResize () {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { setSlideSizes(); goTo(current); }, 200);
    }, { passive: true });
  }

  function init () {
    setSlideSizes();   /* set px widths before first goTo so layout is correct */
    goTo(0);
    bindDots();
    bindArrows();
    bindSwipe();
    bindKeyboard();
    bindResize();
    autoTimer = setInterval(next, AUTO_MS);
  }

  return { init, goTo, next, prev };
})();
