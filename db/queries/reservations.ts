import "server-only"

import { and, asc, count, desc, eq, gte, isNull, like, lte, or, type SQL, sql } from "drizzle-orm"
import { cache } from "react"

import { db } from "@/db"
import { cachedPerOrganization } from "@/db/cached"
import { reservationColumns, toReservation } from "@/db/queries/reservation-row"
import { agents, drivers, guides, hotels, reservations, tours } from "@/db/schema"
import { tags } from "@/lib/cache-tags"
import { ALL, UNASSIGNED } from "@/lib/filter-options"
import { medir } from "@/lib/observe"
import { RESERVATIONS_PAGE_SIZE, type ReservationFilters } from "@/lib/reservation-filters"
import { addDays, operationToday } from "@/lib/today"

export { RESERVATIONS_PAGE_SIZE } from "@/lib/reservation-filters"

/** El pendiente operativo se calcula en SQL para poder filtrar por él. */
function pendingCondition(pending: ReservationFilters["pending"]) {
  if (pending === "all") return undefined
  // Solo lo confirmado tiene pendientes; el orden importa, guía tapa a chofer.
  const confirmed = eq(reservations.status, "confirmed")
  if (pending === "guide") return and(confirmed, isNull(reservations.guideId))
  if (pending === "driver") {
    return and(confirmed, sql`${reservations.guideId} is not null`, isNull(reservations.driverId))
  }
  return and(
    confirmed,
    sql`${reservations.guideId} is not null`,
    sql`${reservations.driverId} is not null`,
    eq(reservations.paymentPending, true),
  )
}

function conditions(organizationId: string, filters: ReservationFilters) {
  const all: (SQL | undefined)[] = [eq(reservations.organizationId, organizationId)]

  const query = filters.query.trim()
  if (query) {
    const term = `%${query}%`
    all.push(
      or(
        like(reservations.code, term),
        like(reservations.customerName, term),
        like(tours.name, term),
        like(hotels.name, term),
        like(agents.name, term),
      ),
    )
  }

  if (filters.status === "active") all.push(eq(reservations.status, "confirmed"))
  if (filters.status === "completed") all.push(eq(reservations.status, "completed"))
  if (filters.status === "cancelled") all.push(eq(reservations.status, "cancelled"))

  if (filters.from) all.push(gte(reservations.date, filters.from))
  if (filters.to) all.push(lte(reservations.date, filters.to))

  if (filters.tour !== ALL) all.push(eq(tours.name, filters.tour))
  if (filters.hotel !== ALL) all.push(eq(hotels.name, filters.hotel))
  if (filters.agent !== ALL) all.push(eq(agents.name, filters.agent))
  if (filters.guide === UNASSIGNED) all.push(isNull(reservations.guideId))
  else if (filters.guide !== ALL) all.push(eq(guides.name, filters.guide))

  all.push(pendingCondition(filters.pending))

  return and(...all.filter(Boolean))
}

type ListOptions = {
  organizationId: string
  filters: ReservationFilters
  page?: number
  pageSize?: number
  /** Ascendente para la operación del día, descendente para el historial. */
  order?: "asc" | "desc"
}

/**
 * La página que se pinta, no todo el historial: filtrado, ordenado y paginado
 * en SQL. Devuelve además el total para el pie de la tabla.
 */
export async function listReservations({
  organizationId,
  filters,
  page = 1,
  pageSize = RESERVATIONS_PAGE_SIZE,
  order = "desc",
}: ListOptions) {
  // Un rango invertido no es un error del sistema, es una consulta sin resultados.
  if (filters.from && filters.to && filters.from > filters.to) {
    return { reservations: [], total: 0, page: 1, pageCount: 1 }
  }

  const client = await db()
  const where = conditions(organizationId, filters)
  const direction = order === "asc" ? asc : desc

  return medir("db:listReservations", () => runList(client, where, direction, page, pageSize), {
    organizacion: organizationId,
    filas: (r) => r.reservations.length,
  })
}

async function runList(
  client: Awaited<ReturnType<typeof db>>,
  where: ReturnType<typeof conditions>,
  direction: typeof asc,
  page: number,
  pageSize: number,
) {
  const [rows, [totals]] = await Promise.all([
    client
      .select(reservationColumns)
      .from(reservations)
      .leftJoin(tours, eq(reservations.tourId, tours.id))
      .leftJoin(hotels, eq(reservations.hotelId, hotels.id))
      .leftJoin(guides, eq(reservations.guideId, guides.id))
      .leftJoin(drivers, eq(reservations.driverId, drivers.id))
      .leftJoin(agents, eq(reservations.agentId, agents.id))
      .where(where)
      .orderBy(direction(reservations.date), asc(reservations.time))
      .limit(pageSize)
      .offset((Math.max(1, page) - 1) * pageSize),
    client
      .select({ value: count() })
      .from(reservations)
      .leftJoin(tours, eq(reservations.tourId, tours.id))
      .leftJoin(hotels, eq(reservations.hotelId, hotels.id))
      .leftJoin(guides, eq(reservations.guideId, guides.id))
      .leftJoin(agents, eq(reservations.agentId, agents.id))
      .where(where),
  ])

  const today = operationToday()
  const tomorrow = addDays(today, 1)
  const total = totals?.value ?? 0

  return {
    reservations: rows.map((row) => toReservation(row, today, tomorrow)),
    total,
    page: Math.max(1, page),
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  }
}

/** Una reserva concreta, para el detalle y para el formulario de edición. */
export const findReservation = cache(async (organizationId: string, id: string) => {
  const client = await db()
  const [row] = await client
    .select(reservationColumns)
    .from(reservations)
    .leftJoin(tours, eq(reservations.tourId, tours.id))
    .leftJoin(hotels, eq(reservations.hotelId, hotels.id))
    .leftJoin(guides, eq(reservations.guideId, guides.id))
    .leftJoin(drivers, eq(reservations.driverId, drivers.id))
    .leftJoin(agents, eq(reservations.agentId, agents.id))
    .where(and(eq(reservations.organizationId, organizationId), eq(reservations.id, id)))
    .limit(1)

  if (!row) return null
  const today = operationToday()
  return toReservation(row, today, addDays(today, 1))
})

/**
 * El rango que cubre el historial, para el subtítulo de la pantalla. Solo se
 * mueve cuando se crea o borra una reserva, así que se cachea por etiqueta.
 */
export const reservationCoverage = cache((organizationId: string) => {
  return cachedPerOrganization(
    "reservation-coverage",
    organizationId,
    async () => {
      const client = await db()
      const [row] = await client
        .select({
          oldest: sql<string | null>`min(${reservations.date})`,
          newest: sql<string | null>`max(${reservations.date})`,
        })
        .from(reservations)
        .where(eq(reservations.organizationId, organizationId))

      return { oldest: row?.oldest ?? null, newest: row?.newest ?? null }
    },
    { tags: [tags.reservations(organizationId)], revalidate: 3600 },
  )
})

/**
 * Techo duro de filas para un periodo de operación. El rango ya viene
 * recortado por `clampRange`, así que esto es el segundo cinturón: aunque
 * alguien llame a esta consulta con otro rango, nunca se trae la tabla.
 */
export const OPERATION_PERIOD_LIMIT = 500

/**
 * Las salidas de un periodo de la operación. Viajan enteras a propósito: los
 * contadores de pendientes y el conteo en vivo de la hoja de filtros se
 * calculan sobre el conjunto completo del periodo. Por eso el periodo está
 * acotado —hasta `MAX_OPERATION_DAYS` días— y esta consulta lleva `limit`.
 */
export const listOperationPeriod = cache((organizationId: string, from: string, to: string) => {
  // Se mide con el conteo de filas: es la consulta que carga el periodo
  // entero, así que `filas` es lo que dice si el techo de 31 días alcanza o
  // si de verdad hay que bajar filtros y paginación a SQL.
  return medir("db:listOperationPeriod", () => runPeriod(organizationId, from, to), {
    organizacion: organizationId,
    filas: (rows) => rows.length,
  })
})

const runPeriod = cache(async (organizationId: string, from: string, to: string) => {
  const today = operationToday()
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
        gte(reservations.date, from),
        lte(reservations.date, to),
      ),
    )
    .orderBy(asc(reservations.date), asc(reservations.time))
    .limit(OPERATION_PERIOD_LIMIT)

  const tomorrow = addDays(today, 1)
  return rows.map((row) => toReservation(row, today, tomorrow))
})

/**
 * Salidas de hoy y mañana con algo sin resolver, que es lo que la campana
 * considera un aviso. Se piden solo esos dos días, no el historial entero.
 */
export const upcomingReservations = cache((organizationId: string) => {
  const today = operationToday()
  return cachedPerOrganization(
    "upcoming-reservations",
    organizationId,
    () => loadUpcoming(organizationId, today),
    {
      tags: [tags.reservations(organizationId)],
      // `today` va en la llave: si no, al cruzar la medianoche la entrada
      // cacheada seguiría anunciando las salidas de ayer.
      key: [today],
      revalidate: 300,
    },
  )
})

async function loadUpcoming(organizationId: string, today: string) {
  const tomorrow = addDays(today, 1)

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
        eq(reservations.status, "confirmed"),
        gte(reservations.date, today),
        lte(reservations.date, tomorrow),
        // Algo sin resolver: falta guía, falta chofer o falta cobrar.
        or(
          isNull(reservations.guideId),
          isNull(reservations.driverId),
          eq(reservations.paymentPending, true),
        ),
      ),
    )
    .orderBy(asc(reservations.date), asc(reservations.time))

  return { reservations: rows.map((row) => toReservation(row, today, tomorrow)), today }
}

/** Búsqueda de la paleta de comandos: pocas coincidencias, resueltas en SQL. */
export async function searchReservations(organizationId: string, term: string, limit: number) {
  const client = await db()
  const like_ = `%${term}%`
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
        or(
          like(reservations.code, like_),
          like(reservations.customerName, like_),
          like(tours.name, like_),
          like(hotels.name, like_),
          like(agents.name, like_),
        ),
      ),
    )
    .orderBy(desc(reservations.date))
    .limit(limit)

  const today = operationToday()
  return rows.map((row) => toReservation(row, today, addDays(today, 1)))
}

/**
 * Totales de todo lo que cumple el filtro, no de la página en pantalla. Se
 * calcula en SQL para no traer miles de filas solo para sumarlas.
 */
export async function reservationTotals(organizationId: string, filters: ReservationFilters) {
  if (filters.from && filters.to && filters.from > filters.to) {
    return { reservations: 0, pax: 0, income: 0, cancelled: 0 }
  }

  const client = await db()
  const where = conditions(organizationId, filters)
  const activa = sql`case when ${reservations.status} = 'cancelled' then 0 else 1 end`

  const [row] = await client
    .select({
      reservations: sql<number>`sum(${activa})`,
      pax: sql<number>`sum(${activa} * ${reservations.people})`,
      // La tarifa es por persona: el total de la reserva las multiplica.
      income: sql<number>`sum(${activa} * ${reservations.people} * ${reservations.netRateCents})`,
      cancelled: sql<number>`sum(1 - ${activa})`,
    })
    .from(reservations)
    .leftJoin(tours, eq(reservations.tourId, tours.id))
    .leftJoin(hotels, eq(reservations.hotelId, hotels.id))
    .leftJoin(guides, eq(reservations.guideId, guides.id))
    .leftJoin(agents, eq(reservations.agentId, agents.id))
    .where(where)

  return {
    reservations: Number(row?.reservations ?? 0),
    pax: Number(row?.pax ?? 0),
    income: Number(row?.income ?? 0) / 100,
    cancelled: Number(row?.cancelled ?? 0),
  }
}
