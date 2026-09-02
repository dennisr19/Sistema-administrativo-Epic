import type { Metadata } from "next"

import { NewReservation } from "@/components/reservations/new-reservation"

export const metadata: Metadata = {
  title: "Nueva reserva | Sistema Administrativo Epic",
}

export default function NewReservationPage() {
  return <NewReservation />
}
