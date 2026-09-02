import "server-only"

import { agents, drivers, guides, hotels, reservations, tours } from "@/db/schema"
import { DEFAULT_TOUR_KIND, issueOf, money, type Reservation } from "@/lib/reservation"

/** Las columnas que alimentan el modelo de vista, con los nombres ya resueltos. */
export const reservationColumns = {
  id: reservations.id,
  code: reservations.code,
  date: reservations.date,
  time: reservations.time,
  status: reservations.status,
  customerName: reservations.customerName,
  people: reservations.people,
  pickupPoint: reservations.pickupPoint,
  netRateCents: reservations.netRateCents,
  depositCents: reservations.depositCents,
  paymentPending: reservations.paymentPending,
  note: reservations.note,
  tour: tours.name,
  tourKind: tours.kind,
  hotel: hotels.name,
  hotelAddress: hotels.address,
  guide: guides.name,
  driver: drivers.name,
  agent: agents.name,
}

type Row = { [K in keyof typeof reservationColumns]: unknown }

const dayLabel = (date: string, today: string, tomorrow: string) => {
  if (date === today) return "Hoy"
  if (date === tomorrow) return "Mañana"
  return date
}

/** Convierte una fila de la base en lo que las pantallas esperan. */
export function toReservation(row: Row, today: string, tomorrow: string): Reservation {
  const people = Number(row.people) || 0
  const rate = Number(row.netRateCents) / 100
  const deposit = Number(row.depositCents) / 100
  const guide = (row.guide as string | null) ?? null
  const driver = (row.driver as string | null) ?? null
  const paymentPending = Boolean(row.paymentPending)
  const date = String(row.date)

  return {
    id: String(row.id),
    code: String(row.code),
    date,
    status: row.status as Reservation["status"],
    dayLabel: dayLabel(date, today, tomorrow),
    time: (row.time as string | null) ?? "",
    tour: (row.tour as string | null) ?? "Sin tour",
    client: String(row.customerName),
    // Sin agente, la reserva entró directo.
    agent: (row.agent as string | null) ?? "Directo",
    pax: people,
    hotel: (row.hotel as string | null) ?? "",
    location: (row.hotelAddress as string | null) ?? "",
    pickup: (row.pickupPoint as string | null) ?? "",
    guide,
    driver,
    total: money(rate * people),
    rate: rate || undefined,
    deposit: deposit || undefined,
    notes: (row.note as string | null) ?? undefined,
    // Solo lo confirmado tiene pendientes: lo cancelado o completado ya no opera.
    issue: row.status === "confirmed" ? issueOf({ guide, driver, paymentPending }) : undefined,
    kind: ((row.tourKind as Reservation["kind"] | null) ??
      DEFAULT_TOUR_KIND) as Reservation["kind"],
  }
}
