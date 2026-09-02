import { ALL } from "@/lib/filter-options"
import {
  defaultReservationFilters,
  type PendingFilter,
  type ReservationFilters,
  type StatusFilter,
} from "@/lib/reservation-filters"

/**
 * Los filtros viven en la URL, no en el estado del cliente. Así la vista es
 * compartible, el botón atrás funciona y el servidor puede filtrar en SQL.
 */
export type ReservationParams = Record<string, string | string[] | undefined>

const one = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() ?? ""

const statuses: StatusFilter[] = ["all", "active", "completed", "cancelled"]
const pendings: PendingFilter[] = ["all", "guide", "driver", "payment"]

const isDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

export function parseReservationParams(params: ReservationParams) {
  const status = one(params.estado) as StatusFilter
  const pending = one(params.pendiente) as PendingFilter
  const page = Number.parseInt(one(params.pagina), 10)

  const filters: ReservationFilters = {
    ...defaultReservationFilters,
    query: one(params.buscar),
    // Solo se aceptan valores conocidos: la URL la escribe cualquiera.
    status: statuses.includes(status) ? status : "all",
    pending: pendings.includes(pending) ? pending : "all",
    from: isDate(one(params.desde)) ? one(params.desde) : "",
    to: isDate(one(params.hasta)) ? one(params.hasta) : "",
    tour: one(params.tour) || ALL,
    hotel: one(params.hotel) || ALL,
    guide: one(params.guia) || ALL,
    agent: one(params.agente) || ALL,
  }

  return { filters, page: Number.isNaN(page) || page < 1 ? 1 : page }
}

/** El inverso: deja fuera todo lo que esté en su valor por defecto. */
export function reservationParamsToQuery(filters: ReservationFilters, page: number) {
  const query = new URLSearchParams()
  const set = (key: string, value: string, fallback = "") => {
    if (value && value !== fallback) query.set(key, value)
  }

  set("buscar", filters.query)
  set("estado", filters.status, "all")
  set("pendiente", filters.pending, "all")
  set("desde", filters.from)
  set("hasta", filters.to)
  set("tour", filters.tour, ALL)
  set("hotel", filters.hotel, ALL)
  set("guia", filters.guide, ALL)
  set("agente", filters.agent, ALL)
  if (page > 1) query.set("pagina", String(page))

  return query.toString()
}
