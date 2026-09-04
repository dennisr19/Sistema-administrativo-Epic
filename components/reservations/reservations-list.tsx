import { IconChevronRight } from "@tabler/icons-react"

import { StatusBadge } from "@/components/today/status-badge"
import { Button } from "@/components/ui/button"
import { formatCreatedDate, formatDate } from "@/lib/format-date"
import type { Reservation } from "@/lib/reservation"

type ReservationsListProps = {
  reservations: Reservation[]
  onSelect: (reservation: Reservation) => void
}

export function ReservationsList({ reservations, onSelect }: ReservationsListProps) {
  return (
    <div className="min-[1160px]:hidden">
      {reservations.map((reservation) => {
        const date = formatDate(reservation.date)
        const createdDate = formatCreatedDate(reservation.createdAt)

        return (
          <Button
            key={reservation.id}
            variant="ghost"
            className="h-auto w-full justify-start whitespace-normal rounded-none bg-card px-4 py-4 text-left even:bg-row-alt hover:bg-row-hover"
            onClick={() => onSelect(reservation)}
          >
            <span className="grid min-w-0 flex-1 gap-y-1">
              <span className="flex min-w-0 items-center justify-between gap-3">
                <span className="truncate text-[15px] font-semibold text-foreground">
                  {reservation.tour}
                </span>
                <IconChevronRight className="size-[18px] shrink-0 text-muted-foreground/70" />
              </span>

              <span className="mt-1 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3">
                <span className="min-w-0 break-words text-[17px] leading-6 font-semibold text-foreground">
                  {reservation.client}
                </span>
                <span className="pt-0.5 text-[13px] font-normal tabular-nums text-muted-foreground">
                  {reservation.code}
                </span>
                <span className="col-span-2 mt-0.5 text-[12px] leading-5 font-normal text-muted-foreground">
                  Creada {createdDate}
                </span>
              </span>

              <span className="mt-1.5 flex min-w-0 items-center justify-between gap-3 text-[13px] font-normal text-muted-foreground">
                <span className="truncate tabular-nums">
                  {date.day} {date.month} {date.year}, {reservation.time}
                </span>
                <span className="shrink-0 tabular-nums">{reservation.pax} pax</span>
              </span>

              <span className="mt-1.5 flex items-center justify-between gap-2">
                <StatusBadge issue={reservation.issue} status={reservation.status} />
                <span className="text-[15px] font-semibold tabular-nums text-foreground">
                  {reservation.total}
                </span>
              </span>
            </span>
          </Button>
        )
      })}
    </div>
  )
}
