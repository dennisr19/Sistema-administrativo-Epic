"use client"

import { PageHeader } from "@/components/page-header"
import { StatsSkeleton } from "@/components/reservations/reservations-skeleton"
import { ListFallback } from "@/components/today/today-blocks"
import { Card, CardDescription, CardHeader } from "@/components/ui/card"

/**
 * Reusa el layout real en vez de reconstruirlo con altos a mano: el mismo
 * `PageHeader`, la misma `Card` y las mismas tarjetas que Reservas. Lo único
 * que se pulsa es lo que de verdad espera datos.
 */
export function TodaySkeleton() {
  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_auto_minmax(0,1fr)] md:gap-4">
      <PageHeader
        title="Hoy"
        subtitle={
          <span className="inline-block h-4 w-56 animate-pulse rounded-full bg-muted align-middle" />
        }
        onNewReservation={() => {}}
      />

      <div className="hidden gap-4 md:grid">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="h-11 w-64 animate-pulse rounded-full bg-muted" />
          <div className="flex items-center gap-2">
            <div className="h-11 w-56 animate-pulse rounded-lg bg-muted" />
            <div className="size-11 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
        <StatsSkeleton />
      </div>

      <Card id="lista" className="min-h-0 gap-0 rounded-xl border-0 py-0 ring-0">
        <CardHeader className="shrink-0 gap-3 px-4 py-4 sm:px-5 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="hidden text-xl font-semibold tracking-[-0.025em] md:block">Salidas</h2>
              <CardDescription className="mt-0.5 text-sm">
                <span className="inline-block h-4 w-52 animate-pulse rounded-full bg-muted align-middle" />
              </CardDescription>
            </div>
          </div>
          {/* La barra de filtros y la fila de avisos, que también ocupan. */}
          <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-9 w-full animate-pulse rounded-full bg-muted" />
        </CardHeader>

        <ListFallback />
      </Card>
    </div>
  )
}
