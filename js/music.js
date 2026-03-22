/* ═══════════════════════════════════════════════════════════
   music.js  –  Música de fondo
   ─ Desktop / Android : YouTube iframe oculto (autoplay automático).
   ─ iOS Safari        : HTMLAudioElement nativo con archivo local.
     El gesto del usuario en la splash se propaga a .play() y la
     música arranca sola. YouTube iframe cross-origin no recibe ese
     permiso de WebKit aunque el click venga de la página padre.

   PARA iOS: subir el archivo de audio a  audio/bg-music.mp3
   en el repositorio/Vercel. El nombre y ruta se configuran abajo.
   ═══════════════════════════════════════════════════════════ */

const Music = (() => {

  /* ── Configuración ─────────────────────────────────────── */
  const VIDEO_ID    = 'd020hcWA_Wg';   // YouTube – Clocks (Coldplay)
  const START_SEC   = 0;
  const IOS_SRC     = 'audio/bg-music.mp3'; // ruta relativa del MP3 para iOS

  /* ── Estado ─────────────────────────────────────────────── */
  let playing   = false;
  let iosAudio  = null;   // HTMLAudioElement reutilizable en iOS

  /* ── Helpers ─────────────────────────────────────────────── */
  const wrap = () => document.getElementById('yt-container');
  const btn  = () => document.getElementById('music-btn');
  const icon = () => document.getElementById('music-icon');

  /* iOS: todos los browsers en iOS usan WebKit (incluido Chrome en iPhone) */
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function makeSrc () {
    return `https://www.youtube.com/embed/${VIDEO_ID}` +
      `?autoplay=1&loop=1&playlist=${VIDEO_ID}` +
      `&rel=0&modestbranding=1&start=${START_SEC}` +
      `&playsinline=1&controls=0`;
  }

  function updateUI (isPlaying) {
    const b = btn(), i = icon();
    if (i) i.textContent = isPlaying ? '♫' : '♪';
    if (b) {
      b.classList.toggle('playing', isPlaying);
      b.setAttribute('aria-label', isPlaying ? 'Pausar música' : 'Reproducir música');
    }
  }

  function resetContainer () {
    const w = wrap();
    if (w) w.style.cssText =
      'position:fixed;bottom:-500px;left:-500px;' +
      'width:2px;height:2px;opacity:0;pointer-events:none;z-index:-1;';
  }

  /* ── iOS: audio nativo ──────────────────────────────────── */
  function startIOS () {
    /* Crear el elemento una sola vez y reutilizarlo */
    if (!iosAudio) {
      iosAudio = new Audio(IOS_SRC);
      iosAudio.loop    = true;
      iosAudio.preload = 'auto';
      iosAudio.volume  = 0.7;
    }

    /* .play() dentro del handler del gesto → iOS permite el audio */
    const p = iosAudio.play();
    if (p !== undefined) {
      p.then(() => {
        playing = true;
        updateUI(true);
      }).catch(() => {
        /* El archivo no existe o el formato no es compatible */
        playing = false;
        updateUI(false);
      });
    } else {
      playing = true;
      updateUI(true);
    }
  }

  function stopIOS () {
    if (iosAudio) {
      iosAudio.pause();
    }
    playing = false;
    updateUI(false);
  }

  /* ── Desktop / Android: YouTube iframe oculto ───────────── */
  function startDesktop () {
    const w = wrap();
    if (!w) return;
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

  function stopDesktop () {
    const w = wrap();
    if (w) { w.innerHTML = ''; resetContainer(); }
    playing = false;
    updateUI(false);
  }

  /* ── API pública ─────────────────────────────────────────── */
  function start  () { isIOS ? startIOS()   : startDesktop(); }
  function stop   () { isIOS ? stopIOS()    : stopDesktop();  }
  function toggle () { playing ? stop() : start(); }

  function init (withMusic) {
    const b = btn();
    if (b) b.addEventListener('click', toggle);
    if (withMusic) start();
  }

  return { init, start, stop, toggle, isPlaying: () => playing };
})();
