/* ═══════════════════════════════════════════════════════════
   music.js  –  Música de fondo via YouTube embed
   Crea el iframe dinámicamente dentro del gesto del usuario
   para garantizar autoplay con audio en mobile y desktop.
   START_SEC salta el silencio inicial de la canción.
   ═══════════════════════════════════════════════════════════ */

const Music = (() => {
  const VIDEO_ID  = 'd020hcWA_Wg'; // Clocks – Coldplay
  const START_SEC = 0;              // segundos a saltear (ajustar si es necesario)

  let playing = false;

  const wrap = () => document.getElementById('yt-container');
  const btn  = () => document.getElementById('music-btn');
  const icon = () => document.getElementById('music-icon');

  function makeSrc () {
    return `https://www.youtube.com/embed/${VIDEO_ID}` +
      `?autoplay=1&loop=1&playlist=${VIDEO_ID}` +
      `&controls=0&rel=0&modestbranding=1&start=${START_SEC}`;
  }

  function updateUI (isPlaying) {
    const b = btn(), i = icon();
    if (i) i.textContent = isPlaying ? '♫' : '♪';
    if (b) {
      b.classList.toggle('playing', isPlaying);
      b.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
    }
  }

  function start () {
    const w = wrap();
    if (!w) return;
    /* Crear el iframe dentro del handler del gesto del usuario
       garantiza que el browser permita autoplay con audio en mobile */
    w.innerHTML =
      `<iframe src="${makeSrc()}"
         allow="autoplay; encrypted-media"
         title="música de fondo"
         style="position:fixed;bottom:-600px;left:-600px;
                width:2px;height:2px;opacity:0;
                pointer-events:none;border:0;">
       </iframe>`;
    playing = true;
    updateUI(true);
  }

  function stop () {
    const w = wrap();
    if (w) w.innerHTML = ''; // eliminar iframe detiene la reproducción
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
