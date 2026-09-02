import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: ["./db/schema.ts", "./db/auth-schema.ts"],
  out: "./drizzle",
  // Las migraciones las aplica `wrangler d1 migrations apply`, local y en producción.
  casing: "snake_case",
})
