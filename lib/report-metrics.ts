import type { Reservation } from "@/lib/reservation"

export type Ranking = {
  label: string
  value: number
  detail: string
  share: number
}

export type Delta = number | null

export type ReportMetrics = {
  reservations: number
  pax: number
  income: number
  ticket: number
  cancelled: { count: number; income: number; share: number }
  pending: { guide: number; driver: number; payment: number; income: number }
  topTours: Ranking[]
  topAgents: Ranking[]
  topHotels: Ranking[]
  /** Contra el periodo inmediatamente anterior de la misma duración. `null` si no hay con qué comparar. */
  deltas: {
    reservations: Delta
    pax: Delta
    income: Delta
    ticket: Delta
  }
  previous: { from: string; to: string }
}

const amount = (reservation: Reservation) => Number(reservation.total.replace("$", "")) || 0

function rank(
  rows: Reservation[],
  key: (reservation: Reservation) => string,
  metric: "income" | "reservations",
): Ranking[] {
  const totals = new Map<string, { value: number; reservations: number; pax: number }>()

  for (const reservation of rows) {
    const name = key(reservation)
    const current = totals.get(name) ?? { value: 0, reservations: 0, pax: 0 }
    current.value += metric === "income" ? amount(reservation) : 1
    current.reservations += 1
    current.pax += reservation.pax
    totals.set(name, current)
  }

  const ordered = [...totals.entries()].sort((a, b) => b[1].value - a[1].value).slice(0, 3)
  const top = ordered[0]?.[1].value ?? 0

  return ordered.map(([label, data]) => ({
    label,
    value: data.value,
    share: top ? data.value / top : 0,
    detail:
      metric === "income"
        ? `${data.reservations} ${data.reservations === 1 ? "reserva" : "reservas"}`
        : `${data.pax} pax`,
  }))
}

type BaseMetrics = Omit<ReportMetrics, "deltas" | "previous">

function computeBase(all: Reservation[], from: string, to: string): BaseMetrics {
  const inRange = all.filter((reservation) => reservation.date >= from && reservation.date <= to)
  // El dinero y el volumen se cuentan sobre lo que sí operó.
  const active = inRange.filter((reservation) => reservation.status !== "cancelled")
  const cancelled = inRange.filter((reservation) => reservation.status === "cancelled")

  const income = active.reduce((total, reservation) => total + amount(reservation), 0)
  const pendingRows = active.filter((reservation) => reservation.issue === "payment")

  return {
    reservations: active.length,
    pax: active.reduce((total, reservation) => total + reservation.pax, 0),
    income,
    ticket: active.length ? Math.round(income / active.length) : 0,
    cancelled: {
      count: cancelled.length,
      income: cancelled.reduce((total, reservation) => total + amount(reservation), 0),
      share: inRange.length ? cancelled.length / inRange.length : 0,
    },
    pending: {
      guide: active.filter((reservation) => reservation.issue === "guide").length,
      driver: active.filter((reservation) => reservation.issue === "driver").length,
      payment: pendingRows.length,
      income: pendingRows.reduce((total, reservation) => total + amount(reservation), 0),
    },
    topTours: rank(active, (reservation) => reservation.tour, "income"),
    topAgents: rank(active, (reservation) => reservation.agent, "income"),
    topHotels: rank(active, (reservation) => reservation.hotel, "reservations"),
  }
}

const dayMs = 86400000
const iso = (value: number) => new Date(value).toISOString().slice(0, 10)

/** El periodo inmediatamente anterior, de la misma duración. */
export function previousPeriod(from: string, to: string) {
  const start = Date.parse(`${from}T00:00:00Z`)
  const end = Date.parse(`${to}T00:00:00Z`)
  const length = Math.max(0, Math.round((end - start) / dayMs))
  return { from: iso(start - (length + 1) * dayMs), to: iso(start - dayMs) }
}

function delta(current: number, previous: number): Delta {
  if (!previous) return null
  return Math.round(((current - previous) / previous) * 100)
}

export function computeReport(all: Reservation[], from: string, to: string): ReportMetrics {
  const current = computeBase(all, from, to)
  const previous = previousPeriod(from, to)
  const before = computeBase(all, previous.from, previous.to)

  return {
    ...current,
    previous,
    deltas: {
      reservations: delta(current.reservations, before.reservations),
      pax: delta(current.pax, before.pax),
      income: delta(current.income, before.income),
      ticket: delta(current.ticket, before.ticket),
    },
  }
}

export function monthRange(reference: string) {
  const [year, month] = reference.split("-").map(Number)
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const pad = (value: number) => String(value).padStart(2, "0")
  return { from: `${year}-${pad(month)}-01`, to: `${year}-${pad(month)}-${pad(last)}` }
}

export function shiftMonth(reference: string, months: number) {
  const [year, month] = reference.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1 + months, 1))
  return monthRange(
    `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`,
  )
}

export function daysBack(reference: string, days: number) {
  const [year, month, day] = reference.split("-").map(Number)
  const from = new Date(Date.UTC(year, month - 1, day - days + 1)).toISOString().slice(0, 10)
  return { from, to: reference }
}
