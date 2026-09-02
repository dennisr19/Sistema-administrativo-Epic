"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { saveReservation } from "@/db/mutations/reservations"
import { requireSession } from "@/lib/auth/server"
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

  // Toca la operación del día, el historial y los reportes.
  revalidatePath("/", "layout")
  redirect("/reservas")
}
