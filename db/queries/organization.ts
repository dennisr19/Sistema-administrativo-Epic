import "server-only"

import { eq } from "drizzle-orm"
import { cache } from "react"

import { db } from "@/db"
import { organizations } from "@/db/schema"

/** El nombre que se ve bajo el logotipo en la barra lateral. */
export const organizationName = cache(async (organizationId: string) => {
  const client = await db()
  const [row] = await client
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, organizationId))
  return row?.name ?? ""
})
