"use server"

import { refresh, updateTag } from "next/cache"
import { redirect } from "next/navigation"

import { saveReservation } from "@/db/mutations/reservations"
import { requireSession } from "@/lib/auth/server"
import { tags } from "@/lib/cache-tags"
import { type ReservationFormState, reservationInputSchema } from "@/lib/reservation-input"

export async function saveReservationAction(
  _previous: ReservationFormState,
  formData: FormData,
): Promise<ReservationFormState> {
  const { organizationId } = await requireSession()

  const raw = Object.fromEntries(formData)
  const parsed = reservationInputSchema.safeParse({
    ...raw,
    paymentPending: raw.paymentPending === "true",
  })

  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form")
      errors[key] ??= issue.message
    }
    return { status: "error", message: "Revisa los campos indicados.", errors }
  }

  let saved: { id: string }[]
  try {
    saved = await saveReservation(organizationId, parsed.data)
  } catch {
    return { status: "error", message: "No pudimos guardar la reserva. Intenta nuevamente." }
  }

  if (!saved.length) return { status: "error", message: "La reserva ya no existe." }

  // Una sola etiqueta cubre todo lo cacheado que deriva de reservas: los
  // reportes, la cobertura del historial, los avisos de la campana y los
  // conteos de uso de Configuración.
  //
  // `updateTag` y no `revalidateTag`: dentro de una Server Action es el que
  // da lectura de la propia escritura, así que quien acaba de guardar ve su
  // cambio de una y no cuando expire la entrada.
  updateTag(tags.reservations(organizationId))
  // Y el Router Cache del cliente, que guarda datos dinámicos que la etiqueta
  // no toca: sin esto la lista podría pintarse sin la reserva recién creada.
  refresh()
  // El redirect corta la ejecución: el form nunca ve un estado de "éxito"
  // que mostrar. La bandera en la URL es lo que le dice a la lista, ya del
  // otro lado, que muestre la confirmación — la lee una vez y la limpia.
  const flag = parsed.data.id ? "actualizada" : "creada"
  redirect(`/reservas?${flag}=1`)
}
