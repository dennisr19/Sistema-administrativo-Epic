"use client"

import { useRouter } from "next/navigation"

import { ReservationForm } from "@/components/reservations/reservation-form"
import { emptyDraft } from "@/lib/reservation-form"

export function NewReservation() {
  const router = useRouter()

  return (
    <ReservationForm
      mode="create"
      initial={emptyDraft}
      subtitle="Tour, cliente, operación y pago"
      onCancel={() => router.push("/reservas")}
    />
  )
}
