import { IconArrowLeft } from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"

import { EditReservation } from "@/components/reservations/edit-reservation"
import { Button } from "@/components/ui/button"
import { findReservation } from "@/db/queries/reservations"
import { requireSession } from "@/lib/auth/server"

export const metadata: Metadata = {
  title: "Editar reserva | Sistema Administrativo Epic",
}

export default async function EditReservationPage({ params }: PageProps<"/reservas/[id]/editar">) {
  const [{ organizationId }, { id }] = await Promise.all([requireSession(), params])
  const reservation = await findReservation(organizationId, id)

  if (!reservation) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-xl font-semibold tracking-[-0.025em]">Reserva no encontrada</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Puede haber sido eliminada o no pertenece a tu organización.
        </p>
        <Button
          variant="secondary"
          className="mt-5"
          nativeButton={false}
          render={<Link href="/reservas" />}
        >
          <IconArrowLeft />
          Volver a reservas
        </Button>
      </div>
    )
  }

  return <EditReservation reservation={reservation} />
}
