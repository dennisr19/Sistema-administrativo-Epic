import type { Metadata } from "next"

import { NewReservation } from "@/components/reservations/new-reservation"

export const metadata: Metadata = {
  title: "Nueva reserva | epic-ops",
}

export default function NewReservationPage() {
  return <NewReservation />
}
