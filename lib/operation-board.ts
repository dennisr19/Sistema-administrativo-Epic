import { filterReservations, type OperationFilters } from "@/lib/operation-filters"
import type { OperationalIssue, Reservation } from "@/lib/reservation"

/** Cuántas salidas entran en una página de la lista de Hoy. */
export const OPERATION_PAGE_SIZE = 6

type BoardInput = {
  reservations: Reservation[]
  filters: OperationFilters
  activeIssue: OperationalIssue | null
  page: number
}

/**
 * Todo lo que se deriva de las salidas del periodo. Es una función pura y no
 * un hook a propósito: los bloques que suspenden por separado (las tarjetas,
 * los avisos y la tabla) la llaman cada uno con el mismo arreglo, sin tener
 * que compartir estado entre ellos.
 */
export function deriveOperation({ reservations, filters, activeIssue, page }: BoardInput) {
  const inContext = filterReservations(reservations, filters)

  const counts = inContext.reduce<Record<OperationalIssue, number>>(
    (total, reservation) => {
      if (reservation.issue) total[reservation.issue] += 1
      return total
    },
    { guide: 0, driver: 0, payment: 0 },
  )

  const filtered = activeIssue
    ? inContext.filter((reservation) => reservation.issue === activeIssue)
    : inContext

  return {
    inContext,
    counts,
    filtered,
    pax: filtered.reduce((total, reservation) => total + reservation.pax, 0),
    pageCount: Math.max(1, Math.ceil(filtered.length / OPERATION_PAGE_SIZE)),
    visible: filtered.slice((page - 1) * OPERATION_PAGE_SIZE, page * OPERATION_PAGE_SIZE),
  }
}
