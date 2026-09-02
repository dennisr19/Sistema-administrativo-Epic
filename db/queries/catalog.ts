import { asc, eq } from "drizzle-orm"

import { db } from "@/db"
import { agents, drivers, guides, hotels, mealOptions, tours } from "@/db/schema"

export const catalogTables = {
  tours,
  guides,
  drivers,
  hotels,
  agents,
  meals: mealOptions,
} as const

export type CatalogKind = keyof typeof catalogTables
type CatalogTable = (typeof catalogTables)[CatalogKind]

/** Lista un catálogo completo: son decenas de filas, no hacen falta páginas en el servidor. */
export async function listCatalog<K extends CatalogKind>(kind: K, organizationId: string) {
  const client = await db()
  const table: CatalogTable = catalogTables[kind]
  const rows = await client
    .select()
    .from(table)
    .where(eq(table.organizationId, organizationId))
    .orderBy(asc(table.name))
  return rows as (typeof catalogTables)[K]["$inferSelect"][]
}
