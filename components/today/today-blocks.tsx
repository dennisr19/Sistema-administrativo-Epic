"use client"

import { use } from "react"

import { ListPagination } from "@/components/list-pagination"
import { AlertFilters } from "@/components/today/alert-filters"
import { DesktopReservationTable } from "@/components/today/desktop-reservation-table"
import { MobileReservationList } from "@/components/today/mobile-reservation-list"
import { OperationEmpty } from "@/components/today/operation-empty"
import { OperationStats } from "@/components/today/operation-stats"
import { CardContent, CardFooter } from "@/components/ui/card"
import { deriveOperation, OPERATION_PAGE_SIZE } from "@/lib/operation-board"
import type { OperationFilters } from "@/lib/operation-filters"
import type { OperationalIssue, Reservation } from "@/lib/reservation"
import { cn } from "@/lib/utils"

/**
 * Los tres bloques de Hoy que esperan datos. Cada uno suspende por su cuenta
 * y deriva lo suyo del mismo arreglo: el encabezado, las pestañas de periodo
 * y la barra de filtros no dependen de la consulta y pintan sin esperar.
 */
type BlockProps = {
  promise: Promise<Reservation[]>
  filters: OperationFilters
  activeIssue: OperationalIssue | null
  page: number
}

export function TodayStats({ promise, filters, activeIssue, page }: BlockProps) {
  const { inContext, counts } = deriveOperation({
    reservations: use(promise),
    filters,
    activeIssue,
    page,
  })
  return <OperationStats reservations={inContext} counts={counts} />
}

export function StatsFallback() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {["a", "b", "c", "d"].map((stat) => (
        <div key={stat} className="h-[68px] animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  )
}

export function TodayCount({ promise, filters, activeIssue, page }: BlockProps) {
  const { filtered, pax } = deriveOperation({
    reservations: use(promise),
    filters,
    activeIssue,
    page,
  })
  return `${filtered.length} ${filtered.length === 1 ? "reserva" : "reservas"}, ${pax} ${
    pax === 1 ? "pasajero" : "pasajeros"
  } en total`
}

export function CountFallback() {
  return <span className="inline-block h-4 w-52 animate-pulse rounded-full bg-muted align-middle" />
}

export function TodayAlerts({
  promise,
  filters,
  activeIssue,
  page,
  onSelect,
}: BlockProps & { onSelect: (issue: OperationalIssue | null) => void }) {
  const { counts } = deriveOperation({ reservations: use(promise), filters, activeIssue, page })
  return <AlertFilters counts={counts} activeIssue={activeIssue} onSelect={onSelect} />
}

export function AlertsFallback() {
  return <div className="h-9 w-full animate-pulse rounded-full bg-muted" />
}

type ListProps = BlockProps & {
  pending: boolean
  onSelect: (reservation: Reservation) => void
  onClear: () => void
  onPageChange: (page: number) => void
}

export function TodayList({
  promise,
  filters,
  activeIssue,
  page,
  pending,
  onSelect,
  onClear,
  onPageChange,
}: ListProps) {
  const { filtered, pageCount, visible } = deriveOperation({
    reservations: use(promise),
    filters,
    activeIssue,
    page,
  })
  const from = filtered.length ? (page - 1) * OPERATION_PAGE_SIZE + 1 : 0
  const to = Math.min(page * OPERATION_PAGE_SIZE, filtered.length)

  return (
    <>
      <CardContent
        // Mientras llega el periodo nuevo se atenúa el anterior en vez de vaciarlo.
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-0 transition-opacity",
          pending && "opacity-60",
        )}
        aria-busy={pending}
      >
        {visible.length ? (
          <>
            <DesktopReservationTable reservations={visible} onSelect={onSelect} />
            <MobileReservationList reservations={visible} onSelect={onSelect} />
          </>
        ) : (
          <OperationEmpty onClear={onClear} />
        )}
      </CardContent>

      <CardFooter className="h-14 shrink-0 justify-between bg-surface-muted px-4 py-2 sm:px-6">
        <span className="shrink-0 text-[13px] whitespace-nowrap text-muted-foreground tabular-nums">
          {filtered.length ? `${from}-${to} de ${filtered.length}` : "0 reservas"}
        </span>
        <ListPagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
      </CardFooter>
    </>
  )
}

export function ListFallback() {
  return (
    <>
      <CardContent className="min-h-0 flex-1 overflow-y-auto px-0">
        {["a", "b", "c", "d", "e", "f"].map((row) => (
          <div key={row} className="flex h-[68px] items-center gap-4 px-5 even:bg-row-alt">
            <div className="h-4 w-12 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded-full bg-muted" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </CardContent>
      <CardFooter className="h-14 shrink-0 justify-between bg-surface-muted px-4 py-2 sm:px-6">
        <div className="h-4 w-28 animate-pulse rounded-full bg-muted" />
      </CardFooter>
    </>
  )
}
