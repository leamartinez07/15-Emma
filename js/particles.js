/* ═══════════════════════════════════════════════════════════
   particles.js  –  Gold particle system
   · Hero canvas: dense, bright, floating upward
   · BG canvas:   sparse, fixed, subtle twinkling starfield
   ═══════════════════════════════════════════════════════════ */

const Particles = (() => {

  /* ── Hero particles ── */
  const PARTICLE_COUNT = 95;
  const GOLD_COLOR     = '#b8c8e0';
  const GLOW_COLOR     = '#cddaec';

  let heroCanvas, heroCtx, heroParticles = [], heroRaf;

  class HeroParticle {
    constructor () { this.reset(true); }

    reset (initial = false) {
      this.x      = Math.random() * heroCanvas.width;
      this.y      = initial ? Math.random() * heroCanvas.height : heroCanvas.height + 10;
      this.radius = Math.random() * 1.6 + 0.25;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = -(Math.random() * 0.55 + 0.18);
      this.alpha  = Math.random() * 0.6 + 0.12;
      this.life   = 1;
      this.decay  = Math.random() * 0.0025 + 0.0008;
    }

    update () {
      this.x    += this.speedX;
      this.y    += this.speedY;
      this.life -= this.decay;
      if (this.life <= 0 || this.y < -10) this.reset();
    }

    draw () {
      heroCtx.save();
      heroCtx.globalAlpha = this.alpha * this.life;
      heroCtx.fillStyle   = GOLD_COLOR;
      heroCtx.shadowColor = GLOW_COLOR;
      heroCtx.shadowBlur  = 6;
      heroCtx.beginPath();
      heroCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      heroCtx.fill();
      heroCtx.restore();
    }
  }

  function resizeHero () {
    const hero = document.getElementById('hero');
    if (!hero || !heroCanvas) return;
    heroCanvas.width  = hero.offsetWidth;
    heroCanvas.height = hero.offsetHeight;
  }

  function heroLoop () {
    heroCtx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
    heroParticles.forEach(p => { p.update(); p.draw(); });
    heroRaf = requestAnimationFrame(heroLoop);
  }

  /* ── Background starfield (fixed canvas behind all sections) ── */
  let bgCanvas, bgCtx, bgStars = [], bgRaf;

  class BgStar {
    constructor () {
      this.reset();
      // distribute vertically across page on init
      this.y = Math.random() * (bgCanvas.height + 2000) - 500;
    }

    reset () {
      this.x         = Math.random() * bgCanvas.width;
      this.y         = bgCanvas.height + 10;
      this.radius    = Math.random() < 0.12 ? Math.random() * 1.4 + 0.8 : Math.random() * 0.8 + 0.2;
      this.speed     = Math.random() * 0.18 + 0.05;
      this.baseAlpha = Math.random() * 0.38 + 0.08;
      this.phase     = Math.random() * Math.PI * 2;
      this.phaseSpd  = Math.random() * 0.022 + 0.008;
      this.isGold    = Math.random() > 0.38;
    }

    update () {
      this.y     -= this.speed;
      this.phase += this.phaseSpd;
      if (this.y < -10) this.reset();
    }

    draw () {
      const alpha = this.baseAlpha * (0.45 + 0.55 * Math.sin(this.phase));
      bgCtx.save();
      bgCtx.globalAlpha = alpha;
      bgCtx.fillStyle   = this.isGold ? GOLD_COLOR : '#c8deff';
      bgCtx.shadowColor = this.isGold ? GLOW_COLOR : '#8ab4ff';
      bgCtx.shadowBlur  = this.radius > 1 ? 5 : 2;
      bgCtx.beginPath();
      bgCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      bgCtx.fill();
      bgCtx.restore();
    }
  }

  function resizeBg () {
    if (!bgCanvas) return;
    bgCanvas.width  = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }

  function bgLoop () {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    bgStars.forEach(s => { s.update(); s.draw(); });
    bgRaf = requestAnimationFrame(bgLoop);
  }

  /* ── Public init ── */
  function init () {
    const isMobile = window.innerWidth <= 640;

    /* Hero canvas */
    heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
      heroCtx = heroCanvas.getContext('2d');
      resizeHero();
      window.addEventListener('resize', resizeHero, { passive: true });
      const heroCount = isMobile ? 40 : PARTICLE_COUNT;
      for (let i = 0; i < heroCount; i++) heroParticles.push(new HeroParticle());
      heroLoop();
    }

    /* Background canvas */
    bgCanvas = document.getElementById('bg-canvas');
    if (bgCanvas) {
      bgCtx = bgCanvas.getContext('2d');
      resizeBg();
      window.addEventListener('resize', resizeBg, { passive: true });
      const bgCount = isMobile ? 90 : 220;
      for (let i = 0; i < bgCount; i++) bgStars.push(new BgStar());
      bgLoop();
    }
  }

  function destroy () {
    if (heroRaf) cancelAnimationFrame(heroRaf);
    if (bgRaf)   cancelAnimationFrame(bgRaf);
    window.removeEventListener('resize', resizeHero);
    window.removeEventListener('resize', resizeBg);
  }

  return { init, destroy };
})();
