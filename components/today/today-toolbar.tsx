"use client"

import { Suspense } from "react"

import { ExportMenu } from "@/components/export-menu"
import { DateRangeControl } from "@/components/reservations/date-range-control"
import { OperationPeriodTabs } from "@/components/today/operation-period-tabs"
import { StatsFallback, TodayStats } from "@/components/today/today-blocks"
import type { OperationFilters } from "@/lib/operation-filters"
import type { OperationalIssue, Reservation, TimeRange } from "@/lib/reservation"
import type { DayRange } from "@/lib/today"

type TodayToolbarProps = {
  range: TimeRange
  dayRange: DayRange
  promise: Promise<Reservation[]>
  filters: OperationFilters
  activeIssue: OperationalIssue | null
  page: number
  onSelectRange: (value: TimeRange) => void
  onSelectDays: (next: DayRange) => void
}

/** Solo desktop: en mobile las pestañas de periodo viven dentro de la card. */
export function TodayToolbar({
  range,
  dayRange,
  promise,
  filters,
  activeIssue,
  page,
  onSelectRange,
  onSelectDays,
}: TodayToolbarProps) {
  return (
    <div className="hidden gap-4 md:grid">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <OperationPeriodTabs value={range} onValueChange={onSelectRange} />
        <div className="flex items-center gap-2">
          {/* Los presets cubren el día a día; el rango sirve para lo demás. */}
          <DateRangeControl from={dayRange.from} to={dayRange.to} onChange={onSelectDays} />
          <ExportMenu kind="hoy" />
        </div>
      </div>

      {/* Las pestañas y el rango no esperan a nadie: solo las tarjetas suspenden. */}
      <Suspense fallback={<StatsFallback />}>
        <TodayStats promise={promise} filters={filters} activeIssue={activeIssue} page={page} />
      </Suspense>
    </div>
  )
}
