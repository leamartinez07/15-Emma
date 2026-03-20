/* ═══════════════════════════════════════════════════════════
   rsvp.js  –  Formulario de asistencia + envío por WhatsApp
   ═══════════════════════════════════════════════════════════ */

const Rsvp = (() => {
  const WA_NUMBER = '542622431552';
  let choice = null;

  const get = id => document.getElementById(id);

  function toast (msg, isError = true) {
    const el = document.createElement('div');
    el.textContent = msg;
    Object.assign(el.style, {
      position:'fixed', bottom:'2rem', left:'50%',
      transform:'translateX(-50%)',
      background: isError ? 'rgba(255,100,100,.95)' : 'rgba(184,200,224,.95)',
      color:'#fff',
      padding:'.75rem 1.8rem', borderRadius:'50px',
      fontFamily:'Montserrat,sans-serif', fontSize:'.82rem', fontWeight:'600',
      zIndex:'9999', boxShadow:'0 4px 20px rgba(0,0,0,.35)',
      whiteSpace:'nowrap',
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  /* Marca un campo con borde rojo y lo limpia al escribir */
  function markError (id) {
    const el = get(id);
    if (!el) return;
    el.style.borderColor = 'rgba(255,100,100,.7)';
    el.style.boxShadow   = '0 0 0 3px rgba(255,100,100,.12)';
    const clear = () => {
      el.style.borderColor = '';
      el.style.boxShadow   = '';
      el.removeEventListener('input', clear);
      el.removeEventListener('change', clear);
    };
    el.addEventListener('input',  clear);
    el.addEventListener('change', clear);
  }

  function markGroupError (id) {
    const el = get(id);
    if (!el) return;
    el.style.outline = '2px solid rgba(255,100,100,.6)';
    el.style.borderRadius = '14px';
    setTimeout(() => { el.style.outline = ''; el.style.borderRadius = ''; }, 3200);
  }

  function select (value) {
    choice = value;
    get('r-si')?.classList.toggle('active', value === 'si');
    get('r-no')?.classList.toggle('active', value === 'no');
    const c = get('cantidades');
    if (c) c.classList.toggle('hidden', value !== 'si');
    /* Limpia el error visual del grupo si lo había */
    const g = get('grupo-asistencia');
    if (g) { g.style.outline = ''; g.style.borderRadius = ''; }
  }

  function buildMsg (d) {
    let m = `Hola! Confirmacion de asistencia para la fiesta de Emma\n\n`;
    m += `Nombre: *${d.nombre}*\n`;
    if (d.tel) m += `WhatsApp: ${d.tel}\n`;
    m += `Asistencia: ${d.asiste ? 'Si, voy a estar!' : 'No voy a poder ir'}\n`;
    if (d.asiste) {
      m += `\n*Personas:*\n`;
      m += `  - Adultos: ${d.adultos || 0}\n`;
      m += `  - Ninos (5-10): ${d.ninos || 0}\n`;
    }
    if (d.mensaje) m += `\nMensaje: _${d.mensaje}_`;
    return m;
  }

  function submit () {
    const nombre  = get('f-nombre')?.value.trim() ?? '';
    const tel     = get('f-tel')?.value.trim()    ?? '';
    const adultos = parseInt(get('f-adultos')?.value ?? '0', 10);
    const ninos   = parseInt(get('f-ninos')?.value   ?? '0', 10);
    const mensaje = get('f-mensaje')?.value.trim()   ?? '';

    /* ── Validaciones ── */
    if (!nombre) {
      markError('f-nombre');
      toast('Por favor escribi tu nombre completo');
      get('f-nombre')?.focus();
      return;
    }

    if (!tel) {
      markError('f-tel');
      toast('Por favor ingresa tu numero de WhatsApp');
      get('f-tel')?.focus();
      return;
    }

    if (!choice) {
      markGroupError('grupo-asistencia');
      toast('Indica si vas a asistir o no');
      return;
    }

    if (choice === 'si' && adultos < 1) {
      markError('f-adultos');
      toast('Indica cuantos adultos asisten (minimo 1)');
      get('f-adultos')?.focus();
      return;
    }

    if (choice === 'si' && ninos < 1) {
      markError('f-ninos');
      toast('Indica cuantos niños asisten (minimo 1)');
      get('f-ninos')?.focus();
      return;
    }

    /* ── Envío ── */
    const text = encodeURIComponent(
      buildMsg({ nombre, tel, asiste: choice === 'si', adultos, ninos, mensaje })
    );
    window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, '_blank');

    const body = get('form-body'), ok = get('form-success');
    if (body) body.style.display = 'none';
    if (ok)   ok.style.display   = 'block';
  }

  return { select, submit };
})();
