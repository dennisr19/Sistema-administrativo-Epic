"use server"

import { searchReservations } from "@/db/queries/reservations"
import { requireSession } from "@/lib/auth/server"
import type { CommandItem } from "@/lib/command-search"
import { formatDate } from "@/lib/format-date"

/** Las reservas que coinciden con lo escrito en la paleta, buscadas en SQL. */
export async function searchReservationsAction(query: string): Promise<CommandItem[]> {
  const { organizationId } = await requireSession()
  const term = query.trim()
  if (term.length < 2) return []

  const rows = await searchReservations(organizationId, term, 6)

  return rows.map((reservation) => {
    const date = formatDate(reservation.date)
    return {
      id: reservation.id,
      group: "Reservas" as const,
      label: `${reservation.client}, ${reservation.tour}`,
      detail: `${reservation.code}, ${date.day} ${date.month} ${date.year}`,
      href: `/reservas?buscar=${encodeURIComponent(reservation.code)}`,
    }
  })
}
