"use client"

import { Suspense, use } from "react"

import { ExportMenu } from "@/components/export-menu"
import { DateRangeControl } from "@/components/reservations/date-range-control"
import {
  ReservationStats,
  type ReservationTotals,
} from "@/components/reservations/reservation-stats"
import { SegmentedTabs } from "@/components/segmented-tabs"
import type { ReservationFilters, StatusFilter } from "@/lib/reservation-filters"
import { statusOptions } from "@/lib/reservation-filters"

type ReservationsToolbarProps = {
  filters: ReservationFilters
  totalsPromise: Promise<ReservationTotals>
  onChange: (patch: Partial<ReservationFilters>) => void
}

function Stats({ promise }: { promise: Promise<ReservationTotals> }) {
  return <ReservationStats totals={use(promise)} />
}

/** Cuatro tarjetas del mismo alto que las reales. */
function StatsFallback() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {["a", "b", "c", "d"].map((stat) => (
        <div key={stat} className="h-[68px] animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  )
}

/** Solo desktop: en mobile los filtros viven en la barra de búsqueda y su hoja. */
export function ReservationsToolbar({
  filters,
  totalsPromise,
  onChange,
}: ReservationsToolbarProps) {
  return (
    <div className="hidden gap-4 md:grid">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedTabs
          value={filters.status}
          options={statusOptions}
          onValueChange={(status: StatusFilter) => onChange({ status })}
          ariaLabel="Estado de la reserva"
        />
        {/* ml-auto: en tablet este grupo se envuelve a su propia fila, donde
        justify-between ya no tiene con quién repartir espacio. */}
        <div className="ml-auto flex items-center gap-2">
          <DateRangeControl from={filters.from} to={filters.to} onChange={onChange} />
          <ExportMenu kind="reservas" />
        </div>
      </div>

      {/* Los tabs y el rango no esperan a nadie: solo los totales suspenden. */}
      <Suspense fallback={<StatsFallback />}>
        <Stats promise={totalsPromise} />
      </Suspense>
    </div>
  )
}
