import "server-only"

import { and, asc, eq, gte, lte } from "drizzle-orm"
import { cache } from "react"

import { db } from "@/db"
import { reservationColumns, toReservation } from "@/db/queries/reservation-row"
import { agents, drivers, guides, hotels, reservations, tours } from "@/db/schema"
import { computeReport, previousPeriod } from "@/lib/report-metrics"
import { addDays, operationToday } from "@/lib/today"

/**
 * Se traen las filas del periodo y del anterior, y el cálculo lo hace la misma
 * función de siempre. Es un año de operación como mucho: bajarlo a SQL sería
 * reescribir rankings y comparaciones sin ganar nada todavía.
 */
export const getReport = cache(async (organizationId: string, from: string, to: string) => {
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
})
