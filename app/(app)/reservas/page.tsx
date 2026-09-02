import type { Metadata } from "next"

import { ReservationsView } from "@/components/reservations/reservations-view"
import {
  listReservations,
  RESERVATIONS_PAGE_SIZE,
  reservationCoverage,
  reservationTotals,
} from "@/db/queries/reservations"
import { requireSession } from "@/lib/auth/server"
import { parseReservationParams, type ReservationParams } from "@/lib/reservation-search-params"

export const metadata: Metadata = {
  title: "Reservas | Sistema Administrativo Epic",
}

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<ReservationParams>
}) {
  const [{ organizationId }, params] = await Promise.all([requireSession(), searchParams])
  const { filters, page } = parseReservationParams(params)

  // Las promesas se pasan sin await y sin un Suspense que las envuelva a las
  // tres: cada bloque tiene el suyo dentro de la vista, así que el header y
  // los filtros pintan de una y cobertura, totales y tabla llegan por
  // separado, sin que la consulta más lenta bloquee a las otras dos.
  const resultsPromise = listReservations({ organizationId, filters, page })
  const coveragePromise = reservationCoverage(organizationId)
  const totalsPromise = reservationTotals(organizationId, filters)

  return (
    <ReservationsView
      resultsPromise={resultsPromise}
      coveragePromise={coveragePromise}
      totalsPromise={totalsPromise}
      filters={filters}
      page={page}
      pageSize={RESERVATIONS_PAGE_SIZE}
    />
  )
}
