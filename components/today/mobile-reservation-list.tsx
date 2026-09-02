import { IconChevronRight } from "@tabler/icons-react"
import { StatusBadge } from "@/components/today/status-badge"
import { Button } from "@/components/ui/button"
import type { Reservation } from "@/lib/reservation"

type MobileReservationListProps = {
  reservations: Reservation[]
  onSelect: (reservation: Reservation) => void
}

export function MobileReservationList({ reservations, onSelect }: MobileReservationListProps) {
  return (
    <div className="min-[1360px]:hidden">
      {reservations.map((reservation) => (
        <Button
          key={reservation.id}
          variant="ghost"
          className="h-auto w-full justify-start rounded-none bg-card px-4 py-4 text-left even:bg-row-alt hover:bg-row-hover"
          onClick={() => onSelect(reservation)}
        >
          <span className="grid min-w-0 flex-1 grid-cols-[48px_minmax(0,1fr)_auto] gap-x-3 gap-y-1">
            <span className="text-[15px] font-semibold tabular-nums text-foreground">
              {reservation.time}
            </span>
            <span className="truncate text-[15px] font-semibold text-foreground">
              {reservation.tour}
            </span>
            <IconChevronRight className="mt-0.5 size-[18px] text-muted-foreground/70" />

            <span className="col-start-2 col-end-4 flex min-w-0 items-center justify-between gap-3 text-[13px] font-normal text-muted-foreground">
              <span className="truncate">{reservation.client}</span>
              <span className="shrink-0 tabular-nums">{reservation.code}</span>
            </span>

            <span className="col-start-2 col-end-4 mt-1.5 flex min-w-0 items-center justify-between gap-3 text-[13px] font-normal text-muted-foreground">
              <span className="truncate">{reservation.hotel}</span>
              <span className="shrink-0 tabular-nums">{reservation.pax} pax</span>
            </span>

            <span className="col-start-2 col-end-4 mt-1.5 flex items-center justify-between gap-2">
              <StatusBadge issue={reservation.issue} />
              <span className="text-[15px] font-semibold tabular-nums text-foreground">
                {reservation.total}
              </span>
            </span>
          </span>
        </Button>
      ))}
    </div>
  )
}
