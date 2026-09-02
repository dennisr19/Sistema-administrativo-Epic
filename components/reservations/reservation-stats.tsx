import { IconCalendarEvent, IconCircleX, IconCoin, IconUsers } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

export type ReservationTotals = {
  reservations: number
  pax: number
  income: number
  cancelled: number
}

/**
 * Totales del filtro completo, no de la página. El icono lleva el color y el
 * número se queda en negro para que las cuatro cifras se comparen entre sí.
 */
export function ReservationStats({ totals }: { totals: ReservationTotals }) {
  const stats = [
    {
      label: "Reservas",
      value: totals.reservations.toLocaleString("en-US"),
      icon: IconCalendarEvent,
      tone: "bg-[#dff0e6] text-[#14532d]",
    },
    {
      label: "Pasajeros",
      value: totals.pax.toLocaleString("en-US"),
      icon: IconUsers,
      tone: "bg-[#dae7fb] text-[#1e40af]",
    },
    {
      label: "Facturación",
      value: `$${Math.round(totals.income).toLocaleString("en-US")}`,
      icon: IconCoin,
      tone: "bg-[#e6e0fb] text-[#5b21b6]",
    },
    {
      label: "Canceladas",
      value: totals.cancelled.toLocaleString("en-US"),
      icon: IconCircleX,
      tone: "bg-[#fbd7d7] text-[#991b1b]",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3.5">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                stat.tone,
              )}
            >
              <Icon className="size-5" stroke={1.9} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] text-muted-foreground">{stat.label}</span>
              <span className="block truncate text-[24px] leading-tight font-semibold tracking-[-0.03em] tabular-nums">
                {stat.value}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
