const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
const months = [
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

/** Se parte la fecha a mano para no arrastrar la zona horaria del navegador. */
export function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number)
  const weekday = weekdays[new Date(Date.UTC(year, month - 1, day)).getUTCDay()]
  return { weekday, day, month: months[month - 1], year, label: `${day} ${months[month - 1]}` }
}

/** Un rango se lee mejor sin repetir el mes ni el año cuando coinciden. */
export function formatRange(from: string, to: string) {
  const a = formatDate(from)
  const b = formatDate(to)
  if (a.year === b.year && a.month === b.month) {
    return `${a.day} a ${b.day} de ${a.month} de ${a.year}`
  }
  if (a.year === b.year) return `${a.day} de ${a.month} a ${b.day} de ${b.month} de ${a.year}`
  return `${a.day} de ${a.month} de ${a.year} a ${b.day} de ${b.month} de ${b.year}`
}

export function formatLongDate(date: string) {
  const { weekday, day, month, year } = formatDate(date)
  return `${weekday} ${day} de ${month} de ${year}`
}

/** La fecha de alta sí es un instante; se presenta en la zona operativa de Costa Rica. */
export function formatCreatedDate(timestamp: string) {
  return new Intl.DateTimeFormat("es-CR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Costa_Rica",
  })
    .format(new Date(timestamp))
    .replace(/\./g, "")
}
