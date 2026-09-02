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
import type { Reservation } from "@/lib/reservation"

type DesktopReservationTableProps = {
  reservations: Reservation[]
  onSelect: (reservation: Reservation) => void
}

export function DesktopReservationTable({ reservations, onSelect }: DesktopReservationTableProps) {
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
    <div className="hidden min-[1360px]:block">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow className="hover:bg-muted">
            <TableHead className="w-[90px] px-5 text-[13px] text-muted-foreground">Hora</TableHead>
            <TableHead className="min-w-[190px] text-[13px] text-muted-foreground">
              Tour y cliente
            </TableHead>
            <TableHead className="min-w-[170px] text-[13px] text-muted-foreground">
              Recogida
            </TableHead>
            <TableHead className="min-w-[160px] text-[13px] text-muted-foreground">
              Equipo
            </TableHead>
            <TableHead className="w-[64px] text-[13px] text-muted-foreground">Pax</TableHead>
            <TableHead className="w-[150px] text-[13px] text-muted-foreground">Estado</TableHead>
            <TableHead className="w-[80px] text-right text-[13px] text-muted-foreground">
              Total
            </TableHead>
            <TableHead className="w-12" aria-label="Abrir reserva" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow
              key={reservation.id}
              className="h-[86px] cursor-pointer border-b-0 bg-card even:bg-row-alt hover:bg-row-hover focus-visible:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
              tabIndex={0}
              onClick={() => onSelect(reservation)}
              onKeyDown={(event) => openWithKeyboard(event, reservation)}
            >
              <TableCell className="px-5">
                <span className="block text-base font-semibold">{reservation.time}</span>
                <span className="mt-1 block text-[13px] text-muted-foreground">
                  {reservation.dayLabel}
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
                <span className="block max-w-[190px] truncate text-[15px] font-medium">
                  {reservation.hotel}
                </span>
                <span className="mt-1 block text-[13px] text-muted-foreground">
                  {reservation.pickup}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={
                    reservation.guide
                      ? "block text-[15px]"
                      : "block text-[15px] font-medium text-warning-foreground"
                  }
                >
                  {reservation.guide ?? "Sin guía"}
                </span>
                <span
                  className={
                    reservation.driver
                      ? "mt-1 block text-[13px] text-muted-foreground"
                      : "mt-1 block text-[13px] font-medium text-warning-foreground"
                  }
                >
                  {reservation.driver ?? "Sin chofer"}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1.5 text-[15px] font-medium">
                  <IconUsers className="size-[18px] text-muted-foreground" />
                  {reservation.pax}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge issue={reservation.issue} />
              </TableCell>
              <TableCell className="text-right text-[15px] font-semibold">
                {reservation.total}
              </TableCell>
              <TableCell className="pr-5 text-right">
                <IconChevronRight className="ml-auto size-[18px] text-muted-foreground/70" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
