import "server-only"

import { asc, eq } from "drizzle-orm"
import { cache } from "react"

import { db } from "@/db"
import { agents, drivers, guides, hotels, mealOptions, tours } from "@/db/schema"
import type { EntityKind, EntityRecord } from "@/lib/entities"

export type Catalogs = Record<EntityKind, EntityRecord[]>

/**
 * Los seis catálogos completos. Son un par de centenares de filas y alimentan
 * los filtros y los desplegables del formulario, así que viajan enteros al
 * cliente una sola vez por navegación.
 */
export const getCatalogs = cache(async (organizationId: string): Promise<Catalogs> => {
  const client = await db()
  const [tourRows, guideRows, driverRows, hotelRows, agentRows, mealRows] = await Promise.all([
    client
      .select()
      .from(tours)
      .where(eq(tours.organizationId, organizationId))
      .orderBy(asc(tours.name)),
    client
      .select()
      .from(guides)
      .where(eq(guides.organizationId, organizationId))
      .orderBy(asc(guides.name)),
    client
      .select()
      .from(drivers)
      .where(eq(drivers.organizationId, organizationId))
      .orderBy(asc(drivers.name)),
    client
      .select()
      .from(hotels)
      .where(eq(hotels.organizationId, organizationId))
      .orderBy(asc(hotels.name)),
    client
      .select()
      .from(agents)
      .where(eq(agents.organizationId, organizationId))
      .orderBy(asc(agents.name)),
    client
      .select()
      .from(mealOptions)
      .where(eq(mealOptions.organizationId, organizationId))
      .orderBy(asc(mealOptions.name)),
  ])

  return {
    tours: tourRows.map((row) => ({
      id: row.id,
      name: row.name,
      active: row.active,
      description: row.description ?? "",
      price: row.priceCents / 100,
      kind: row.kind ?? undefined,
      includesMeals: row.includesMeals,
    })),
    guides: guideRows.map((row) => ({
      id: row.id,
      name: row.name,
      active: row.active,
      phone: row.phone ?? "",
      email: row.email ?? "",
    })),
    drivers: driverRows.map((row) => ({
      id: row.id,
      name: row.name,
      active: row.active,
      phone: row.phone ?? "",
      license: row.license ?? "",
    })),
    hotels: hotelRows.map((row) => ({
      id: row.id,
      name: row.name,
      active: row.active,
      phone: row.phone ?? "",
      address: row.address ?? "",
      email: row.email ?? "",
    })),
    agents: agentRows.map((row) => ({
      id: row.id,
      name: row.name,
      active: row.active,
      phone: row.phone ?? "",
      company: row.company ?? "",
      email: row.email ?? "",
    })),
    meals: mealRows.map((row) => ({ id: row.id, name: row.name, active: row.active })),
  }
})
