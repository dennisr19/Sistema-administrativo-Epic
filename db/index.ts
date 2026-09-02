import { getCloudflareContext } from "@opennextjs/cloudflare"
import { drizzle } from "drizzle-orm/d1"

import * as authSchema from "./auth-schema"
import * as appSchema from "./schema"

export const schema = { ...appSchema, ...authSchema }

/**
 * Cliente de D1 para el request en curso. El binding lo entrega el runtime de
 * Cloudflare, en `next dev` a través de la base local de wrangler.
 */
export async function db() {
  const { env } = await getCloudflareContext({ async: true })
  return drizzle(env.DB, { schema, casing: "snake_case" })
}

export type Database = Awaited<ReturnType<typeof db>>
