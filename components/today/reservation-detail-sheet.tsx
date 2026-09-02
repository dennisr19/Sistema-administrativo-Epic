import {
  IconCalendarEvent,
  IconCar,
  IconClock,
  IconMapPin,
  IconNote,
  IconReceipt,
  IconSoup,
  IconTicket,
  IconUser,
  IconUsers,
} from "@tabler/icons-react"

import { StatusBadge } from "@/components/today/status-badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatLongDate } from "@/lib/format-date"
import type { Reservation } from "@/lib/reservation"
import { summarizeMeals, summarizeTickets } from "@/lib/reservation-form"

type ReservationDetailSheetProps = {
  onEdit?: (reservation: Reservation) => void
  reservation: Reservation | null
  onClose: () => void
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof IconUser
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="size-4.5" stroke={1.8} />
      </span>
      <span>
        <span className="block text-[13px] text-muted-foreground">{label}</span>
        <span className="mt-0.5 block text-[15px] font-medium text-foreground">{value}</span>
      </span>
    </div>
  )
}

export function ReservationDetailSheet({
  reservation,
  onClose,
  onEdit,
}: ReservationDetailSheetProps) {
  if (!reservation) return null

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent className="w-full! max-w-none! gap-0 border-0 bg-white sm:w-[540px]! sm:max-w-[540px]! md:border-l md:border-slate-200">
        <SheetHeader className="border-b px-6 py-6 pr-14">
          <div className="mb-3 flex items-center gap-2">
            <StatusBadge issue={reservation.issue} status={reservation.status} />
            <span className="text-[13px] font-medium text-muted-foreground tabular-nums">
              {reservation.code}
            </span>
          </div>
          <SheetTitle className="text-2xl font-semibold tracking-[-0.035em]">
            {reservation.tour}
          </SheetTitle>
          <SheetDescription>{reservation.client}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-2 gap-3 border-b pb-5">
            <div className="rounded-xl bg-[#f5f8fc] p-4">
              <IconClock className="mb-3 size-5 text-primary" />
              <span className="block text-[13px] text-muted-foreground">Salida</span>
              <span className="mt-1 block text-lg font-semibold">{reservation.time}</span>
            </div>
            <div className="rounded-xl bg-[#f5f8fc] p-4">
              <IconUsers className="mb-3 size-5 text-primary" />
              <span className="block text-[13px] text-muted-foreground">Pasajeros</span>
              <span className="mt-1 block text-lg font-semibold">{reservation.pax} pax</span>
            </div>
          </div>

          <div className="divide-y">
            <DetailRow
              icon={IconCalendarEvent}
              label="Día"
              value={formatLongDate(reservation.date)}
            />
            <DetailRow
              icon={IconMapPin}
              label="Recogida"
              value={`${reservation.hotel}, ${reservation.pickup}`}
            />
            <DetailRow
              icon={IconUser}
              label="Guía"
              value={reservation.guide ?? "Sin guía asignado"}
            />
            <DetailRow
              icon={IconCar}
              label="Conductor"
              value={reservation.driver ?? "Sin chofer asignado"}
            />
            {summarizeMeals(reservation.meals) ? (
              <DetailRow
                icon={IconSoup}
                label="Alimentación"
                value={summarizeMeals(reservation.meals)}
              />
            ) : null}
            {summarizeTickets(reservation.tickets) ? (
              <DetailRow
                icon={IconTicket}
                label="Entradas"
                value={summarizeTickets(reservation.tickets)}
              />
            ) : null}
            <DetailRow icon={IconReceipt} label="Total" value={reservation.total} />
            {reservation.notes ? (
              <DetailRow icon={IconNote} label="Notas" value={reservation.notes} />
            ) : null}
          </div>
        </div>

        <SheetFooter className="border-t bg-white px-6 py-5 sm:flex-row">
          <Button variant="outline" size="lg" className="w-full sm:flex-1" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            size="lg"
            className="w-full sm:flex-1"
            disabled={!onEdit}
            onClick={() => onEdit?.(reservation)}
          >
            Editar reserva
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
