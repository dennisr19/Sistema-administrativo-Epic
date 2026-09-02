import type { Metadata } from "next"
import { Suspense } from "react"

import { ReservationsSkeleton } from "@/components/reservations/reservations-skeleton"
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

  // Las promesas se pasan sin await: el encabezado y los filtros pintan de una
  // y la tabla llega por streaming cuando D1 responde.
  const resultsPromise = listReservations({ organizationId, filters, page })
  const coveragePromise = reservationCoverage(organizationId)
  const totalsPromise = reservationTotals(organizationId, filters)

  return (
    <Suspense fallback={<ReservationsSkeleton />}>
      <ReservationsView
        resultsPromise={resultsPromise}
        coveragePromise={coveragePromise}
        totalsPromise={totalsPromise}
        filters={filters}
        page={page}
        pageSize={RESERVATIONS_PAGE_SIZE}
      />
    </Suspense>
  )
}
