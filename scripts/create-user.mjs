#!/usr/bin/env node
/**
 * Da de alta un operador. No hay registro público, así que las cuentas se
 * crean desde aquí.
 *
 *   npm run db:user -- correo@ejemplo.com "Nombre Apellido"
 *   npm run db:user -- correo@ejemplo.com "Nombre Apellido" --remote
 */
import { execFileSync } from "node:child_process"

const [email, name, ...flags] = process.argv.slice(2)
const remote = flags.includes("--remote")
const organizationId = "org_epic_ops"

if (!email?.includes("@") || !name) {
  console.error('Uso: npm run db:user -- correo@ejemplo.com "Nombre Apellido" [--remote]')
  process.exit(1)
}

const quote = (value) => `'${value.replace(/'/g, "''")}'`
const sql = `
INSERT INTO user (id, name, email, email_verified, created_at, updated_at, organization_id)
VALUES (${quote(`usr_${crypto.randomUUID()}`)}, ${quote(name)}, ${quote(email.toLowerCase())}, 1,
        unixepoch() * 1000, unixepoch() * 1000, ${quote(organizationId)})
ON CONFLICT(email) DO UPDATE SET name = excluded.name, organization_id = excluded.organization_id;`

execFileSync(
  "npx",
  [
    "wrangler",
    "d1",
    "execute",
    "sistema-administrativo-epic",
    remote ? "--remote" : "--local",
    "--command",
    sql,
  ],
  { stdio: "inherit" },
)

console.log(`\n${email} puede entrar en ${remote ? "producción" : "local"}.`)
