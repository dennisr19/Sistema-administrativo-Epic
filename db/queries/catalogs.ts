import "server-only"

import { asc, eq } from "drizzle-orm"
import { cache } from "react"

import { db } from "@/db"
import { cachedPerOrganization } from "@/db/cached"
import { agents, drivers, guides, hotels, mealOptions, tours } from "@/db/schema"
import { tags } from "@/lib/cache-tags"
import type { EntityKind, EntityRecord } from "@/lib/entities"

export type Catalogs = Record<EntityKind, EntityRecord[]>

/** Una hora de techo: en la práctica muere antes, por etiqueta. */
const CATALOGS_TTL = 3600

/**
 * Los seis catálogos completos. Son datos de referencia: cambian cuando
 * alguien edita Configuración y no antes, así que se cachean fuerte y se
 * invalidan por etiqueta desde las acciones de catálogo.
 *
 * `cache` de React sigue encima: deduplica dentro del mismo request; el de
 * abajo es el que sobrevive entre requests.
 */
export const getCatalogs = cache((organizationId: string): Promise<Catalogs> => {
  return cachedPerOrganization("catalogs", organizationId, () => loadCatalogs(organizationId), {
    tags: [tags.catalogs(organizationId)],
    revalidate: CATALOGS_TTL,
  })
})

async function loadCatalogs(organizationId: string): Promise<Catalogs> {
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
}
