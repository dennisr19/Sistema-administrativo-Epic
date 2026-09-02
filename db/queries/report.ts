import "server-only"

import { and, asc, eq, gte, lte } from "drizzle-orm"
import { cache } from "react"

import { db } from "@/db"
import { cachedPerOrganization } from "@/db/cached"
import { reservationColumns, toReservation } from "@/db/queries/reservation-row"
import { agents, drivers, guides, hotels, reservations, tours } from "@/db/schema"
import { tags } from "@/lib/cache-tags"
import { medir } from "@/lib/observe"
import { computeReport, previousPeriod } from "@/lib/report-metrics"
import { addDays, operationToday } from "@/lib/today"

/**
 * Se traen las filas del periodo y del anterior, y el cálculo lo hace la misma
 * función de siempre. Es un año de operación como mucho: bajarlo a SQL sería
 * reescribir rankings y comparaciones sin ganar nada todavía.
 */
/**
 * Semi-dinámico: el informe de un periodo cerrado no cambia salvo que alguien
 * toque una reserva de ese periodo, y eso lo cubre la etiqueta. Los cinco
 * minutos son el techo para el periodo en curso.
 */
export const getReport = cache((organizationId: string, from: string, to: string) => {
  return cachedPerOrganization(
    "report",
    organizationId,
    () =>
      medir("db:getReport", () => loadReport(organizationId, from, to), {
        organizacion: organizationId,
        // El conteo dice si sigue siendo razonable agregar en memoria.
        filas: (r) => r.reservations + r.cancelled.count,
      }),
    {
      tags: [tags.reservations(organizationId)],
      // El rango va en la llave: cada periodo es una entrada distinta.
      key: [from, to],
      revalidate: 300,
    },
  )
})

async function loadReport(organizationId: string, from: string, to: string) {
  const previous = previousPeriod(from, to)
  const client = await db()

  const rows = await client
    .select(reservationColumns)
    .from(reservations)
    .leftJoin(tours, eq(reservations.tourId, tours.id))
    .leftJoin(hotels, eq(reservations.hotelId, hotels.id))
    .leftJoin(guides, eq(reservations.guideId, guides.id))
    .leftJoin(drivers, eq(reservations.driverId, drivers.id))
    .leftJoin(agents, eq(reservations.agentId, agents.id))
    .where(
      and(
        eq(reservations.organizationId, organizationId),
        // Un solo barrido cubre el periodo y aquel contra el que se compara.
        gte(reservations.date, previous.from),
        lte(reservations.date, to),
      ),
    )
    .orderBy(asc(reservations.date))

  const today = operationToday()
  const all = rows.map((row) => toReservation(row, today, addDays(today, 1)))

  return computeReport(all, from, to)
}
