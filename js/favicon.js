/* ─────────────────────────────────────────────
   favicon.js  –  genera el ícono de pestaña
   con Great Vibes (misma fuente que el Emma)
   usando canvas para una E dorada sobre azul
   ───────────────────────────────────────────── */
(async function () {
  /* Espera que Great Vibes esté disponible */
  await document.fonts.load('72px "Great Vibes"');

  const S   = 64;
  const c   = document.createElement('canvas');
  c.width   = S;
  c.height  = S;
  const ctx = c.getContext('2d');
  const r   = 13; /* radio de esquinas */

  /* ── Fondo azul marino redondeado ── */
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(S - r, 0);
  ctx.arcTo(S, 0, S, r, r);
  ctx.lineTo(S, S - r);
  ctx.arcTo(S, S, S - r, S, r);
  ctx.lineTo(r, S);
  ctx.arcTo(0, S, 0, S - r, r);
  ctx.lineTo(0, r);
  ctx.arcTo(0, 0, r, 0, r);
  ctx.closePath();

  const bgGrad = ctx.createRadialGradient(S * 0.38, S * 0.32, 0, S * 0.5, S * 0.5, S * 0.72);
  bgGrad.addColorStop(0, '#0d1f3c');
  bgGrad.addColorStop(1, '#060e1d');
  ctx.fillStyle = bgGrad;
  ctx.fill();

  /* ── Borde dorado sutil ── */
  ctx.strokeStyle = 'rgba(201,169,110,0.45)';
  ctx.lineWidth   = 1.4;
  ctx.stroke();

  /* ── E con degradado dorado ── */
  const gold = ctx.createLinearGradient(S * 0.2, S * 0.05, S * 0.8, S * 0.95);
  gold.addColorStop(0,    '#f0e0b0');
  gold.addColorStop(0.42, '#e2c98a');
  gold.addColorStop(1,    '#b8893a');

  ctx.fillStyle    = gold;
  ctx.font         = `${S * 0.62}px "Great Vibes"`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', S * 0.52, S * 0.52);

  /* ── Reemplaza el link de favicon ── */
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    document.head.appendChild(link);
  }
  link.rel  = 'icon';
  link.type = 'image/png';
  link.href = c.toDataURL('image/png');
})();
