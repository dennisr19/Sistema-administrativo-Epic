"use client"

import { IconBell } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useAlerts } from "@/components/alerts-provider"
import { StatusBadge } from "@/components/today/status-badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { upcomingAlerts } from "@/lib/upcoming-alerts"
import { cn } from "@/lib/utils"

export function NotificationsBell() {
  const router = useRouter()
  const { upcoming, today } = useAlerts()
  const alerts = upcomingAlerts(upcoming, today)

  let lastGroup = -1

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            className="relative"
            aria-label={
              alerts.length
                ? `Avisos, ${alerts.length} salidas próximas con algo sin resolver`
                : "Avisos, nada urgente"
            }
          >
            <IconBell />
            {/* El punto solo existe cuando hay algo que atender. */}
            {alerts.length ? (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#96590f] px-1 text-[11px] font-semibold text-white ring-2 ring-background">
                {alerts.length}
              </span>
            ) : null}
          </Button>
        }
      />

      <PopoverContent>
        <div className={cn("px-4 py-3", alerts.length && "border-b")}>
          <p className="text-[15px] font-semibold tracking-[-0.01em]">Salidas por resolver</p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            {alerts.length
              ? "Salen hoy o mañana y les falta algo."
              : "Nada urgente para las próximas salidas."}
          </p>
        </div>

        <ul className="py-1.5">
          {alerts.map(({ reservation, issue, daysAway }, index) => {
            const heading = daysAway !== lastGroup ? (daysAway === 0 ? "Hoy" : "Mañana") : null
            lastGroup = daysAway

            return (
              <li key={reservation.id}>
                {heading ? (
                  <p className="px-4 pt-2.5 pb-1 text-[13px] font-semibold text-muted-foreground">
                    {heading}
                  </p>
                ) : null}
                {/* La hora ancla, el motivo manda: va como badge, el lenguaje que ya usa la app. */}
                <button
                  type="button"
                  className={cn(
                    // Mismo rayado que las listas de reservas: separa filas sin agregar líneas.
                    "grid min-h-14 w-full grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2 text-left hover:bg-row-hover",
                    index % 2 === 1 && "bg-row-alt",
                  )}
                  onClick={() => router.push(`/reservas?buscar=${reservation.code}`)}
                >
                  <span className="text-[15px] font-semibold tabular-nums">{reservation.time}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-medium">
                      {reservation.tour}
                    </span>
                    <span className="block truncate text-[13px] text-muted-foreground">
                      {reservation.client}
                    </span>
                  </span>
                  <StatusBadge issue={issue} />
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
