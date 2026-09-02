"use client"

import { usePathname, useRouter } from "next/navigation"
import { Suspense, useOptimistic, useState, useTransition } from "react"
import { PageHeader } from "@/components/page-header"
import { OperationFilterBar } from "@/components/today/operation-filter-bar"
import { OperationFilterSheet } from "@/components/today/operation-filter-sheet"
import { OperationPeriodTabs } from "@/components/today/operation-period-tabs"
import { ReservationDetailSheet } from "@/components/today/reservation-detail-sheet"
import {
  AlertsFallback,
  CountFallback,
  ListFallback,
  TodayAlerts,
  TodayCount,
  TodayList,
} from "@/components/today/today-blocks"
import { TodayToolbar } from "@/components/today/today-toolbar"
import { Card, CardDescription, CardHeader } from "@/components/ui/card"
import { defaultOperationFilters, type OperationFilters } from "@/lib/operation-filters"
import type { OperationalIssue, Reservation, TimeRange } from "@/lib/reservation"
import { type DayRange, MAX_OPERATION_DAYS, matchPreset, presetRange } from "@/lib/today"

type TodayOperationsProps = {
  reservationsPromise: Promise<Reservation[]>
  range: DayRange
  /** El rango pedido pasaba del techo y se recortó: hay que decirlo. */
  clamped?: boolean
  greeting: string
  dateLabel: string
}

/**
 * No hace `use()` de la promesa a este nivel: el encabezado, las pestañas de
 * periodo y la barra de filtros pintan de inmediato, y solo los bloques que
 * de verdad esperan datos —tarjetas, avisos y la lista— muestran skeleton.
 */
export function TodayOperations({
  reservationsPromise,
  range: dayRange,
  clamped = false,
  greeting,
  dateLabel,
}: TodayOperationsProps) {
  const router = useRouter()
  const pathname = usePathname()
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

  const block = { promise: reservationsPromise, filters, activeIssue, page }

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_auto_minmax(0,1fr)] md:gap-4">
      <PageHeader
        title={greeting}
        subtitle={dateLabel}
        onNewReservation={() => router.push("/reservas/nueva")}
      />

      <TodayToolbar
        range={range}
        dayRange={optimisticDayRange}
        promise={reservationsPromise}
        filters={filters}
        activeIssue={activeIssue}
        page={page}
        onSelectRange={selectRange}
        onSelectDays={selectDays}
      />

      <Card id="lista" className="min-h-0 gap-0 rounded-xl border-0 py-0 ring-0">
        <CardHeader className="shrink-0 gap-3 px-4 py-4 sm:px-5 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-[-0.025em] md:hidden">Salidas</h1>
              <h2 className="hidden text-xl font-semibold tracking-[-0.025em] md:block">Salidas</h2>
              <CardDescription className="mt-0.5 text-sm">
                <Suspense fallback={<CountFallback />}>
                  <TodayCount {...block} />
                </Suspense>
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

          {clamped ? (
            <p className="rounded-lg bg-surface-muted px-3 py-2 text-[13px] text-muted-foreground">
              Hoy es la pantalla de la operación, no el historial: se muestran los primeros{" "}
              {MAX_OPERATION_DAYS} días del rango. Para periodos largos, usa Reservas.
            </p>
          ) : null}

          <Suspense fallback={<AlertsFallback />}>
            <TodayAlerts {...block} onSelect={selectIssue} />
          </Suspense>
        </CardHeader>

        <Suspense fallback={<ListFallback />}>
          <TodayList
            {...block}
            pending={pending}
            onSelect={setSelected}
            onClear={clearFilters}
            onPageChange={setPage}
          />
        </Suspense>
      </Card>

      <ReservationDetailSheet reservation={selected} onClose={() => setSelected(null)} />
      {filtersOpen ? (
        <OperationFilterSheet
          filters={filters}
          reservationsPromise={reservationsPromise}
          onApply={changeFilters}
          onClose={() => setFiltersOpen(false)}
        />
      ) : null}
    </div>
  )
}
