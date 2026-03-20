/* ═══════════════════════════════════════════════════════════
   calendar.js  –  Genera y descarga .ics para Emma 15 Años
   Compatible con iOS Calendar, Google Calendar, Outlook
   ═══════════════════════════════════════════════════════════ */

const Calendar = (() => {
  const EVENT = {
    title:    '🎉 15 Años de Emma',
    start:    '20260822T213000',
    end:      '20260823T030000',
    tz:       'America/Argentina/Mendoza',
    location: 'Marfex Eventos\\, Ruta 40\\, Tunuyán\\, Mendoza\\, Argentina',
    desc:     'Una noche única\\, un recuerdo que queda para siempre\\, ' +
              'y vos como parte de ella haciéndola inolvidable.',
  };

  function buildICS () {
    const uid   = `emma15-${Date.now()}@invitacion`;
    const stamp = new Date().toISOString().replace(/[-:.]/g,'').slice(0,15) + 'Z';
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Emma 15 Anos//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;TZID=${EVENT.tz}:${EVENT.start}`,
      `DTEND;TZID=${EVENT.tz}:${EVENT.end}`,
      `SUMMARY:${EVENT.title}`,
      `DESCRIPTION:${EVENT.desc}`,
      `LOCATION:${EVENT.location}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'TRIGGER:-P1D',
      'DESCRIPTION:¡Mañana es la fiesta de Emma! 🎉',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
  }

  function download () {
    const blob = new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' });
    const a    = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(blob),
      download: 'Emma-15-Anos.ics',
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  }

  return { download };
})();
