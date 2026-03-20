/* ═══════════════════════════════════════════════════════════
   countdown.js  –  Live countdown to 22 Aug 2026, 21:30 ART
   ═══════════════════════════════════════════════════════════ */

const Countdown = (() => {
  // Target: 22 Aug 2026, 21:30, Argentina Time (UTC-3)
  const TARGET = new Date('2026-08-22T21:30:00-03:00');

  const elDays  = () => document.getElementById('cd-days');
  const elHours = () => document.getElementById('cd-hours');
  const elMins  = () => document.getElementById('cd-mins');
  const elSecs  = () => document.getElementById('cd-secs');

  let lastValues = { d: -1, h: -1, m: -1, s: -1 };
  let intervalId;

  /**
   * Pads a number to 2 digits and triggers the flip animation.
   */
  function setNum (el, value) {
    if (!el) return;
    const str = String(value).padStart(2, '0');
    if (el.textContent !== str) {
      el.classList.remove('updated');
      // Force reflow so animation re-triggers
      void el.offsetWidth;
      el.textContent = str;
      el.classList.add('updated');
    }
  }

  function tick () {
    const now  = new Date();
    const diff = TARGET - now;

    if (diff <= 0) {
      ['days','hours','mins','secs'].forEach(id => {
        const el = document.getElementById(`cd-${id}`);
        if (el) { el.textContent = '00'; }
      });
      clearInterval(intervalId);
      return;
    }

    const days  = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const mins  = Math.floor((diff % 3_600_000)  / 60_000);
    const secs  = Math.floor((diff % 60_000)     / 1_000);

    setNum(elDays(),  days);
    setNum(elHours(), hours);
    setNum(elMins(),  mins);
    setNum(elSecs(),  secs);
  }

  function init () {
    tick();
    intervalId = setInterval(tick, 1_000);
  }

  return { init };
})();
