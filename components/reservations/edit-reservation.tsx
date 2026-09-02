"use client"

import { useRouter } from "next/navigation"

import { ReservationForm } from "@/components/reservations/reservation-form"
import { formatLongDate } from "@/lib/format-date"
import type { Reservation } from "@/lib/reservation"
import { toDraft } from "@/lib/reservation-form"

export function EditReservation({ reservation }: { reservation: Reservation }) {
  const router = useRouter()

  return (
    <ReservationForm
      mode="edit"
      reservationId={reservation.id}
      initial={toDraft(reservation)}
      subtitle={`${reservation.code}, ${formatLongDate(reservation.date)}`}
      onCancel={() => router.push("/reservas")}
    />
  )
}
