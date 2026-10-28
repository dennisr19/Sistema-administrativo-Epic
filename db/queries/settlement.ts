import "server-only"

import { and, asc, eq, gte, lte, ne } from "drizzle-orm"

import { db } from "@/db"
import { agents, guides, hotels, reservations, tours } from "@/db/schema"
import { medir } from "@/lib/observe"
import type { Settlement, SettlementFilters } from "@/lib/settlement"

/**
 * Techo de filas: un rango de liquidación es de semanas, no de años. Si se
 * alcanza, el rango es demasiado largo para revisar a ojo de todos modos.
 */
export const SETTLEMENT_LIMIT = 1000

/**
 * Las reservas de un agente o guía en el rango, sin las canceladas: una
 * reserva cancelada no genera comisión ni salida. Se traen todas las del rango
 * para que los totales no dependan del estado que se esté mirando.
 */
export async function getSettlement(
  organizationId: string,
  filters: SettlementFilters,
): Promise<Settlement | null> {
  if (!filters.name || filters.from > filters.to) return null

  const client = await db()
  const person = filters.kind === "agent" ? agents : guides
  const personId = filters.kind === "agent" ? reservations.agentId : reservations.guideId
  const paidAt =
    filters.kind === "agent" ? reservations.agentCommissionPaidAt : reservations.guidePaidAt

  const rows = await medir(
    "db:getSettlement",
    () =>
      client
        .select({
          id: reservations.id,
          code: reservations.code,
          date: reservations.date,
          time: reservations.time,
          tour: tours.name,
          client: reservations.customerName,
          hotel: hotels.name,
          pax: reservations.people,
          rateCents: reservations.netRateCents,
          paidAt,
        })
        .from(reservations)
        .innerJoin(person, eq(personId, person.id))
        .leftJoin(tours, eq(reservations.tourId, tours.id))
        .leftJoin(hotels, eq(reservations.hotelId, hotels.id))
        .where(
          and(
            eq(reservations.organizationId, organizationId),
            eq(person.name, filters.name),
            ne(reservations.status, "cancelled"),
            gte(reservations.date, filters.from),
            lte(reservations.date, filters.to),
          ),
        )
        .orderBy(asc(reservations.date), asc(reservations.time))
        .limit(SETTLEMENT_LIMIT),
    { organizacion: organizationId, filas: (r) => r.length },
  )

  const all = rows.map((row) => ({
    id: row.id,
    code: row.code,
    date: row.date,
    time: row.time ?? "",
    tour: row.tour ?? "Sin tour",
    client: row.client,
    hotel: row.hotel ?? "",
    pax: row.pax,
    total: (row.rateCents * row.pax) / 100,
    paid: row.paidAt !== null,
  }))

  const paid = all.filter((row) => row.paid).length
  return {
    rows:
      filters.status === "all"
        ? all
        : all.filter((row) => row.paid === (filters.status === "paid")),
    summary: {
      reservations: all.length,
      departures: new Set(all.map((row) => `${row.date}|${row.time}|${row.tour}`)).size,
      pax: all.reduce((sum, row) => sum + row.pax, 0),
      income: all.reduce((sum, row) => sum + row.total, 0),
      pending: all.length - paid,
      paid,
    },
  }
}
