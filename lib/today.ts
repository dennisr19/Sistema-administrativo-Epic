/** La operación vive en Costa Rica; el servidor puede estar en cualquier parte. */
export const OPERATION_TIME_ZONE = "America/Costa_Rica"

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: OPERATION_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

/** `yyyy-mm-dd` del día en curso para el operador, no para el servidor. */
export function operationToday(now = new Date()) {
  return formatter.format(now)
}

export function addDays(date: string, days: number) {
  const [year, month, day] = date.split("-").map(Number)
  const moved = new Date(Date.UTC(year, month - 1, day + days))
  return moved.toISOString().slice(0, 10)
}

export type DayRange = { from: string; to: string }

/**
 * Hoy es una pantalla de operación: se mira un día, mañana, o a lo sumo la
 * semana. Los atajos respetan eso, pero el rango libre de la URL lo escribe
 * cualquiera, y sin tope alguien puede pedir un año y traerse la tabla
 * entera a memoria. Este es el techo de lo que la pantalla carga de una.
 */
export const MAX_OPERATION_DAYS = 31

export function daysBetween(from: string, to: string) {
  const start = Date.parse(`${from}T00:00:00Z`)
  const end = Date.parse(`${to}T00:00:00Z`)
  if (Number.isNaN(start) || Number.isNaN(end)) return 0
  return Math.floor((end - start) / 86_400_000) + 1
}

/** Recorta el rango al techo, contando desde el inicio que se pidió. */
export function clampRange(range: DayRange): { range: DayRange; clamped: boolean } {
  const span = daysBetween(range.from, range.to)
  if (span <= MAX_OPERATION_DAYS) return { range, clamped: false }
  return {
    range: { from: range.from, to: addDays(range.from, MAX_OPERATION_DAYS - 1) },
    clamped: true,
  }
}

/** Los atajos de la pantalla de Hoy, expresados como rango de días. */
export function presetRange(preset: "today" | "tomorrow" | "week", today = operationToday()) {
  if (preset === "tomorrow") return { from: addDays(today, 1), to: addDays(today, 1) }
  if (preset === "week") return { from: today, to: addDays(today, 6) }
  return { from: today, to: today }
}

/** Qué atajo corresponde a un rango, o `null` si es uno cualquiera. */
export function matchPreset(range: DayRange, today = operationToday()) {
  for (const preset of ["today", "tomorrow", "week"] as const) {
    const candidate = presetRange(preset, today)
    if (candidate.from === range.from && candidate.to === range.to) return preset
  }
  return null
}
