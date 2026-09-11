// Lógica de fechas del contador, sin DOM: corre igual en el navegador
// (window.Fechas) y en Node (pruebas/fechas.js). «Ahora» siempre llega
// como parámetro para poder probar cualquier instante sin esperar a enero.
(function (raiz) {
  'use strict';

  const MES_CUMPLE = 0;   // enero (getMonth() cuenta desde 0)
  const DIA_CUMPLE = 5;

  // Franjas fijas por hora local. Sin geolocalización: pedir permiso de
  // ubicación por un cielo bonito espanta más de lo que aporta.
  const HORA_DESPIERTA = 7;    // antes de esta hora sigue dormida
  const HORA_DUERME = 22;      // desde esta hora ya está en cama

  function esFiesta(ahora) {
    return ahora.getMonth() === MES_CUMPLE && ahora.getDate() === DIA_CUMPLE;
  }

  // Próximo 5 de enero a las 00:00 local. Todo el día 5 sigue apuntando al
  // 5 de este año (la cuenta marca 0 y la página está en fiesta); a partir
  // del 6 se apunta al año siguiente.
  function objetivo(ahora) {
    let anio = ahora.getFullYear();
    if (ahora >= new Date(anio, MES_CUMPLE, DIA_CUMPLE + 1)) anio++;
    return new Date(anio, MES_CUMPLE, DIA_CUMPLE);
  }

  function restante(ahora) {
    const ms = Math.max(0, objetivo(ahora) - ahora);
    const segTotal = Math.floor(ms / 1000);
    return {
      ms,
      dias: Math.floor(segTotal / 86400),
      horas: Math.floor(segTotal / 3600) % 24,
      min: Math.floor(segTotal / 60) % 60,
      seg: segTotal % 60,
      esFiesta: esFiesta(ahora),
    };
  }

  // Hora del día como decimal (13:30 → 13.5) para interpolar el cielo
  function horaDecimal(ahora) {
    return ahora.getHours() + ahora.getMinutes() / 60 + ahora.getSeconds() / 3600;
  }

  function faseDelDia(ahora) {
    const h = horaDecimal(ahora);
    if (h < 6) return 'noche';
    if (h < 8) return 'amanecer';
    if (h < 18) return 'dia';
    if (h < 20) return 'atardecer';
    return 'noche';
  }

  function estaDormida(ahora) {
    const h = horaDecimal(ahora);
    return h >= HORA_DUERME || h < HORA_DESPIERTA;
  }

  // Días completos desde el 1 de enero de 2026 en hora local. Se calcula
  // con fechas a mediodía para que un cambio de horario de verano no
  // reste una hora y deje el día en x.96.
  const EPOCA = new Date(2026, 0, 1, 12);
  function indiceDia(ahora) {
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 12);
    return Math.round((hoy - EPOCA) / 86400000);
  }

  // Generador determinista (mulberry32): mismo bloque ⇒ misma permutación
  function azar(semilla) {
    let a = semilla >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Permutación de las n actividades para un bloque de n días. Dentro del
  // bloque cada actividad sale exactamente una vez, así que no se repiten
  // días seguidos y ninguna se queda meses sin aparecer.
  function permutacion(bloque, n) {
    const r = azar(bloque * 2654435761 + 12345);
    const p = [];
    for (let i = 0; i < n; i++) p.push(i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = p[i]; p[i] = p[j]; p[j] = t;
    }
    return p;
  }

  // Índice de actividad (0..n-1) del día. El único punto donde dos días
  // seguidos podrían coincidir es la frontera entre bloques (último del
  // bloque b y primero del b+1); ahí se intercambian los dos primeros del
  // bloque nuevo, que es una decisión que ambos días pueden recomputar.
  function actividadDelDia(ahora, n) {
    if (n < 2) return 0;
    const k = indiceDia(ahora);
    const bloque = Math.floor(k / n);
    const pos = ((k % n) + n) % n;
    const p = permutacion(bloque, n);
    const anterior = permutacion(bloque - 1, n);
    if (p[0] === anterior[n - 1]) { const t = p[0]; p[0] = p[1]; p[1] = t; }
    return p[pos];
  }

  const Fechas = {
    MES_CUMPLE, DIA_CUMPLE, HORA_DESPIERTA, HORA_DUERME,
    esFiesta, objetivo, restante, horaDecimal, faseDelDia, estaDormida,
    indiceDia, actividadDelDia,
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Fechas;
  else raiz.Fechas = Fechas;
})(typeof window !== 'undefined' ? window : this);
