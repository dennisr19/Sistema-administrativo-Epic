# Import de la app actual

Generado el 2026-09-01 desde `/Users/sergio/Downloads`.
Reejecutable con `npm run import:seed`; los ids se derivan del nombre, así que no cambian.

## Filas

| Tabla | Filas |
| --- | --- |
| organizations | 1 |
| tours | 20 |
| guides | 25 |
| drivers | 11 |
| hotels | 59 |
| agents | 92 |
| meal_options | 5 |
| reservations | 380 |

## Transformaciones

- Se recortan espacios sobrantes en todos los campos (el export los trae en casi todos).
- `pendiente`, `n/a` y similares pasan a `NULL`: eran un relleno, no un dato.
- Teléfonos guardados solo con dígitos; el formato es cosa de la interfaz.
- Precios y tarifas en céntimos enteros, en dólares, la moneda con la que se cotiza.
- Fechas desde el serial de Excel a ISO, y horas de `07:40 AM` a `07:40`.
- Nombres de cliente en mayúsculas capturadas se pasan a capitalización normal.
- Tours, hoteles, choferes, guías y agentes se referencian por id, no por nombre.
- El export solo trae registros vigentes, así que todo entra como activo.

## Qué hubo que decidir

### agentes

- "Asociacion de Guias de Manuel Antonio" duplica a "Asociacion de Guias de Manuel Antonio"; se unificaron en un registro.
- "FLACO" duplica a "Flaco"; se unificaron en un registro.
- "Mountain Top Park" duplica a "Mountain Top Park"; se unificaron en un registro.
- "Paul Najera GAP" duplica a "Paul Najera GAP"; se unificaron en un registro.

### reservas

- 13 salidas antes de las 04:00, revisar si son AM/PM mal capturados: T146 01:00, T163 01:00, T172 01:00, T219 03:30, T224 01:00, T227 03:30.
