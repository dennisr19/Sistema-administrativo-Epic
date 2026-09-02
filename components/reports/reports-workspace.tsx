"use client"

import { usePathname, useRouter } from "next/navigation"
import { Suspense, useTransition } from "react"

import { ExportMenu } from "@/components/export-menu"
import { PageHeader } from "@/components/page-header"
import { ReportBlocks, ReportBlocksFallback } from "@/components/reports/report-blocks"
import { ReportPeriodBar } from "@/components/reports/report-period-bar"
import { DateRangeControl } from "@/components/reservations/date-range-control"
import type { ReportMetrics } from "@/lib/report-metrics"
import { type Preset, rangeOf } from "@/lib/report-period"
import type { OperationalIssue } from "@/lib/reservation"

type ReportsWorkspaceProps = {
  reportPromise: Promise<ReportMetrics>
  preset: Preset
  range: { from: string; to: string }
}

/**
 * No hace `use()` a este nivel: el encabezado y los controles de periodo
 * pintan de inmediato, y solo el informe —que sí espera a D1— suspende.
 */
export function ReportsWorkspace({ reportPromise, preset, range }: ReportsWorkspaceProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  // El periodo vive en la URL: el informe lo calcula el servidor en SQL.
  const applyRange = (nextPreset: Preset, next: { from: string; to: string }) => {
    startTransition(() => {
      router.replace(`${pathname}?preset=${nextPreset}&desde=${next.from}&hasta=${next.to}`, {
        scroll: false,
      })
    })
  }

  const openReservations = (incident?: "cancelled" | OperationalIssue) => {
    const extra =
      incident === "cancelled" ? "&estado=cancelled" : incident ? `&pendiente=${incident}` : ""
    router.push(`/reservas?desde=${range.from}&hasta=${range.to}${extra}`)
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_minmax(0,1fr)] md:gap-4">
      <PageHeader title="Reportes" subtitle="Analiza el rendimiento del negocio" action={null} />

      {/* Sin una card que lo envuelva todo: cada bloque es su propia superficie,
          y la página scrollea como cualquier tablero. */}
      <div className="min-h-0 overflow-y-auto pb-1">
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold tracking-[-0.025em] md:hidden">Reportes</h1>
            <ReportPeriodBar preset={preset} onPreset={(next) => applyRange(next, rangeOf(next))} />
            <div className="flex items-center gap-2">
              {/* El mismo control de rango que Hoy y Reservas: una sola forma
                  de elegir fechas en toda la app. */}
              <DateRangeControl
                from={range.from}
                to={range.to}
                onChange={(next) => applyRange("custom", next)}
              />
              <ExportMenu kind="reservas" />
            </div>
          </div>

          <Suspense fallback={<ReportBlocksFallback />}>
            <ReportBlocks promise={reportPromise} onOpenReservations={openReservations} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
