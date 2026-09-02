"use client"

import {
  IconArrowRight,
  IconCalendarEvent,
  IconCoin,
  IconReceipt,
  IconUsers,
} from "@tabler/icons-react"
import { usePathname, useRouter } from "next/navigation"
import { use, useTransition } from "react"

import { ExportMenu } from "@/components/export-menu"
import { PageHeader } from "@/components/page-header"
import { ReportHighlight } from "@/components/reports/report-highlight"
import { ReportIncidents } from "@/components/reports/report-incidents"
import { ReportKpis } from "@/components/reports/report-kpis"
import { ReportPeriodBar } from "@/components/reports/report-period-bar"
import { ReportRanking } from "@/components/reports/report-ranking"
import { DateRangeControl } from "@/components/reservations/date-range-control"
import { Button } from "@/components/ui/button"
import type { ReportMetrics } from "@/lib/report-metrics"
import { summarize } from "@/lib/report-narrative"
import { type Preset, rangeOf } from "@/lib/report-period"
import type { OperationalIssue } from "@/lib/reservation"

const money = (value: number) => `$${value.toLocaleString("en-US")}`

type ReportsWorkspaceProps = {
  reportPromise: Promise<ReportMetrics>
  preset: Preset
  range: { from: string; to: string }
}

export function ReportsWorkspace({ reportPromise, preset, range }: ReportsWorkspaceProps) {
  const router = useRouter()
  const pathname = usePathname()
  const report = use(reportPromise)
  const [, startTransition] = useTransition()

  // El periodo vive en la URL: el informe lo calcula el servidor en SQL.
  const applyRange = (nextPreset: Preset, next: { from: string; to: string }) => {
    startTransition(() => {
      router.replace(`${pathname}?preset=${nextPreset}&desde=${next.from}&hasta=${next.to}`, {
        scroll: false,
      })
    })
  }
  const total = report.reservations + report.cancelled.count

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

          <ReportKpis
            items={[
              {
                value: String(report.reservations),
                label: "Reservas",
                delta: report.deltas.reservations,
                icon: IconCalendarEvent,
                tone: "bg-[#dff0e6] text-[#14532d]",
              },
              {
                value: String(report.pax),
                label: "Pasajeros",
                delta: report.deltas.pax,
                icon: IconUsers,
                tone: "bg-[#dae7fb] text-[#1e40af]",
              },
              {
                value: money(report.income),
                label: "Ingresos",
                delta: report.deltas.income,
                icon: IconCoin,
                tone: "bg-[#e6e0fb] text-[#5b21b6]",
              },
              {
                value: money(report.ticket),
                label: "Ticket medio",
                delta: report.deltas.ticket,
                icon: IconReceipt,
                tone: "bg-[#fbe3c2] text-[#7c2d12]",
              },
            ]}
          />

          <ReportHighlight narrative={summarize(report)} />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <ReportRanking
              title="Tours"
              question="Qué se vendió más"
              rows={report.topTours}
              format={money}
            />
            <ReportRanking
              title="Agentes"
              question="Quién generó más negocio"
              rows={report.topAgents}
              format={money}
            />
            <ReportRanking
              title="Hoteles"
              question="Dónde se concentró la operación"
              rows={report.topHotels}
              format={(value) => `${value} ${value === 1 ? "reserva" : "reservas"}`}
            />
          </div>

          <ReportIncidents
            cancelled={report.cancelled}
            pending={report.pending}
            onOpen={openReservations}
          />

          <Button
            variant="outline"
            className="h-12 w-full justify-between px-4 text-[15px] font-medium sm:w-auto sm:justify-start sm:gap-2"
            onClick={() => openReservations()}
          >
            Ver las {total} {total === 1 ? "reserva" : "reservas"} del periodo
            <IconArrowRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
