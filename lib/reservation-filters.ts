/** Cuántas filas trae una página de la tabla de Reservas. Vive aquí y no
 * en la consulta porque el esqueleto también la necesita, y ese es cliente. */
export const RESERVATIONS_PAGE_SIZE = 8

import { countEntityFilters, defaultEntityFilters, type EntityFilters } from "@/lib/filter-options"
import type { OperationalIssue } from "@/lib/reservation"

export type StatusFilter = "all" | "active" | "completed" | "cancelled"

export type PendingFilter = "all" | OperationalIssue

export type ReservationFilters = EntityFilters & {
  query: string
  status: StatusFilter
  pending: PendingFilter
  from: string
  to: string
}

export const pendingLabels: Record<OperationalIssue, string> = {
  guide: "Sin guía asignado",
  driver: "Sin chofer",
  payment: "Pago pendiente",
}

export const defaultReservationFilters: ReservationFilters = {
  ...defaultEntityFilters,
  query: "",
  status: "all",
  pending: "all",
  from: "",
  to: "",
}

export const statusOptions = [
  { value: "all" as const, label: "Todas" },
  { value: "active" as const, label: "Activas" },
  { value: "completed" as const, label: "Completadas" },
  { value: "cancelled" as const, label: "Canceladas" },
]

export function countActiveReservationFilters(filters: ReservationFilters) {
  return (
    Number(Boolean(filters.from || filters.to)) +
    Number(filters.pending !== "all") +
    Number(filters.status !== "all") +
    countEntityFilters(filters)
  )
}

export function hasInvalidRange(filters: ReservationFilters) {
  return Boolean(filters.from && filters.to && filters.from > filters.to)
}
