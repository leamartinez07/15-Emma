/* ═══════════════════════════════════════════════════════════
   music.js  –  Música de fondo via YouTube IFrame API
   Canción: "Clocks" – Coldplay
   Usa YT.Player + seekTo() en onReady para saltar el silencio
   inicial de forma confiable en mobile y desktop
   ═══════════════════════════════════════════════════════════ */

const Music = (() => {
  const VIDEO_ID  = 'd020hcWA_Wg'; // Clocks – Coldplay
  const START_SEC = 5;              // segundos a saltear

  let player  = null;
  let playing = false;
  let pending = false; // start() llamado antes de que la API esté lista

  const btn  = () => document.getElementById('music-btn');
  const icon = () => document.getElementById('music-icon');

  /* ── Carga el script de YouTube IFrame API una sola vez ── */
  function loadAPI () {
    if (window._ytApiLoading) return;
    window._ytApiLoading = true;
    const s  = document.createElement('script');
    s.src    = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }

  /* ── YouTube llama a esto automáticamente cuando la API cargó ── */
  window.onYouTubeIframeAPIReady = function () {
    if (pending) createPlayer();
  };

  function createPlayer () {
    pending = false;
    player = new YT.Player('yt-container', {
      videoId: VIDEO_ID,
      playerVars: {
        autoplay:       1,
        loop:           1,
        playlist:       VIDEO_ID, // necesario para loop
        controls:       0,
        rel:            0,
        modestbranding: 1,
        start:          START_SEC,
      },
      events: {
        onReady (e) {
          /* seekTo fuerza el salto aunque autoplay haya empezado desde 0 */
          e.target.seekTo(START_SEC, true);
          e.target.setVolume(80);
          playing = true;
          updateUI(true);
        },
      },
    });
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
    if (player && player.playVideo) {
      /* Player ya existe — salta al punto de inicio y reproduce */
      player.seekTo(START_SEC, true);
      player.playVideo();
      playing = true;
      updateUI(true);
    } else {
      /* Player aún no existe — marcar como pendiente y cargar API */
      pending = true;
      if (typeof YT !== 'undefined' && YT.Player) {
        createPlayer();
      } else {
        loadAPI();
      }
    }
  }

  function stop () {
    if (player && player.pauseVideo) player.pauseVideo();
    playing = false;
    updateUI(false);
  }

  function toggle () { playing ? stop() : start(); }

  function init (withMusic) {
    const b = btn();
    if (b) b.addEventListener('click', toggle);
    loadAPI(); // pre-carga la API en cuanto inicia la página
    if (withMusic) start();
  }

  return { init, start, stop, toggle, isPlaying: () => playing };
})();
