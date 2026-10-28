import { IconCalendarEvent, IconCircleCheck, IconCoin, IconUsers } from "@tabler/icons-react"

import type { Settlement, SettlementKind } from "@/lib/settlement"
import { cn } from "@/lib/utils"

type SettlementSummaryProps = {
  kind: SettlementKind
  summary: Settlement["summary"]
}

/**
 * Lo que hace falta para calcular el pago: al agente se le liquida sobre lo
 * facturado, al guía por salidas. Por eso la primera cifra cambia según a
 * quién se liquida.
 */
export function SettlementSummary({ kind, summary }: SettlementSummaryProps) {
  const stats = [
    kind === "guide"
      ? {
          label: "Salidas",
          value: summary.departures.toLocaleString("en-US"),
          hint: `${summary.reservations} reservas`,
          icon: IconCalendarEvent,
          tone: "bg-[#dff0e6] text-[#14532d]",
        }
      : {
          label: "Reservas",
          value: summary.reservations.toLocaleString("en-US"),
          hint: `${summary.departures} salidas`,
          icon: IconCalendarEvent,
          tone: "bg-[#dff0e6] text-[#14532d]",
        },
    {
      label: "Pasajeros",
      value: summary.pax.toLocaleString("en-US"),
      icon: IconUsers,
      tone: "bg-[#dae7fb] text-[#1e40af]",
    },
    {
      label: "Facturación",
      value: `$${Math.round(summary.income).toLocaleString("en-US")}`,
      icon: IconCoin,
      tone: "bg-[#e6e0fb] text-[#5b21b6]",
    },
    {
      label: "Pagadas",
      value: `${summary.paid} de ${summary.reservations}`,
      hint: summary.pending ? `${summary.pending} pendientes` : "Todo al día",
      icon: IconCircleCheck,
      tone: summary.pending ? "bg-[#fdeccb] text-[#92400e]" : "bg-[#dff0e6] text-[#14532d]",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="flex items-center gap-2.5 rounded-xl bg-card px-3 py-3.5 sm:gap-3 sm:px-4"
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10",
                stat.tone,
              )}
            >
              <Icon className="size-5" stroke={1.9} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] text-muted-foreground">{stat.label}</span>
              <span className="block truncate text-[20px] leading-tight font-semibold tracking-[-0.03em] tabular-nums sm:text-[24px]">
                {stat.value}
              </span>
              {stat.hint ? (
                <span className="block truncate text-[12px] text-muted-foreground">
                  {stat.hint}
                </span>
              ) : null}
            </span>
          </div>
        )
      })}
    </div>
  )
}
