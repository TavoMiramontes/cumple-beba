// Pruebas de fechas.js. Cada caso lleva el valor esperado y de dónde sale;
// se corre con `node pruebas/fechas.js` y se lee como documento.
const F = require('../fechas.js');

let fallas = 0;
function caso(nombre, obtenido, esperado) {
  const ok = JSON.stringify(obtenido) === JSON.stringify(esperado);
  if (!ok) fallas++;
  console.log(`${ok ? 'OK ' : 'FALLA'} ${nombre}`);
  if (!ok) console.log(`      esperado ${JSON.stringify(esperado)}\n      obtenido ${JSON.stringify(obtenido)}`);
}
// Fechas en hora local, que es la que usa la página
const f = (a, m, d, h = 0, mi = 0, s = 0) => new Date(a, m - 1, d, h, mi, s);
const cuenta = (r) => [r.dias, r.horas, r.min, r.seg, r.esFiesta];

// --- Objetivo -------------------------------------------------------------
caso('10 sep 2026 apunta al 5 ene 2027', F.objetivo(f(2026, 9, 10)).getTime(), f(2027, 1, 5).getTime());
caso('5 ene 2027 23:59 sigue apuntando al 5 ene 2027 (día de fiesta)', F.objetivo(f(2027, 1, 5, 23, 59, 59)).getTime(), f(2027, 1, 5).getTime());
caso('6 ene 2027 00:00 apunta al 5 ene 2028', F.objetivo(f(2027, 1, 6)).getTime(), f(2028, 1, 5).getTime());
caso('1 ene 2027 apunta al 5 ene 2027 (mismo año, antes del cumple)', F.objetivo(f(2027, 1, 1)).getTime(), f(2027, 1, 5).getTime());

// --- Cuenta regresiva -----------------------------------------------------
// 10 sep → 1 oct: 21 días (septiembre tiene 30); + oct 31 = 52; + nov 30 = 82;
// + dic 31 = 113; + 4 días de enero = 117.
caso('10 sep 2026 00:00 → faltan 117 días exactos', cuenta(F.restante(f(2026, 9, 10))), [117, 0, 0, 0, false]);
caso('10 sep 2026 12:00 → 116 días 12 h', cuenta(F.restante(f(2026, 9, 10, 12))), [116, 12, 0, 0, false]);
caso('4 ene 2027 23:59:59 → 1 segundo', cuenta(F.restante(f(2027, 1, 4, 23, 59, 59))), [0, 0, 0, 1, false]);
caso('5 ene 2027 00:00 → 0 y es fiesta', cuenta(F.restante(f(2027, 1, 5))), [0, 0, 0, 0, true]);
caso('5 ene 2027 23:59:59 → sigue en 0 y en fiesta (no cuenta negativo)', cuenta(F.restante(f(2027, 1, 5, 23, 59, 59))), [0, 0, 0, 0, true]);
// Del 5 ene al 5 ene siguiente hay 365 días (366 si el tramo cruza un 29 de
// febrero); el 6 de enero ya se recorrió uno, así que quedan 364 / 365.
caso('6 ene 2027 00:00 → 364 días al 5 ene 2028 (2027 no es bisiesto)', cuenta(F.restante(f(2027, 1, 6))), [364, 0, 0, 0, false]);
caso('5 ene 2028 es fiesta, no día 366', cuenta(F.restante(f(2028, 1, 5, 10))), [0, 0, 0, 0, true]);
caso('6 ene 2028 00:00 → 365 días (2028 bisiesto, cruza el 29 feb)', cuenta(F.restante(f(2028, 1, 6))), [365, 0, 0, 0, false]);
caso('1 ene 2028 00:00 → 4 días (año bisiesto no afecta a enero)', cuenta(F.restante(f(2028, 1, 1))), [4, 0, 0, 0, false]);

// --- Fase del día y sueño -------------------------------------------------
caso('03:00 noche', F.faseDelDia(f(2026, 9, 10, 3)), 'noche');
caso('06:00 amanecer', F.faseDelDia(f(2026, 9, 10, 6)), 'amanecer');
caso('07:59 amanecer', F.faseDelDia(f(2026, 9, 10, 7, 59)), 'amanecer');
caso('08:00 día', F.faseDelDia(f(2026, 9, 10, 8)), 'dia');
caso('17:59 día', F.faseDelDia(f(2026, 9, 10, 17, 59)), 'dia');
caso('18:00 atardecer', F.faseDelDia(f(2026, 9, 10, 18)), 'atardecer');
caso('20:00 noche', F.faseDelDia(f(2026, 9, 10, 20)), 'noche');
caso('13:30 → hora decimal 13.5', F.horaDecimal(f(2026, 9, 10, 13, 30)), 13.5);
caso('23:00 dormida', F.estaDormida(f(2026, 9, 10, 23)), true);
caso('06:59 dormida', F.estaDormida(f(2026, 9, 10, 6, 59)), true);
caso('07:00 despierta', F.estaDormida(f(2026, 9, 10, 7)), false);
caso('21:59 despierta', F.estaDormida(f(2026, 9, 10, 21, 59)), false);
caso('22:00 dormida', F.estaDormida(f(2026, 9, 10, 22)), true);

// --- Actividad del día ----------------------------------------------------
const N = 11;
caso('índice de día: 1 ene 2026 = 0', F.indiceDia(f(2026, 1, 1)), 0);
caso('índice de día: 2 ene 2026 = 1', F.indiceDia(f(2026, 1, 2)), 1);
caso('índice de día: 10 sep 2026 = 252 (31+28+31+30+31+30+31+31 = 243, +9)', F.indiceDia(f(2026, 9, 10)), 252);
caso('mismo día a distintas horas ⇒ misma actividad',
  F.actividadDelDia(f(2026, 9, 10, 8), N) === F.actividadDelDia(f(2026, 9, 10, 21, 30), N), true);
caso('actividad siempre dentro de 0..N-1', (() => {
  for (let k = 0; k < 2000; k++) {
    const a = F.actividadDelDia(new Date(2026, 0, 1 + k), N);
    if (!(a >= 0 && a < N && Number.isInteger(a))) return false;
  }
  return true;
})(), true);
// Se recorren cinco años y medio de días seguidos (incluye muchas fronteras
// de bloque, que es donde el barajado podría repetir).
caso('nunca dos días seguidos con la misma actividad (2000 días)', (() => {
  let ant = F.actividadDelDia(new Date(2026, 0, 1), N);
  for (let k = 1; k < 2000; k++) {
    const a = F.actividadDelDia(new Date(2026, 0, 1 + k), N);
    if (a === ant) return `repite el día ${k}`;
    ant = a;
  }
  return true;
})(), true);
caso('en cualquier tramo de 2N días aparecen todas las actividades', (() => {
  for (let ini = 0; ini < 400; ini += 7) {
    const vistas = new Set();
    for (let k = ini; k < ini + 2 * N; k++) vistas.add(F.actividadDelDia(new Date(2026, 0, 1 + k), N));
    if (vistas.size !== N) return `faltan actividades desde el día ${ini}`;
  }
  return true;
})(), true);
caso('con 1 actividad devuelve 0 sin romperse', F.actividadDelDia(f(2026, 9, 10), 1), 0);

console.log(fallas ? `\n${fallas} caso(s) fallaron` : '\nTodo en orden');
process.exit(fallas ? 1 : 0);
