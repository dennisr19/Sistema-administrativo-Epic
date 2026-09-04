"use client"

import { use } from "react"

import { ListPagination } from "@/components/list-pagination"
import { ReservationsEmpty } from "@/components/reservations/reservations-empty"
import { ReservationsList } from "@/components/reservations/reservations-list"
import { ReservationsTable } from "@/components/reservations/reservations-table"
import { CardContent, CardFooter } from "@/components/ui/card"

import type { Reservation } from "@/lib/reservation"
import { RESERVATIONS_PAGE_SIZE } from "@/lib/reservation-filters"
import { cn } from "@/lib/utils"

export type Results = {
  reservations: Reservation[]
  total: number
  page: number
  pageCount: number
}

type ReservationsResultsProps = {
  promise: Promise<Results>
  pageSize: number
  /** Navegación en curso: se atenúa lo anterior en vez de vaciarlo. */
  pending: boolean
  onSelect: (reservation: Reservation) => void
  onClearFilters: () => void
  onPageChange: (page: number) => void
}

/** Cuenta del encabezado de la card. Suspende aparte de la tabla. */
export function ReservationsCount({ promise }: { promise: Promise<Results> }) {
  const { total } = use(promise)
  return `${total} ${total === 1 ? "reserva encontrada" : "reservas encontradas"}`
}

export function CountFallback() {
  return <span className="inline-block h-4 w-40 animate-pulse rounded-full bg-muted align-middle" />
}

export function ReservationsResults({
  promise,
  pageSize,
  pending,
  onSelect,
  onClearFilters,
  onPageChange,
}: ReservationsResultsProps) {
  const results = use(promise)
  const from = results.total ? (results.page - 1) * pageSize + 1 : 0
  const to = Math.min(results.page * pageSize, results.total)

  return (
    <>
      <CardContent
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-0 transition-opacity",
          pending && "opacity-60",
        )}
        aria-busy={pending}
      >
        {results.reservations.length ? (
          <>
            <ReservationsTable reservations={results.reservations} onSelect={onSelect} />
            <ReservationsList reservations={results.reservations} onSelect={onSelect} />
          </>
        ) : (
          <ReservationsEmpty onClear={onClearFilters} />
        )}
      </CardContent>

      <CardFooter className="h-14 shrink-0 justify-between bg-surface-muted px-4 py-2 sm:px-6">
        <span className="shrink-0 text-[13px] whitespace-nowrap text-muted-foreground tabular-nums">
          {results.total ? `${from}-${to} de ${results.total}` : "0 reservas"}
        </span>
        <ListPagination
          page={results.page}
          pageCount={results.pageCount}
          onPageChange={onPageChange}
        />
      </CardFooter>
    </>
  )
}

/**
 * Los altos salen de la tabla real, no de un cálculo a ojo: la cabecera mide
 * `h-10` y cada fila `h-[90px]`, y se pintan tantas filas como trae una
 * página (`RESERVATIONS_PAGE_SIZE`). Si alguno de esos valores cambia, este
 * esqueleto deja de coincidir, así que van juntos a propósito.
 */
export function ResultsFallback({ rows = RESERVATIONS_PAGE_SIZE }: { rows?: number }) {
  return (
    <>
      <CardContent className="min-h-0 flex-1 overflow-y-auto px-0">
        {/* La franja de encabezados de columna, que también ocupa espacio. */}
        <div className="h-10 bg-muted" />
        {Array.from({ length: rows }, (_, index) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: son huecos, no datos
            key={index}
            className="flex h-[90px] items-center gap-4 px-5 even:bg-row-alt"
          >
            <div className="h-4 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-56 animate-pulse rounded-full bg-muted" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </CardContent>
      <CardFooter className="h-14 shrink-0 justify-between bg-surface-muted px-4 py-2 sm:px-6">
        <div className="h-4 w-28 animate-pulse rounded-full bg-muted" />
        <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
      </CardFooter>
    </>
  )
}
