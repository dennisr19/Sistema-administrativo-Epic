import "server-only"

import { eq } from "drizzle-orm"
import { cache } from "react"

import { db } from "@/db"
import { cachedPerOrganization } from "@/db/cached"
import { organizations } from "@/db/schema"
import { tags } from "@/lib/cache-tags"

/**
 * El nombre que se ve bajo el logotipo en la barra lateral. Cambia solo
 * desde Perfil, así que se cachea fuerte y esa acción lo invalida.
 */
export const organizationName = cache((organizationId: string): Promise<string> => {
  return cachedPerOrganization("organization-name", organizationId, () => load(organizationId), {
    tags: [tags.organization(organizationId)],
    revalidate: 3600,
  })
})

async function load(organizationId: string) {
  const client = await db()
  const [row] = await client
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
  return row?.name ?? ""
}
