"use client"

import { IconChevronRight } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import type { ReportMetrics } from "@/lib/report-metrics"
import type { OperationalIssue } from "@/lib/reservation"

type Incident = "cancelled" | OperationalIssue

type ReportIncidentsProps = {
  cancelled: ReportMetrics["cancelled"]
  pending: ReportMetrics["pending"]
  onOpen: (incident: Incident) => void
}

/**
 * En `Hoy` esto es crítico. Aquí es contexto de lo que ocurrió, así que va sin alarma:
 * filas tranquilas, cada una abre las reservas detrás del número.
 */
export function ReportIncidents({ cancelled, pending, onOpen }: ReportIncidentsProps) {
  const rows = [
    {
      key: "cancelled" as const,
      value: String(cancelled.count),
      label: cancelled.count === 1 ? "cancelación" : "cancelaciones",
      note: cancelled.count ? `$${cancelled.income.toLocaleString("en-US")} no facturados` : "",
      empty: cancelled.count === 0,
    },
    {
      key: "guide" as const,
      value: String(pending.guide),
      label: pending.guide === 1 ? "reserva sin guía" : "reservas sin guía",
      note: "",
      empty: pending.guide === 0,
    },
    {
      key: "driver" as const,
      value: String(pending.driver),
      label: pending.driver === 1 ? "reserva sin chofer" : "reservas sin chofer",
      note: "",
      empty: pending.driver === 0,
    },
    {
      key: "payment" as const,
      value: `$${pending.income.toLocaleString("en-US")}`,
      label: "pendiente de cobro",
      empty: pending.payment === 0,
      note: pending.payment
        ? `${pending.payment} ${pending.payment === 1 ? "reserva" : "reservas"}`
        : "",
    },
  ]

  const rowClass = "flex h-11 w-full items-center gap-2.5 px-2 text-left sm:px-3"

  return (
    <section className="rounded-xl bg-card px-3 py-4 sm:px-4">
      <h2 className="px-2 text-[13px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
        Incidencias del periodo
      </h2>

      <div className="mt-1 grid sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => {
          const body = (
            <>
              <span className="shrink-0 text-[15px] font-semibold tabular-nums">{row.value}</span>
              <span className="min-w-0 truncate text-[15px] font-normal">{row.label}</span>
              {row.note ? (
                <span className="hidden shrink-0 text-[13px] font-normal text-muted-foreground sm:inline xl:hidden min-[1700px]:inline">
                  {row.note}
                </span>
              ) : null}
            </>
          )

          // Una fila en cero no lleva a ninguna parte: se muestra, no se ofrece.
          return row.empty ? (
            <p key={row.key} className={`${rowClass} text-muted-foreground`}>
              {body}
            </p>
          ) : (
            <Button
              key={row.key}
              variant="ghost"
              className={`${rowClass} justify-start`}
              onClick={() => onOpen(row.key)}
            >
              {body}
              <IconChevronRight className="ml-auto shrink-0 text-muted-foreground/70" />
            </Button>
          )
        })}
      </div>
    </section>
  )
}
