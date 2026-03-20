/* ═══════════════════════════════════════════════════════════
   music.js  –  Música de fondo via YouTube embed
   Canción: "Clocks" – Coldplay
   FIX: iframe off-screen (no display:none) para que autoplay funcione
   ═══════════════════════════════════════════════════════════ */

const Music = (() => {
  const VIDEO_ID = 'd020hcWA_Wg'; // Clocks – Coldplay
  const makeSrc  = () =>
    `https://www.youtube.com/embed/${VIDEO_ID}` +
    `?autoplay=1&loop=1&playlist=${VIDEO_ID}` +
    `&controls=0&rel=0&modestbranding=1&mute=0`;

  let playing = false;

  const frame = () => document.getElementById('yt-frame');
  const btn   = () => document.getElementById('music-btn');
  const icon  = () => document.getElementById('music-icon');

  function updateUI (isPlaying) {
    const b = btn(), i = icon();
    if (i) i.textContent = isPlaying ? '♫' : '♪';
    if (b) {
      b.classList.toggle('playing', isPlaying);
      b.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
    }
  }

  function start () {
    const f = frame();
    if (!f) return;
    // Set src AFTER user gesture so browser allows autoplay with sound
    f.src = makeSrc();
    playing = true;
    updateUI(true);
  }

  function stop () {
    const f = frame();
    if (!f) return;
    f.src = ''; // clearing src stops playback
    playing = false;
    updateUI(false);
  }

  function toggle () { playing ? stop() : start(); }

  function init (withMusic) {
    const b = btn();
    if (b) b.addEventListener('click', toggle);
    if (withMusic) start();
  }

  return { init, start, stop, toggle, isPlaying: () => playing };
})();
