"use client"

import { IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { use, useState } from "react"
import { ExportMenu } from "@/components/export-menu"
import { ListPagination } from "@/components/list-pagination"
import { PageHeader } from "@/components/page-header"
import { ActiveFilterChips } from "@/components/reservations/active-filter-chips"
import { ReservationFilterSheet } from "@/components/reservations/reservation-filter-sheet"
import { ReservationSearchBar } from "@/components/reservations/reservation-search-bar"
import type { ReservationTotals } from "@/components/reservations/reservation-stats"
import { ReservationsEmpty } from "@/components/reservations/reservations-empty"
import { ReservationsList } from "@/components/reservations/reservations-list"
import { ReservationsTable } from "@/components/reservations/reservations-table"
import { ReservationsToolbar } from "@/components/reservations/reservations-toolbar"
import { useReservationNavigation } from "@/components/reservations/use-reservation-navigation"
import { useSavedToast } from "@/components/reservations/use-saved-toast"
import { ReservationDetailSheet } from "@/components/today/reservation-detail-sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import { formatDate } from "@/lib/format-date"
import type { Reservation } from "@/lib/reservation"
import {
  countActiveReservationFilters,
  defaultReservationFilters,
  type ReservationFilters,
} from "@/lib/reservation-filters"
import { cn } from "@/lib/utils"

type Results = {
  reservations: Reservation[]
  total: number
  page: number
  pageCount: number
}

type ReservationsViewProps = {
  resultsPromise: Promise<Results>
  coveragePromise: Promise<{ oldest: string | null; newest: string | null }>
  totalsPromise: Promise<ReservationTotals>
  filters: ReservationFilters
  page: number
  pageSize: number
}

const coverageLabel = (oldest: string | null, newest: string | null) => {
  if (!oldest || !newest) return "Historial completo"
  const from = formatDate(oldest)
  const to = formatDate(newest)
  return `Historial de ${from.month} ${from.year} a ${to.month} ${to.year}`
}

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
  const results = use(resultsPromise)
  const coverage = use(coveragePromise)
  const totals = use(totalsPromise)
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
  const from = results.total ? (results.page - 1) * pageSize + 1 : 0
  const to = Math.min(results.page * pageSize, results.total)

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_auto_minmax(0,1fr)] md:gap-4">
      <PageHeader
        title="Reservas"
        subtitle={coverageLabel(coverage.oldest, coverage.newest)}
        onNewReservation={() => router.push("/reservas/nueva")}
      />

      <ReservationsToolbar filters={optimisticFilters} totals={totals} onChange={setFilters} />

      <Card id="lista" className="min-h-0 gap-0 rounded-xl border-0 py-0 ring-0">
        <CardHeader className="shrink-0 gap-3 px-4 py-4 sm:px-5 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-[-0.025em] md:hidden">Reservas</h1>
              <CardDescription className="mt-0.5 text-sm">
                {results.total}{" "}
                {results.total === 1 ? "reserva encontrada" : "reservas encontradas"}
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

        <CardContent
          // Mientras llega la página nueva se atenúa la vieja en vez de vaciarla.
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-0 transition-opacity",
            pending && "opacity-60",
          )}
          aria-busy={pending}
        >
          {results.reservations.length ? (
            <>
              <ReservationsTable reservations={results.reservations} onSelect={setSelected} />
              <ReservationsList reservations={results.reservations} onSelect={setSelected} />
            </>
          ) : (
            <ReservationsEmpty onClear={() => replaceFilters(defaultReservationFilters)} />
          )}
        </CardContent>

        <CardFooter className="h-14 shrink-0 justify-between bg-surface-muted px-4 py-2 sm:px-6">
          <span className="shrink-0 text-[13px] whitespace-nowrap text-muted-foreground tabular-nums">
            {results.total ? `${from}-${to} de ${results.total}` : "0 reservas"}
          </span>
          <ListPagination
            page={results.page}
            pageCount={results.pageCount}
            onPageChange={setPage}
          />
        </CardFooter>
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
