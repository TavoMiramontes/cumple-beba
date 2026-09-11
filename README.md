# Cumple de Beba

Cuenta regresiva al 5 de enero con Beba en pixel art. Cada día hace una
actividad distinta (bailar, cantar, ejercicio, estudiar, comer, leer, cocinar,
pintar, regar, videojuegos, café) y de 22:00 a 7:00 duerme. El cielo cambia con
la hora del teléfono, y el 5 de enero entero es fiesta: invitados, pastel,
globos, confeti, papel picado y Las Mañanitas en chiptune al tocar 🔊.

Una sola página (`index.html`), sin dependencias ni build. Los sprites están
dibujados por código, como en Hop Invaders.

## Abrir

- **En la PC:** abre `index.html` en el navegador.
- **En el celular (misma WiFi):** `node serve.js` y abre en el celular la
  dirección que imprime.

## Ver cualquier escena sin esperar

La página acepta parámetros en la URL:

| Parámetro | Ejemplo | Qué hace |
|---|---|---|
| `fecha` | `?fecha=2027-01-05T15:00` | Arranca el reloj en esa fecha y hora local; desde ahí avanza normal |
| `actividad` | `?actividad=cocinar` | Fuerza la actividad (`bailar`, `cantar`, `ejercicio`, `estudiar`, `comer`, `leer`, `cocinar`, `pintar`, `regar`, `videojuegos`, `cafe`, `dormir`) |

Escenas útiles: `?fecha=2026-09-10T06:45` (amanecer), `?fecha=2026-09-10T19:00`
(atardecer), `?fecha=2026-09-10T23:30` (noche, dormida),
`?fecha=2027-01-04T23:59:50` (el último segundo), `?fecha=2027-01-05T20:00`
(fiesta de noche).

## Verificar

```
node pruebas/fechas.js
```

Prueba la lógica de fechas de `fechas.js` (objetivo, cuenta, bisiestos, franjas
del día, actividad por día). Cada caso trae escrito el número esperado y de
dónde sale.

## Cómo está armado

- `fechas.js` — lógica pura de fechas; recibe «ahora» como parámetro y corre
  igual en Node y en el navegador.
- `index.html` — cielo por hora (paradas de color interpoladas), fuente pixel,
  personaje por partes (cabezas × poses × paletas), props, actividades,
  fiesta, audio y el loop de dibujo.
- Los sprites son matrices de caracteres; `makeSprite` avisa si una fila tiene
  otro ancho o un color sin definir.
- Las posiciones de las actividades están en unidades de cuadrícula (`S`),
  así que cambiar `SPRITE_SCALE` no descuadra nada.
