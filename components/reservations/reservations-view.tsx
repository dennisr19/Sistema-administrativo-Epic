"use client"

import { IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { Suspense, useState } from "react"
import { ExportMenu } from "@/components/export-menu"
import { PageHeader } from "@/components/page-header"
import { ActiveFilterChips } from "@/components/reservations/active-filter-chips"
import { ReservationFilterSheet } from "@/components/reservations/reservation-filter-sheet"
import { ReservationSearchBar } from "@/components/reservations/reservation-search-bar"
import type { ReservationTotals } from "@/components/reservations/reservation-stats"
import {
  CoverageFallback,
  ReservationsCoverage,
} from "@/components/reservations/reservations-coverage"
import {
  CountFallback,
  ReservationsCount,
  ReservationsResults,
  type Results,
  ResultsFallback,
} from "@/components/reservations/reservations-results"
import { ReservationsToolbar } from "@/components/reservations/reservations-toolbar"
import { useReservationNavigation } from "@/components/reservations/use-reservation-navigation"
import { useSavedToast } from "@/components/reservations/use-saved-toast"
import { ReservationDetailSheet } from "@/components/today/reservation-detail-sheet"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader } from "@/components/ui/card"
import type { Reservation } from "@/lib/reservation"
import {
  countActiveReservationFilters,
  defaultReservationFilters,
  type ReservationFilters,
} from "@/lib/reservation-filters"

type ReservationsViewProps = {
  resultsPromise: Promise<Results>
  coveragePromise: Promise<{ oldest: string | null; newest: string | null }>
  totalsPromise: Promise<ReservationTotals>
  filters: ReservationFilters
  page: number
  pageSize: number
}

/**
 * No hace `use()` de ninguna promesa a este nivel a propósito: así el header,
 * los tabs y el buscador pintan de inmediato y cada bloque de datos —
 * cobertura, totales y la tabla — llega por su cuenta, sin bloquearse entre sí.
 */
export function ReservationsView({
  resultsPromise,
  coveragePromise,
  totalsPromise,
  filters,
  page,
  pageSize,
}: ReservationsViewProps) {
  const router = useRouter()
  useSavedToast()
  // `filters` (optimista) es lo que pintan los controles: responde al clic,
  // no a que D1 conteste. La prop original sigue siendo la base para calcular
  // el próximo valor real en `useReservationNavigation`.
  const {
    pending,
    filters: optimisticFilters,
    setFilters,
    replaceFilters,
    setPage,
  } = useReservationNavigation(filters, page)

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selected, setSelected] = useState<Reservation | null>(null)
  const activeCount = countActiveReservationFilters(optimisticFilters)

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_auto_minmax(0,1fr)] md:gap-4">
      <PageHeader
        title="Reservas"
        subtitle={
          <Suspense fallback={<CoverageFallback />}>
            <ReservationsCoverage promise={coveragePromise} />
          </Suspense>
        }
        onNewReservation={() => router.push("/reservas/nueva")}
      />

      <ReservationsToolbar
        filters={optimisticFilters}
        totalsPromise={totalsPromise}
        onChange={setFilters}
      />

      <Card id="lista" className="min-h-0 gap-0 rounded-xl border-0 py-0 ring-0">
        <CardHeader className="shrink-0 gap-3 px-4 py-4 sm:px-5 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-[-0.025em] md:hidden">Reservas</h1>
              <CardDescription className="mt-0.5 text-sm">
                <Suspense fallback={<CountFallback />}>
                  <ReservationsCount promise={resultsPromise} />
                </Suspense>
              </CardDescription>
            </div>
            {/* En mobile el encabezado de la pantalla no existe: la acción vive aquí. */}
            <Button
              className="h-11 shrink-0 gap-2 px-4 text-[13px] font-medium md:hidden"
              onClick={() => router.push("/reservas/nueva")}
            >
              <IconPlus />
              Nueva
            </Button>
          </div>

          <ReservationSearchBar
            query={optimisticFilters.query}
            activeCount={activeCount}
            onQueryChange={(query) => setFilters({ query })}
            onOpenFilters={() => setFiltersOpen(true)}
            actions={<ExportMenu kind="reservas" />}
          />

          <ActiveFilterChips filters={optimisticFilters} onClear={setFilters} />
        </CardHeader>

        <Suspense fallback={<ResultsFallback />}>
          <ReservationsResults
            promise={resultsPromise}
            pageSize={pageSize}
            pending={pending}
            onSelect={setSelected}
            onClearFilters={() => replaceFilters(defaultReservationFilters)}
            onPageChange={setPage}
          />
        </Suspense>
      </Card>

      <ReservationDetailSheet
        reservation={selected}
        onClose={() => setSelected(null)}
        onEdit={(reservation) => router.push(`/reservas/${reservation.id}/editar`)}
      />
      {filtersOpen ? (
        <ReservationFilterSheet
          filters={filters}
          onApply={replaceFilters}
          onClose={() => setFiltersOpen(false)}
        />
      ) : null}
    </div>
  )
}
