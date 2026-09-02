import { IconChevronRight, IconUsers } from "@tabler/icons-react"
import type { KeyboardEvent } from "react"

import { StatusBadge } from "@/components/today/status-badge"
import { TourIcon } from "@/components/today/tour-icon"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/format-date"
import type { Reservation } from "@/lib/reservation"

type ReservationsTableProps = {
  reservations: Reservation[]
  onSelect: (reservation: Reservation) => void
}

export function ReservationsTable({ reservations, onSelect }: ReservationsTableProps) {
  const openWithKeyboard = (
    event: KeyboardEvent<HTMLTableRowElement>,
    reservation: Reservation,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onSelect(reservation)
    }
  }

  return (
    <div className="hidden min-[1160px]:block">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-muted">
            <TableHead className="w-[132px] px-5 text-[13px] text-muted-foreground">
              Fecha
            </TableHead>
            <TableHead className="min-w-[220px] text-[13px] text-muted-foreground">
              Tour y cliente
            </TableHead>
            <TableHead className="min-w-[180px] text-[13px] text-muted-foreground">Hotel</TableHead>
            <TableHead className="w-[64px] text-[13px] text-muted-foreground">Pax</TableHead>
            <TableHead className="w-[160px] text-[13px] text-muted-foreground">Estado</TableHead>
            <TableHead className="w-[90px] text-right text-[13px] text-muted-foreground">
              Total
            </TableHead>
            <TableHead className="w-12" aria-label="Abrir reserva" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => {
            const date = formatDate(reservation.date)

            return (
              <TableRow
                key={reservation.id}
                className="h-[78px] cursor-pointer border-b-0 bg-card even:bg-row-alt hover:bg-row-hover focus-visible:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                tabIndex={0}
                onClick={() => onSelect(reservation)}
                onKeyDown={(event) => openWithKeyboard(event, reservation)}
              >
                <TableCell className="px-5">
                  <span className="block text-[15px] font-semibold tabular-nums">
                    {date.day} {date.month}
                  </span>
                  <span className="mt-1 flex items-baseline gap-2.5 text-[13px] text-muted-foreground tabular-nums">
                    <span>{date.year}</span>
                    <span>{reservation.time}</span>
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <TourIcon kind={reservation.kind} />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold">
                        {reservation.tour}
                      </span>
                      <span className="mt-1 flex min-w-0 items-baseline gap-2.5 text-[13px] text-muted-foreground">
                        <span className="truncate">{reservation.client}</span>
                        <span className="shrink-0 tabular-nums">{reservation.code}</span>
                      </span>
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="block max-w-[200px] truncate text-[15px] font-medium">
                    {reservation.hotel}
                  </span>
                  <span className="mt-1 block text-[13px] text-muted-foreground">
                    {reservation.agent}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-[15px] font-medium">
                    <IconUsers className="size-[18px] text-muted-foreground" />
                    {reservation.pax}
                  </span>
                </TableCell>
                <TableCell>
                  <StatusBadge issue={reservation.issue} status={reservation.status} />
                </TableCell>
                <TableCell className="text-right text-[15px] font-semibold tabular-nums">
                  {reservation.total}
                </TableCell>
                <TableCell className="pr-5 text-right">
                  <IconChevronRight className="ml-auto size-[18px] text-muted-foreground/70" />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
