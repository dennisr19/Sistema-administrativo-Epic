"use client"

import { PageHeader } from "@/components/page-header"
import { ResultsFallback } from "@/components/reservations/reservations-results"
import { Card, CardDescription, CardHeader } from "@/components/ui/card"

/**
 * No duplica medidas: usa el mismo `PageHeader`, la misma `Card` y el mismo
 * `CardHeader` que la pantalla real, con las mismas clases de espaciado. Solo
 * se pulsa lo que de verdad está esperando datos.
 *
 * Antes esto reconstruía la silueta con altos a mano (`h-[76px]`, `h-[68px]`)
 * y ninguno coincidía: la card arrancaba ~20px más arriba que la real y al
 * llegar el contenido todo saltaba. Cualquier alto calculado a ojo se
 * desincroniza en cuanto alguien toca el layout; reusar los componentes hace
 * que coincida por construcción.
 */
export function ReservationsSkeleton() {
  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_auto_minmax(0,1fr)] md:gap-4">
      {/* El título y los botones no dependen de ninguna consulta: se pintan
          de verdad, no como bloques grises. Solo el subtítulo espera. */}
      <PageHeader
        title="Reservas"
        subtitle={
          <span className="inline-block h-4 w-64 animate-pulse rounded-full bg-muted align-middle" />
        }
        onNewReservation={() => {}}
      />

      <div className="hidden gap-4 md:grid">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Mismo alto que SegmentedTabs y que el control de rango. */}
          <div className="h-11 w-72 animate-pulse rounded-full bg-muted" />
          <div className="ml-auto flex items-center gap-2">
            <div className="h-11 w-56 animate-pulse rounded-lg bg-muted" />
            <div className="size-11 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
        <StatsSkeleton />
      </div>

      <Card id="lista" className="min-h-0 gap-0 rounded-xl border-0 py-0 ring-0">
        {/* Mismas clases que el CardHeader real, y los mismos tres hijos:
            la fila de título, el buscador y el espacio de los chips. */}
        <CardHeader className="shrink-0 gap-3 px-4 py-4 sm:px-5 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-[-0.025em] md:hidden">Reservas</h1>
              <CardDescription className="mt-0.5 text-sm">
                <span className="inline-block h-4 w-40 animate-pulse rounded-full bg-muted align-middle" />
              </CardDescription>
            </div>
          </div>

          {/* El buscador real mide h-11 dentro de esta misma rejilla. */}
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="h-11 animate-pulse rounded-lg bg-muted" />
            <div className="size-12 animate-pulse rounded-lg bg-muted sm:w-28" />
            <div className="size-12 animate-pulse rounded-lg bg-muted md:hidden" />
          </div>
        </CardHeader>

        <ResultsFallback />
      </Card>
    </div>
  )
}

/**
 * Las cuatro tarjetas de totales. Los contenedores llevan las mismas clases
 * tipográficas que las reales (`text-[13px]` y `text-[24px] leading-tight`)
 * y son ellos los que fijan el alto: la barra gris de adentro es solo
 * decoración. Con alturas fijas a mano quedaban 6px más bajas y la card de
 * abajo arrancaba más arriba de donde iba a quedar.
 */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {["a", "b", "c", "d"].map((stat) => (
        <div key={stat} className="flex items-center gap-3 rounded-xl bg-card px-4 py-3.5">
          <span className="size-10 shrink-0 animate-pulse rounded-lg bg-muted" />
          <span className="min-w-0">
            <span className="block text-[13px]">
              <span className="inline-block h-3 w-16 animate-pulse rounded-full bg-muted align-middle" />
            </span>
            <span className="block text-[24px] leading-tight font-semibold">
              <span className="inline-block h-5 w-20 animate-pulse rounded-md bg-muted align-middle" />
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}
