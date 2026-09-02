/** Todo se calcula en UTC para que la zona del navegador no corra un día. */
const utc = (year: number, month: number, day: number) => new Date(Date.UTC(year, month, day))

export const toIso = (date: Date) => date.toISOString().slice(0, 10)

export const parseIso = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number)
  return utc(year, month - 1, day)
}

export type CalendarDay = {
  iso: string
  day: number
  /** `false` en los días de relleno del mes anterior o siguiente. */
  inMonth: boolean
}

export const monthNames = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
]

/** Iniciales de domingo a sábado. Las dos emes se distinguen por posición, y
 *  cada una lleva su propia llave porque se repiten. */
export const weekdays = [
  { key: "dom", initial: "D" },
  { key: "lun", initial: "L" },
  { key: "mar", initial: "M" },
  { key: "mie", initial: "M" },
  { key: "jue", initial: "J" },
  { key: "vie", initial: "V" },
  { key: "sab", initial: "S" },
]

/** Seis semanas siempre: la rejilla no cambia de alto al pasar de mes. */
export function monthGrid(year: number, month: number): CalendarDay[] {
  const first = utc(year, month, 1)
  const start = first.getUTCDate() - first.getUTCDay()

  return Array.from({ length: 42 }, (_, index) => {
    const date = utc(year, month, start + index)
    return {
      iso: toIso(date),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === ((month % 12) + 12) % 12,
    }
  })
}

export function shiftMonths(year: number, month: number, delta: number) {
  const moved = utc(year, month + delta, 1)
  return { year: moved.getUTCFullYear(), month: moved.getUTCMonth() }
}

export function monthTitle(year: number, month: number) {
  const moved = utc(year, month, 1)
  const name = monthNames[moved.getUTCMonth()]
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${moved.getUTCFullYear()}`
}

/** Etiqueta corta del rango, sin repetir mes ni año cuando coinciden. */
export function rangeLabel(from: string, to: string) {
  if (!from && !to) return "Todo el historial"
  if (from && !to) return `Desde ${shortDate(from)}`
  if (!from && to) return `Hasta ${shortDate(to)}`

  const a = parseIso(from)
  const b = parseIso(to)
  if (from === to) return shortDate(from)
  if (a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()) {
    return `${a.getUTCDate()} a ${b.getUTCDate()} ${monthNames[a.getUTCMonth()].slice(0, 3)}`
  }
  return `${shortDate(from)} a ${shortDate(to)}`
}

function shortDate(iso: string) {
  const date = parseIso(iso)
  return `${date.getUTCDate()} ${monthNames[date.getUTCMonth()].slice(0, 3)}`
}
