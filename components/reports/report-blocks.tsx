"use client"

import {
  IconArrowRight,
  IconCalendarEvent,
  IconCoin,
  IconReceipt,
  IconUsers,
} from "@tabler/icons-react"
import { use } from "react"

import { ReportHighlight } from "@/components/reports/report-highlight"
import { ReportIncidents } from "@/components/reports/report-incidents"
import { ReportKpis } from "@/components/reports/report-kpis"
import { ReportRanking } from "@/components/reports/report-ranking"
import { Button } from "@/components/ui/button"
import type { ReportMetrics } from "@/lib/report-metrics"
import { summarize } from "@/lib/report-narrative"
import type { OperationalIssue } from "@/lib/reservation"

const money = (value: number) => `$${value.toLocaleString("en-US")}`

type ReportBlocksProps = {
  promise: Promise<ReportMetrics>
  onOpenReservations: (incident?: "cancelled" | OperationalIssue) => void
}

/**
 * Todo lo que sale del informe. Suspende como un bloque porque viene de una
 * sola consulta: separarlo más no haría que llegara antes. El encabezado y
 * los controles de periodo quedan fuera, y por eso pintan sin esperar.
 */
export function ReportBlocks({ promise, onOpenReservations }: ReportBlocksProps) {
  const report = use(promise)
  const total = report.reservations + report.cancelled.count

  return (
    <>
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
        onOpen={onOpenReservations}
      />

      <Button
        variant="outline"
        className="h-12 w-full justify-between px-4 text-[15px] font-medium sm:w-auto sm:justify-start sm:gap-2"
        onClick={() => onOpenReservations()}
      >
        Ver las {total} {total === 1 ? "reserva" : "reservas"} del periodo
        <IconArrowRight />
      </Button>
    </>
  )
}

/** Mismas superficies y altos que el informe real. */
export function ReportBlocksFallback() {
  const pulse = "animate-pulse rounded-xl bg-muted"

  return (
    <>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {["reservas", "pax", "ingresos", "ticket"].map((kpi) => (
          <div key={kpi} className={`${pulse} h-[68px]`} />
        ))}
      </div>
      <div className={`${pulse} h-[72px]`} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {["tours", "agentes", "hoteles"].map((rank) => (
          <div key={rank} className={`${pulse} h-[188px]`} />
        ))}
      </div>
      <div className={`${pulse} h-[104px]`} />
      <div className="h-12 w-full animate-pulse rounded-lg bg-muted sm:w-64" />
    </>
  )
}
