import "server-only"

import { and, eq, inArray, sql } from "drizzle-orm"
import type { BatchItem } from "drizzle-orm/batch"

import { db } from "@/db"
import {
  agents,
  drivers,
  guides,
  hotels,
  mealOptions,
  reservationMeals,
  reservations,
  reservationTickets,
  tours,
} from "@/db/schema"
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

/** Igual que `idByName`, pero para todas las opciones de comida en una consulta. */
async function mealIdsByName(
  client: Awaited<ReturnType<typeof db>>,
  organizationId: string,
  names: string[],
) {
  if (!names.length) return new Map<string, string>()
  const rows = await client
    .select({ id: mealOptions.id, name: mealOptions.name })
    .from(mealOptions)
    .where(and(eq(mealOptions.organizationId, organizationId), inArray(mealOptions.name, names)))
  return new Map(rows.map((row) => [row.name, row.id]))
}

/**
 * Guarda la reserva junto con sus entradas y su alimentación. El detalle se
 * reemplaza entero con lo que trae el formulario, que siempre llega completo,
 * y todo va en un solo batch de D1: o se escribe todo o no se escribe nada.
 */
export async function saveReservation(organizationId: string, input: ReservationInput) {
  const client = await db()

  const [tourId, hotelId, guideId, driverId, agentId, mealIds] = await Promise.all([
    idByName(client, tours, organizationId, input.tour),
    idByName(client, hotels, organizationId, input.hotel),
    idByName(client, guides, organizationId, input.guide),
    idByName(client, drivers, organizationId, input.driver),
    idByName(client, agents, organizationId, input.agent),
    mealIdsByName(
      client,
      organizationId,
      input.meals.map((meal) => meal.option),
    ),
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

  let id = input.id
  let write: BatchItem<"sqlite">
  if (id) {
    // El detalle se borra por `reservationId`: antes hay que confirmar que la
    // reserva es de esta organización, o se podría tocar el detalle de otra.
    const [owned] = await client
      .select({ id: reservations.id })
      .from(reservations)
      .where(and(eq(reservations.id, id), eq(reservations.organizationId, organizationId)))
      .limit(1)
    if (!owned) return []
    write = client.update(reservations).set(values).where(eq(reservations.id, id))
  } else {
    id = `res_${crypto.randomUUID()}`
    write = client.insert(reservations).values({
      id,
      organizationId,
      code: await nextCode(client, organizationId),
      ...values,
    })
  }

  const tickets = input.tickets.map((ticket) => ({
    id: `tkt_${crypto.randomUUID()}`,
    reservationId: id,
    passport: ticket.passport || null,
    name: ticket.name,
    kind: ticket.kind,
  }))
  // Una opción que ya no existe en el catálogo no tiene a qué apuntar.
  const meals = input.meals.flatMap((meal) => {
    const mealOptionId = mealIds.get(meal.option)
    return mealOptionId
      ? [
          {
            id: `rml_${crypto.randomUUID()}`,
            reservationId: id,
            mealOptionId,
            quantity: meal.quantity,
          },
        ]
      : []
  })

  await client.batch([
    write,
    client.delete(reservationTickets).where(eq(reservationTickets.reservationId, id)),
    client.delete(reservationMeals).where(eq(reservationMeals.reservationId, id)),
    ...(tickets.length ? [client.insert(reservationTickets).values(tickets)] : []),
    ...(meals.length ? [client.insert(reservationMeals).values(meals)] : []),
  ])

  return [{ id }]
}
