"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback, useTransition } from "react"

import type { ReservationFilters } from "@/lib/reservation-filters"
import { reservationParamsToQuery } from "@/lib/reservation-search-params"

/**
 * Los filtros viven en la URL. Cambiarlos es navegar, dentro de una transición
 * para que la tabla anterior siga visible mientras llega la nueva.
 */
export function useReservationNavigation(filters: ReservationFilters, _page: number) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  const go = useCallback(
    (nextFilters: ReservationFilters, nextPage: number) => {
      const query = reservationParamsToQuery(nextFilters, nextPage)
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
      })
    },
    [router, pathname],
  )

  return {
    pending,
    /** Cambiar cualquier filtro devuelve a la primera página. */
    setFilters: useCallback(
      (patch: Partial<ReservationFilters>) => go({ ...filters, ...patch }, 1),
      [filters, go],
    ),
    replaceFilters: useCallback((next: ReservationFilters) => go(next, 1), [go]),
    setPage: useCallback((next: number) => go(filters, next), [filters, go]),
  }
}
