/** Una sola fuente para los filtros de Hoy y de Reservas: no pueden divergir. */
export const ALL = "all"
/** Filtro explícito para lo que todavía no tiene a nadie asignado. */
export const UNASSIGNED = "unassigned"

export type EntityFilters = {
  tour: string
  hotel: string
  guide: string
  agent: string
}

export const defaultEntityFilters: EntityFilters = {
  tour: ALL,
  hotel: ALL,
  guide: ALL,
  agent: ALL,
}

export function countEntityFilters(filters: EntityFilters) {
  return (
    Number(filters.tour !== ALL) +
    Number(filters.hotel !== ALL) +
    Number(filters.guide !== ALL) +
    Number(filters.agent !== ALL)
  )
}

export function matchesEntityFilters(
  reservation: { tour: string; hotel: string; guide: string | null; agent: string },
  filters: EntityFilters,
) {
  if (filters.tour !== ALL && reservation.tour !== filters.tour) return false
  if (filters.hotel !== ALL && reservation.hotel !== filters.hotel) return false
  if (filters.agent !== ALL && reservation.agent !== filters.agent) return false
  if (filters.guide === UNASSIGNED && reservation.guide) return false
  if (
    filters.guide !== ALL &&
    filters.guide !== UNASSIGNED &&
    reservation.guide !== filters.guide
  ) {
    return false
  }
  return true
}
