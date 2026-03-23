/* ═══════════════════════════════════════════════════════════
   rsvp.js  –  Formulario de asistencia → Google Sheets
   ═══════════════════════════════════════════════════════════ */

const Rsvp = (() => {
  const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzdDFyeMosSFWpOOn76r5e-T2226ikjo65o6AszRAoigVKIk14dsXL1rpx2tgzOxUcN/exec';

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
    const g = get('grupo-asistencia');
    if (g) { g.style.outline = ''; g.style.borderRadius = ''; }
  }

  function sendToSheets (data) {
    if (!SHEETS_URL) return;
    const params = new URLSearchParams({
      tipo:    data.tipo    || 'rsvp',
      nombre:  data.nombre  || '',
      tel:     data.tel     || '',
      asiste:  data.asiste  ? 'si' : 'no',
      adultos: data.adultos || 0,
      ninos:   data.ninos   || 0,
      mensaje: data.mensaje || '',
    });
    fetch(`${SHEETS_URL}?${params}`, { mode: 'no-cors' }).catch(() => {});
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

    const formData = { nombre, tel, asiste: choice === 'si', adultos, ninos, mensaje };

    /* Enviar a Google Sheets y mostrar pantalla de éxito */
    sendToSheets(formData);

    /* Pantalla de éxito */
    const body = get('form-body'), ok = get('form-success');
    if (body) body.style.display = 'none';
    if (ok)   ok.style.display   = 'block';
  }

  return { select, submit };
})();

/* ═══════════════════════════════════════════════════════════
   Pago  –  Botón "Avisar que realicé el pago"
   Muestra un campo de nombre y registra en Sheets + WhatsApp
   ═══════════════════════════════════════════════════════════ */
const Pago = (() => {
  const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzdDFyeMosSFWpOOn76r5e-T2226ikjo65o6AszRAoigVKIk14dsXL1rpx2tgzOxUcN/exec';
  const WA_NUMBER  = '542622431552';
  const get = id => document.getElementById(id);

  function mostrar () {
    get('pago-btn')?.classList.add('hidden');
    get('pago-form')?.classList.remove('hidden');
    get('pago-nombre')?.focus();
  }

  function confirmar () {
    const nombre = get('pago-nombre')?.value.trim() ?? '';
    if (!nombre) {
      const inp = get('pago-nombre');
      if (inp) { inp.style.borderColor = 'rgba(255,100,100,.7)'; setTimeout(() => inp.style.borderColor = '', 2000); }
      return;
    }

    /* Registrar en Sheets */
    const params = new URLSearchParams({ tipo: 'pago', nombre });
    fetch(`${SHEETS_URL}?${params}`, { mode: 'no-cors' }).catch(() => {});

    /* Avisar por WhatsApp */
    const texto = encodeURIComponent(`Hola! Te aviso que realicé la transferencia para la fiesta de Emma.\nNombre: ${nombre}`);
    window.open(`https://wa.me/${WA_NUMBER}?text=${texto}`, '_blank');

    /* Confirmación visual */
    get('pago-form')?.classList.add('hidden');
    get('pago-ok')?.classList.remove('hidden');
  }

  return { mostrar, confirmar };
})();
