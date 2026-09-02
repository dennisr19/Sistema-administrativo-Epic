"use client"

import { IconFilterOff } from "@tabler/icons-react"
import { usePathname, useRouter } from "next/navigation"
import { use, useOptimistic, useState, useTransition } from "react"
import { ExportMenu } from "@/components/export-menu"
import { ListPagination } from "@/components/list-pagination"
import { PageHeader } from "@/components/page-header"
import { DateRangeControl } from "@/components/reservations/date-range-control"
import { AlertFilters } from "@/components/today/alert-filters"
import { DesktopReservationTable } from "@/components/today/desktop-reservation-table"
import { MobileReservationList } from "@/components/today/mobile-reservation-list"
import { OperationFilterBar } from "@/components/today/operation-filter-bar"
import { OperationFilterSheet } from "@/components/today/operation-filter-sheet"
import { OperationPeriodTabs } from "@/components/today/operation-period-tabs"
import { OperationStats } from "@/components/today/operation-stats"
import { ReservationDetailSheet } from "@/components/today/reservation-detail-sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card"
import {
  defaultOperationFilters,
  filterReservations,
  type OperationFilters,
} from "@/lib/operation-filters"
import type { OperationalIssue, Reservation, TimeRange } from "@/lib/reservation"
import { type DayRange, matchPreset, presetRange } from "@/lib/today"
import { cn } from "@/lib/utils"

const pageSize = 6

type TodayOperationsProps = {
  reservationsPromise: Promise<Reservation[]>
  range: DayRange
  greeting: string
  dateLabel: string
}

export function TodayOperations({
  reservationsPromise,
  range: dayRange,
  greeting,
  dateLabel,
}: TodayOperationsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const reservations = use(reservationsPromise)
  const [pending, startTransition] = useTransition()
  // El tab y el control de fecha responden al clic, no a que D1 conteste: se
  // adelantan al valor que se está pidiendo mientras la navegación real
  // corre detrás. Mismo patrón que ya prueba bien en Configuración.
  const [optimisticDayRange, setOptimisticDayRange] = useOptimistic(dayRange)
  // El atajo activo se deduce del rango, no se guarda aparte.
  const range = matchPreset(optimisticDayRange) ?? "today"
  const [activeIssue, setActiveIssue] = useState<OperationalIssue | null>(null)
  const [selected, setSelected] = useState<Reservation | null>(null)
  const [filters, setFilters] = useState<OperationFilters>(defaultOperationFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  const reservationsInContext = filterReservations(reservations, filters)
  const counts = reservationsInContext.reduce<Record<OperationalIssue, number>>(
    (total, reservation) => {
      if (reservation.issue) total[reservation.issue] += 1
      return total
    },
    { guide: 0, driver: 0, payment: 0 },
  )
  const filtered = activeIssue
    ? reservationsInContext.filter((reservation) => reservation.issue === activeIssue)
    : reservationsInContext
  const filteredPax = filtered.reduce((total, reservation) => total + reservation.pax, 0)
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visibleReservations = filtered.slice((page - 1) * pageSize, page * pageSize)

  // El rango vive en la URL: es el servidor quien trae esas salidas.
  const selectDays = (next: DayRange) => {
    setActiveIssue(null)
    setPage(1)
    startTransition(() => {
      setOptimisticDayRange(next)
      router.replace(`${pathname}?desde=${next.from}&hasta=${next.to}`, { scroll: false })
    })
  }

  const selectRange = (value: TimeRange) => selectDays(presetRange(value))

  const selectIssue = (issue: OperationalIssue | null) => {
    setActiveIssue(issue)
    setPage(1)
  }

  const changeFilters = (nextFilters: OperationFilters) => {
    setFilters(nextFilters)
    setPage(1)
  }

  const clearFilters = () => {
    setFilters(defaultOperationFilters)
    setActiveIssue(null)
    setPage(1)
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_auto_minmax(0,1fr)] md:gap-4">
      <PageHeader
        title={greeting}
        subtitle={dateLabel}
        onNewReservation={() => router.push("/reservas/nueva")}
      />

      <div className="hidden gap-4 md:grid">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <OperationPeriodTabs value={range} onValueChange={selectRange} />
          <div className="flex items-center gap-2">
            {/* Los presets cubren el día a día; el rango sirve para lo demás. */}
            <DateRangeControl
              from={optimisticDayRange.from}
              to={optimisticDayRange.to}
              onChange={selectDays}
            />
            <ExportMenu kind="hoy" />
          </div>
        </div>
        <OperationStats reservations={reservationsInContext} counts={counts} />
      </div>

      <Card id="lista" className="min-h-0 gap-0 rounded-xl border-0 py-0 ring-0">
        <CardHeader className="shrink-0 gap-3 px-4 py-4 sm:px-5 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-[-0.025em] md:hidden">Salidas</h1>
              <h2 className="hidden text-xl font-semibold tracking-[-0.025em] md:block">Salidas</h2>
              <CardDescription className="mt-0.5 text-sm">
                {filtered.length} {filtered.length === 1 ? "reserva" : "reservas"}, {filteredPax}{" "}
                {filteredPax === 1 ? "pasajero" : "pasajeros"} en total
              </CardDescription>
            </div>
          </div>

          <OperationPeriodTabs
            value={range}
            onValueChange={selectRange}
            className="md:hidden"
            stretch
          />

          <OperationFilterBar
            filters={filters}
            onChange={changeFilters}
            onOpen={() => setFiltersOpen(true)}
          />

          <AlertFilters counts={counts} activeIssue={activeIssue} onSelect={selectIssue} />
        </CardHeader>

        <CardContent
          // Mientras llega el periodo nuevo se atenúa el anterior en vez de vaciarlo.
          className={cn(
            "min-h-0 flex-1 overflow-y-auto px-0 transition-opacity",
            pending && "opacity-60",
          )}
          aria-busy={pending}
        >
          {visibleReservations.length ? (
            <>
              <DesktopReservationTable reservations={visibleReservations} onSelect={setSelected} />
              <MobileReservationList reservations={visibleReservations} onSelect={setSelected} />
            </>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <IconFilterOff className="size-5" />
              </span>
              <p className="font-semibold">Nada pendiente en esta categoría</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Cambia los filtros o vuelve a ver toda la operación.
              </p>
              <Button variant="secondary" className="mt-4" onClick={clearFilters}>
                Ver todas
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="h-14 shrink-0 justify-between bg-surface-muted px-4 py-2 sm:px-6">
          <span className="shrink-0 text-[13px] whitespace-nowrap text-muted-foreground tabular-nums">
            {filtered.length
              ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, filtered.length)} de ${filtered.length}`
              : "0 reservas"}
          </span>
          <ListPagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </CardFooter>
      </Card>

      <ReservationDetailSheet reservation={selected} onClose={() => setSelected(null)} />
      {filtersOpen ? (
        <OperationFilterSheet
          filters={filters}
          reservations={reservations}
          onApply={changeFilters}
          onClose={() => setFiltersOpen(false)}
        />
      ) : null}
    </div>
  )
}
