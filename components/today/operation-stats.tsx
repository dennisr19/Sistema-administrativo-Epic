import { IconAlertTriangle, IconCalendarEvent, IconCoin, IconUsers } from "@tabler/icons-react"

import type { OperationalIssue, Reservation } from "@/lib/reservation"
import { cn } from "@/lib/utils"

type OperationStatsProps = {
  reservations: Reservation[]
  counts: Record<OperationalIssue, number>
}

/**
 * Lo que hay que saber antes de mirar la lista. El icono lleva el color; el
 * número se queda en negro para que compare bien entre tarjetas.
 */
export function OperationStats({ reservations, counts }: OperationStatsProps) {
  const pax = reservations.reduce((total, reservation) => total + reservation.pax, 0)
  const pending = counts.guide + counts.driver + counts.payment
  const income = reservations.reduce(
    (total, reservation) => total + (Number(reservation.total.replace(/[$,]/g, "")) || 0),
    0,
  )

  const stats = [
    {
      label: "Salidas",
      value: String(reservations.length),
      icon: IconCalendarEvent,
      tone: "bg-[#dff0e6] text-[#14532d]",
    },
    {
      label: "Pasajeros",
      value: String(pax),
      icon: IconUsers,
      tone: "bg-[#dae7fb] text-[#1e40af]",
    },
    {
      label: "Pendientes",
      value: String(pending),
      icon: IconAlertTriangle,
      tone: "bg-[#fbe3c2] text-[#7c2d12]",
    },
    {
      label: "Facturación",
      value: `$${income.toLocaleString("en-US")}`,
      icon: IconCoin,
      tone: "bg-[#e6e0fb] text-[#5b21b6]",
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
