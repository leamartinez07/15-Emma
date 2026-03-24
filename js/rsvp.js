/* ==========================================================
   rsvp.js - Formulario de asistencia y aviso de pago
   ========================================================== */

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzdDFyeMosSFWpOOn76r5e-T2226ikjo65o6AszRAoigVKIk14dsXL1rpx2tgzOxUcN/exec';
const WA_NUMBER = '542622431552';
const RSVP_STORAGE_KEY = 'emma-rsvp-confirmada';

const Ui = (() => {
  const get = id => document.getElementById(id);

  function toast(msg, isError = true) {
    const el = document.createElement('div');
    el.textContent = msg;
    Object.assign(el.style, {
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      background: isError ? 'rgba(255,100,100,.95)' : 'rgba(184,200,224,.95)',
      color: '#fff',
      padding: '.75rem 1.8rem',
      borderRadius: '50px',
      fontFamily: 'Montserrat,sans-serif',
      fontSize: '.82rem',
      fontWeight: '600',
      zIndex: '9999',
      boxShadow: '0 4px 20px rgba(0,0,0,.35)',
      whiteSpace: 'nowrap',
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function markError(id) {
    const el = get(id);
    if (!el) return;

    el.style.borderColor = 'rgba(255,100,100,.7)';
    el.style.boxShadow = '0 0 0 3px rgba(255,100,100,.12)';

    const clear = () => {
      el.style.borderColor = '';
      el.style.boxShadow = '';
      el.removeEventListener('input', clear);
      el.removeEventListener('change', clear);
    };

    el.addEventListener('input', clear);
    el.addEventListener('change', clear);
  }

  function markGroupError(id) {
    const el = get(id);
    if (!el) return;

    el.style.outline = '2px solid rgba(255,100,100,.6)';
    el.style.borderRadius = '14px';
    setTimeout(() => {
      el.style.outline = '';
      el.style.borderRadius = '';
    }, 3200);
  }

  return { get, toast, markError, markGroupError };
})();

const Confirmacion = (() => {
  let confirmacionGuardada = load();

  function normalize(raw) {
    if (!raw || typeof raw !== 'object') return null;

    const nombre = String(raw.nombre ?? '').trim();
    const tel = String(raw.tel ?? '').trim();
    const mensaje = String(raw.mensaje ?? '').trim();
    const adultos = Number.parseInt(raw.adultos ?? 0, 10);
    const ninos = Number.parseInt(raw.ninos ?? 0, 10);
    const asiste = raw.asiste === true || raw.asiste === 'si';

    if (!nombre || !tel) return null;

    return {
      nombre,
      tel,
      asiste,
      adultos: Number.isNaN(adultos) ? 0 : adultos,
      ninos: Number.isNaN(ninos) ? 0 : ninos,
      mensaje,
    };
  }

  function load() {
    try {
      return normalize(JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY) ?? 'null'));
    } catch {
      return null;
    }
  }

  function save(data) {
    confirmacionGuardada = normalize(data);

    try {
      if (confirmacionGuardada) {
        localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(confirmacionGuardada));
      } else {
        localStorage.removeItem(RSVP_STORAGE_KEY);
      }
    } catch {}

    return get();
  }

  function get() {
    return confirmacionGuardada ? { ...confirmacionGuardada } : null;
  }

  return { save, get };
})();

function sendToSheets(data) {
  if (!SHEETS_URL) return;

  const params = new URLSearchParams({
    tipo: data.tipo || 'rsvp',
    nombre: data.nombre || '',
    tel: data.tel || '',
    asiste: data.asiste ? 'si' : 'no',
    adultos: String(data.adultos || 0),
    ninos: String(data.ninos || 0),
    mensaje: data.mensaje || '',
    pago: data.pago ? 'si' : '',
  });

  fetch(`${SHEETS_URL}?${params}`, { mode: 'no-cors' }).catch(() => {});
}

const Rsvp = (() => {
  let choice = null;
  const { get, toast, markError, markGroupError } = Ui;

  function select(value) {
    choice = value;
    get('r-si')?.classList.toggle('active', value === 'si');
    get('r-no')?.classList.toggle('active', value === 'no');

    const cantidades = get('cantidades');
    if (cantidades) cantidades.classList.toggle('hidden', value !== 'si');

    const grupo = get('grupo-asistencia');
    if (grupo) {
      grupo.style.outline = '';
      grupo.style.borderRadius = '';
    }
  }

  function submit() {
    const nombre = get('f-nombre')?.value.trim() ?? '';
    const tel = get('f-tel')?.value.trim() ?? '';
    const adultosIngresados = Number.parseInt(get('f-adultos')?.value ?? '', 10);
    const ninosIngresados = Number.parseInt(get('f-ninos')?.value ?? '', 10);
    const mensaje = get('f-mensaje')?.value.trim() ?? '';

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

    if (choice === 'si' && (Number.isNaN(adultosIngresados) || adultosIngresados < 1)) {
      markError('f-adultos');
      toast('Indica cuantos adultos asisten (minimo 1)');
      get('f-adultos')?.focus();
      return;
    }

    if (choice === 'si' && (Number.isNaN(ninosIngresados) || ninosIngresados < 0)) {
      markError('f-ninos');
      toast('El numero de ninos no puede ser negativo');
      get('f-ninos')?.focus();
      return;
    }

    const formData = {
      nombre,
      tel,
      asiste: choice === 'si',
      adultos: choice === 'si' ? adultosIngresados : 0,
      ninos: choice === 'si' ? ninosIngresados : 0,
      mensaje,
    };

    Confirmacion.save(formData);
    sendToSheets(formData);
    Pago.sync();

    const body = get('form-body');
    const ok = get('form-success');
    if (body) body.style.display = 'none';
    if (ok) ok.style.display = 'block';
  }

  return { select, submit };
})();

const Pago = (() => {
  const { get, toast } = Ui;

  function canConfirmPayment(data = Confirmacion.get()) {
    return Boolean(
      data &&
      data.asiste &&
      data.nombre &&
      data.tel &&
      Number(data.adultos) >= 1 &&
      Number(data.ninos) >= 0
    );
  }

  function applyButtonState(btn, disabled) {
    if (!btn) return;

    if (disabled) {
      btn.style.background = 'rgba(184,200,224,.28)';
      btn.style.color = 'rgba(10,22,40,.58)';
      btn.style.boxShadow = 'none';
      btn.style.filter = 'saturate(.65)';
      btn.style.cursor = 'not-allowed';
      return;
    }

    btn.style.background = '';
    btn.style.color = '';
    btn.style.boxShadow = '';
    btn.style.filter = '';
    btn.style.cursor = '';
  }

  function sync() {
    const data = Confirmacion.get();
    const habilitado = canConfirmPayment(data);
    const aviso = get('pago-aviso');
    const btn = get('pago-btn');
    const ok = get('pago-ok');

    if (btn) {
      btn.disabled = !habilitado;
      btn.setAttribute('aria-disabled', habilitado ? 'false' : 'true');
      applyButtonState(btn, !habilitado);
    }

    if (aviso) {
      aviso.textContent = habilitado
        ? 'Ya podes avisar el pago por WhatsApp.'
        : 'Primero confirma si vas, cuantos son y tu WhatsApp para habilitar este paso.';
      aviso.style.color = habilitado
        ? 'rgba(184,200,224,.88)'
        : 'rgba(205,225,250,.72)';
    }

    if (ok) ok.classList.add('hidden');
  }

  function confirmar() {
    const data = Confirmacion.get();

    if (!canConfirmPayment(data)) {
      toast('Primero confirma tu asistencia y la cantidad de invitados');
      document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    sendToSheets({
      ...data,
      tipo: 'pago',
      pago: true,
    });

    const texto = encodeURIComponent(
      `Hola! Te aviso que realice la transferencia para la fiesta de Emma.\nNombre: ${data.nombre}`
    );

    window.open(`https://wa.me/${WA_NUMBER}?text=${texto}`, '_blank');
    get('pago-ok')?.classList.remove('hidden');
  }

  function init() {
    sync();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { confirmar, sync };
})();
