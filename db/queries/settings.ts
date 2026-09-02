import "server-only"

import { and, asc, count, eq, sql } from "drizzle-orm"
import { cache } from "react"

import { type Database, db } from "@/db"
import { agents, drivers, guides, hotels, mealOptions, reservations, tours } from "@/db/schema"
import type { EntityKind, EntityRecord, SettingsData } from "@/lib/entities"

type ActiveData = Pick<SettingsData, "records" | "usage">
type UsedRow = EntityRecord & { used: number }

const withUsage = (rows: UsedRow[]): ActiveData => ({
  records: rows.map(({ used: _used, ...record }) => record),
  usage: Object.fromEntries(rows.map((row) => [row.id, row.used])),
})

/** Solo seis enteros para el menú lateral, en una única ida a D1. */
async function catalogCounts(client: Database, organizationId: string) {
  const [row] = await client.all<SettingsData["counts"]>(sql`
    select
      (select count(*) from ${tours} where ${tours.organizationId} = ${organizationId}) as tours,
      (select count(*) from ${guides} where ${guides.organizationId} = ${organizationId}) as guides,
      (select count(*) from ${drivers} where ${drivers.organizationId} = ${organizationId}) as drivers,
      (select count(*) from ${hotels} where ${hotels.organizationId} = ${organizationId}) as hotels,
      (select count(*) from ${agents} where ${agents.organizationId} = ${organizationId}) as agents,
      (select count(*) from ${mealOptions} where ${mealOptions.organizationId} = ${organizationId}) as meals
  `)

  return row
}

/**
 * Una sola consulta por catálogo: las filas y su uso llegan juntas. El switch
 * mantiene columnas y llaves foráneas tipadas por Drizzle sin nombres de tabla dinámicos.
 */
async function activeCatalog(
  client: Database,
  organizationId: string,
  kind: EntityKind,
): Promise<ActiveData> {
  switch (kind) {
    case "tours": {
      const rows = await client
        .select({
          id: tours.id,
          name: tours.name,
          active: tours.active,
          description: tours.description,
          priceCents: tours.priceCents,
          kind: tours.kind,
          includesMeals: tours.includesMeals,
          used: count(reservations.id),
        })
        .from(tours)
        .leftJoin(
          reservations,
          and(eq(reservations.organizationId, organizationId), eq(reservations.tourId, tours.id)),
        )
        .where(eq(tours.organizationId, organizationId))
        .groupBy(tours.id)
        .orderBy(asc(tours.name))

      return withUsage(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          active: row.active,
          description: row.description ?? "",
          price: row.priceCents / 100,
          kind: row.kind ?? undefined,
          includesMeals: row.includesMeals,
          used: row.used,
        })),
      )
    }
    case "guides": {
      const rows = await client
        .select({
          id: guides.id,
          name: guides.name,
          active: guides.active,
          phone: guides.phone,
          email: guides.email,
          used: count(reservations.id),
        })
        .from(guides)
        .leftJoin(
          reservations,
          and(eq(reservations.organizationId, organizationId), eq(reservations.guideId, guides.id)),
        )
        .where(eq(guides.organizationId, organizationId))
        .groupBy(guides.id)
        .orderBy(asc(guides.name))

      return withUsage(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          active: row.active,
          phone: row.phone ?? "",
          email: row.email ?? "",
          used: row.used,
        })),
      )
    }
    case "drivers": {
      const rows = await client
        .select({
          id: drivers.id,
          name: drivers.name,
          active: drivers.active,
          phone: drivers.phone,
          license: drivers.license,
          used: count(reservations.id),
        })
        .from(drivers)
        .leftJoin(
          reservations,
          and(
            eq(reservations.organizationId, organizationId),
            eq(reservations.driverId, drivers.id),
          ),
        )
        .where(eq(drivers.organizationId, organizationId))
        .groupBy(drivers.id)
        .orderBy(asc(drivers.name))

      return withUsage(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          active: row.active,
          phone: row.phone ?? "",
          license: row.license ?? "",
          used: row.used,
        })),
      )
    }
    case "hotels": {
      const rows = await client
        .select({
          id: hotels.id,
          name: hotels.name,
          active: hotels.active,
          phone: hotels.phone,
          address: hotels.address,
          email: hotels.email,
          used: count(reservations.id),
        })
        .from(hotels)
        .leftJoin(
          reservations,
          and(eq(reservations.organizationId, organizationId), eq(reservations.hotelId, hotels.id)),
        )
        .where(eq(hotels.organizationId, organizationId))
        .groupBy(hotels.id)
        .orderBy(asc(hotels.name))

      return withUsage(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          active: row.active,
          phone: row.phone ?? "",
          address: row.address ?? "",
          email: row.email ?? "",
          used: row.used,
        })),
      )
    }
    case "agents": {
      const rows = await client
        .select({
          id: agents.id,
          name: agents.name,
          active: agents.active,
          phone: agents.phone,
          company: agents.company,
          email: agents.email,
          used: count(reservations.id),
        })
        .from(agents)
        .leftJoin(
          reservations,
          and(eq(reservations.organizationId, organizationId), eq(reservations.agentId, agents.id)),
        )
        .where(eq(agents.organizationId, organizationId))
        .groupBy(agents.id)
        .orderBy(asc(agents.name))

      return withUsage(
        rows.map((row) => ({
          id: row.id,
          name: row.name,
          active: row.active,
          phone: row.phone ?? "",
          company: row.company ?? "",
          email: row.email ?? "",
          used: row.used,
        })),
      )
    }
    case "meals": {
      const rows = await client
        .select({ id: mealOptions.id, name: mealOptions.name, active: mealOptions.active })
        .from(mealOptions)
        .where(eq(mealOptions.organizationId, organizationId))
        .orderBy(asc(mealOptions.name))

      return { records: rows, usage: {} }
    }
  }
}

export const getSettingsData = cache(
  async (organizationId: string, kind: EntityKind): Promise<SettingsData> => {
    const client = await db()
    const [active, counts] = await Promise.all([
      activeCatalog(client, organizationId, kind),
      catalogCounts(client, organizationId),
    ])

    return { kind, ...active, counts }
  },
)
