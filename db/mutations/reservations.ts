import "server-only"

import { and, eq, sql } from "drizzle-orm"

import { db } from "@/db"
import { agents, drivers, guides, hotels, type mealOptions, reservations, tours } from "@/db/schema"
import type { ReservationInput } from "@/lib/reservation-input"

type Catalog =
  | typeof tours
  | typeof hotels
  | typeof guides
  | typeof drivers
  | typeof agents
  | typeof mealOptions

/** El formulario manda nombres; aquí se convierten en llaves foráneas. */
async function idByName(
  client: Awaited<ReturnType<typeof db>>,
  table: Catalog,
  organizationId: string,
  name: string,
) {
  if (!name.trim()) return null
  const [row] = await client
    .select({ id: table.id })
    .from(table)
    .where(and(eq(table.organizationId, organizationId), eq(table.name, name.trim())))
    .limit(1)
  return row?.id ?? null
}

/**
 * El consecutivo visible sigue el formato de la app actual, `T113`. Se toma el
 * mayor existente y se suma uno.
 */
async function nextCode(client: Awaited<ReturnType<typeof db>>, organizationId: string) {
  const [row] = await client
    .select({
      highest: sql<number>`max(cast(substr(${reservations.code}, 2) as integer))`,
    })
    .from(reservations)
    .where(
      and(eq(reservations.organizationId, organizationId), sql`${reservations.code} like 'T%'`),
    )

  return `T${(row?.highest ?? 0) + 1}`
}

export async function saveReservation(organizationId: string, input: ReservationInput) {
  const client = await db()

  const [tourId, hotelId, guideId, driverId, agentId] = await Promise.all([
    idByName(client, tours, organizationId, input.tour),
    idByName(client, hotels, organizationId, input.hotel),
    idByName(client, guides, organizationId, input.guide),
    idByName(client, drivers, organizationId, input.driver),
    idByName(client, agents, organizationId, input.agent),
  ])

  const values = {
    date: input.date,
    time: input.time,
    customerName: input.client,
    people: input.pax,
    ticketCount: input.tickets.length,
    tourId,
    hotelId,
    pickupPoint: input.pickup || null,
    guideId,
    driverId,
    agentId,
    netRateCents: Math.round(input.rate * 100),
    depositCents: Math.round(input.deposit * 100),
    paymentPending: input.paymentPending,
    note: input.notes || null,
    status: input.status,
    updatedAt: new Date(),
  }

  if (input.id) {
    return client
      .update(reservations)
      .set(values)
      .where(and(eq(reservations.id, input.id), eq(reservations.organizationId, organizationId)))
      .returning({ id: reservations.id })
  }

  return client
    .insert(reservations)
    .values({
      id: `res_${crypto.randomUUID()}`,
      organizationId,
      code: await nextCode(client, organizationId),
      ...values,
    })
    .returning({ id: reservations.id })
}
