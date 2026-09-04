export type TimeRange = "today" | "tomorrow" | "week"
export type OperationalIssue = "guide" | "driver" | "payment"
export type ReservationStatus = "confirmed" | "completed" | "cancelled"
export type TourKind = "mountain" | "water" | "nature" | "city"

/**
 * Lo que las pantallas necesitan de una reserva, ya resuelto. Las consultas lo
 * arman desde D1; los componentes no saben de tablas ni de llaves foráneas.
 */
export type Reservation = {
  id: string
  /** Consecutivo visible para el operador, `T113`. */
  code: string
  /** ISO `yyyy-mm-dd`. */
  date: string
  /** ISO 8601 del momento en que se registró la reserva. */
  createdAt: string
  status: ReservationStatus
  dayLabel: string
  time: string
  tour: string
  client: string
  agent: string
  pax: number
  hotel: string
  location: string
  pickup: string
  guide: string | null
  driver: string | null
  total: string
  rate?: number
  deposit?: number
  meals?: { option: string; quantity: number }[]
  tickets?: { passport: string; name: string; kind: "adulto" | "niño" }[]
  notes?: string
  /** Se deduce de lo que falta, nunca se elige a mano. */
  issue?: OperationalIssue
  kind: TourKind
}

/** Sin tipo registrado, el icono cae en el neutro en vez de desaparecer. */
export const DEFAULT_TOUR_KIND: TourKind = "nature"

export const money = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`

export function issueOf(input: {
  guide: string | null
  driver: string | null
  paymentPending: boolean
}): OperationalIssue | undefined {
  if (!input.guide) return "guide"
  if (!input.driver) return "driver"
  if (input.paymentPending) return "payment"
  return undefined
}
