"use client"

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
  totals: ReservationTotals
  onChange: (patch: Partial<ReservationFilters>) => void
}

/** Solo desktop: en mobile los filtros viven en la barra de búsqueda y su hoja. */
export function ReservationsToolbar({ filters, totals, onChange }: ReservationsToolbarProps) {
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
      <ReservationStats totals={totals} />
    </div>
  )
}
