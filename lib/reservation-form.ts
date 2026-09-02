import type { Reservation, ReservationStatus } from "@/lib/reservation"

export type MealLine = { option: string; quantity: number }
export type TicketLine = { passport: string; name: string; kind: "adulto" | "niño" }

export type ReservationDraft = {
  tour: string
  date: string
  time: string
  pax: string
  client: string
  hotel: string
  pickup: string
  agent: string
  guide: string
  driver: string
  total: string
  rate: string
  deposit: string
  meals: MealLine[]
  tickets: TicketLine[]
  status: ReservationStatus
  paymentPending: boolean
  notes: string
}

export const emptyDraft: ReservationDraft = {
  tour: "",
  date: "",
  time: "",
  pax: "2",
  client: "",
  hotel: "",
  pickup: "",
  agent: "Directo",
  guide: "",
  driver: "",
  total: "",
  rate: "",
  deposit: "",
  meals: [],
  tickets: [],
  status: "confirmed",
  paymentPending: false,
  notes: "",
}

export function toDraft(reservation: Reservation): ReservationDraft {
  return {
    tour: reservation.tour,
    date: reservation.date,
    time: reservation.time,
    pax: String(reservation.pax),
    client: reservation.client,
    hotel: reservation.hotel,
    pickup: reservation.pickup,
    agent: reservation.agent,
    guide: reservation.guide ?? "",
    driver: reservation.driver ?? "",
    total: reservation.total.replace("$", ""),
    rate: reservation.rate ? String(reservation.rate) : "",
    deposit: reservation.deposit ? String(reservation.deposit) : "",
    meals: reservation.meals ?? [],
    tickets: reservation.tickets ?? [],
    status: reservation.status,
    paymentPending: reservation.issue === "payment",
    notes: reservation.notes ?? "",
  }
}

export type DraftErrors = Partial<
  Record<"tour" | "date" | "time" | "pax" | "client" | "total", string>
>

export function validateDraft(draft: ReservationDraft): DraftErrors {
  const errors: DraftErrors = {}
  if (!draft.tour) errors.tour = "Elige el tour."
  if (!draft.date) errors.date = "Indica la fecha de salida."
  if (!draft.time) errors.time = "Indica la hora de salida."
  if (!Number(draft.pax)) errors.pax = "Indica cuántos pasajeros van."
  if (!draft.client.trim()) errors.client = "Escribe el nombre del cliente."
  if (draft.total !== "" && Number.isNaN(Number(draft.total))) errors.total = "Usa solo números."
  return errors
}

export const stepFields: Record<number, (keyof DraftErrors)[]> = {
  0: ["tour", "date", "time", "pax"],
  1: ["client"],
  2: [],
  3: [],
  4: [],
  5: [],
}

export function summarizeMeals(meals: MealLine[] = []) {
  return meals
    .filter((meal) => meal.option && meal.quantity > 0)
    .map((meal) => `${meal.quantity} ${meal.option}`)
    .join(", ")
}

export function summarizeTickets(tickets: TicketLine[] = []) {
  const named = tickets.filter((ticket) => ticket.name.trim())
  if (!named.length) return ""
  const adults = named.filter((ticket) => ticket.kind === "adulto").length
  const kids = named.length - adults
  const detail = [
    adults ? `${adults} adulto${adults === 1 ? "" : "s"}` : "",
    kids ? `${kids} niño${kids === 1 ? "" : "s"}` : "",
  ]
    .filter(Boolean)
    .join(", ")
  return `${named.length} (${detail})`
}
