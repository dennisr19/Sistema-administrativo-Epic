#!/usr/bin/env node
/**
 * Convierte los seis exports de la app actual en datos listos para D1.
 *
 *   node scripts/import/build-seed.mjs ~/Downloads
 *
 * Escribe `data/seed/*.json` (una por tabla), `data/seed/seed.sql` y `data/seed/REPORT.md`
 * con todo lo que hubo que decidir. Es idempotente: los ids se derivan del nombre.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { readSheet } from "./xlsx.mjs"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const source = resolve(process.argv[2] ?? join(process.env.HOME ?? "", "Downloads"))
const out = join(root, "data/seed")

const ORGANIZATION = { id: "org_epic_ops", name: "epic-ops", slug: "epic-ops" }
/** El export marca en verde los registros vigentes; no trae los desactivados. */
const ACTIVE_COLOR = "#4CAF50"
/** La app actual escribe esto en lugar de dejar el campo vacío. */
const PLACEHOLDERS = new Set(["pendiente", "n/a", "na", "-", "sin correo", "sin email"])

const notes = []
const note = (table, message) => notes.push({ table, message })

const clean = (value) => (value ?? "").replace(/\s+/g, " ").trim()
const key = (value) => clean(value).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

const text = (value) => {
  const cleaned = clean(value)
  return !cleaned || PLACEHOLDERS.has(cleaned.toLowerCase()) ? null : cleaned
}

const phone = (value) => {
  const digits = clean(value).replace(/\D/g, "")
  return digits || null
}

const email = (value) => {
  const cleaned = text(value)?.toLowerCase() ?? null
  return cleaned?.includes("@") ? cleaned : null
}

const minorParticles = new Set(["de", "del", "la", "las", "los", "y", "da", "van", "von"])
/** Los nombres vienen en mayúsculas por captura, no porque se escriban así. */
const titleCase = (value) =>
  clean(value)
    .toLowerCase()
    .split(" ")
    .map((word, index) =>
      index > 0 && minorParticles.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ")

const slug = (value) =>
  key(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "sin-nombre"

/** Ids estables y legibles: reejecutar el import no cambia ninguna llave. */
function identify(prefix, name, taken) {
  const base = `${prefix}_${slug(name)}`
  let id = base
  let suffix = 2
  while (taken.has(id)) id = `${base}-${suffix++}`
  taken.add(id)
  return id
}

const sheet = (file) => {
  const path = join(source, `${file}.xlsx`)
  if (!existsSync(path)) throw new Error(`Falta ${path}`)
  const { header, rows } = readSheet(path, readFileSync)
  const column = (label) => Object.keys(header).find((letter) => header[letter] === label)
  const columns = Object.keys(header)
  const stateColumn = columns[columns.length - 1]
  return rows.map((row) => ({
    get: (label) => row.values[column(label)] ?? "",
    active: clean(row.values[stateColumn]).toUpperCase() === ACTIVE_COLOR.toUpperCase(),
  }))
}

/** Catálogo: filas únicas por nombre normalizado, con un índice para resolver referencias. */
function catalog(file, prefix, map) {
  const rows = sheet(file)
  const byKey = new Map()
  const records = []
  const taken = new Set()

  for (const row of rows) {
    const name = clean(row.get("Nombre"))
    if (!name) {
      note(file, "Se descartó una fila sin nombre.")
      continue
    }

    const existing = byKey.get(key(name))
    if (existing) {
      note(file, `"${name}" duplica a "${existing.name}"; se unificaron en un registro.`)
      continue
    }

    const record = {
      id: identify(prefix, name, taken),
      organizationId: ORGANIZATION.id,
      name,
      ...map(row),
      active: row.active,
    }
    byKey.set(key(name), record)
    records.push(record)
  }

  return { records, byKey }
}

const tours = catalog("tours", "tour", (row) => ({
  description: text(row.get("Descripción")),
  priceCents: Math.round(Number(clean(row.get("Precio")) || 0) * 100),
}))

const guides = catalog("guias", "gui", (row) => ({
  phone: phone(row.get("Teléfono")),
  email: email(row.get("Email")),
}))

const drivers = catalog("choferes", "drv", (row) => ({
  phone: phone(row.get("Teléfono")),
  license: text(row.get("Licencia")),
}))

const hotels = catalog("hoteles", "htl", (row) => ({
  phone: phone(row.get("Teléfono")),
  address: text(row.get("Dirección")),
  email: email(row.get("Email")),
}))

const agents = catalog("agentes", "agt", (row) => ({
  phone: phone(row.get("Teléfono")),
  company: text(row.get("Empresa")),
  email: email(row.get("Email")),
}))

/** El serial de Excel cuenta días desde 1899-12-30. */
const EXCEL_EPOCH = Date.UTC(1899, 11, 30)
const isoDate = (serial) =>
  new Date(EXCEL_EPOCH + Number(serial) * 86_400_000).toISOString().slice(0, 10)

/** "07:40 AM" a "07:40": el formato de 24 h ordena y compara sin ambigüedad. */
function time24(value) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(clean(value))
  if (!match) return null
  const meridiem = match[3].toUpperCase()
  let hour = Number(match[1]) % 12
  if (meridiem === "PM") hour += 12
  return `${String(hour).padStart(2, "0")}:${match[2]}`
}

function reservations() {
  const catalogs = { tour: tours, hotel: hotels, driver: drivers, guide: guides, agent: agents }
  const labels = { tour: "Tour", hotel: "Hotel", driver: "Chofer", guide: "Guía", agent: "Agente" }
  const missing = new Map()
  const taken = new Set()
  const earlyDepartures = []
  const records = []

  for (const row of sheet("reservas")) {
    const code = clean(row.get("N° Doc"))
    const date = isoDate(row.get("Fecha"))
    const time = time24(row.get("Hora"))
    if (!time) note("reservas", `${code}: hora ilegible "${clean(row.get("Hora"))}".`)
    if (time && Number(time.slice(0, 2)) < 4) earlyDepartures.push(`${code} ${time}`)

    const links = {}
    for (const [field, source] of Object.entries(catalogs)) {
      const value = clean(row.get(labels[field]))
      const found = value ? source.byKey.get(key(value)) : null
      links[`${field}Id`] = found?.id ?? null
      if (value && !found) missing.set(`${labels[field]}: ${value}`, true)
    }

    records.push({
      id: identify("res", code || `${date}-${time}`, taken),
      organizationId: ORGANIZATION.id,
      code,
      date,
      time,
      customerName: titleCase(row.get("Cliente")),
      people: Number(clean(row.get("Personas")) || 0),
      ticketCount: Number(clean(row.get("Ticket")) || 0),
      ...links,
      netRateCents: Math.round(Number(clean(row.get("Tarifa Neta")) || 0) * 100),
      note: clean(row.get("Nota")) || null,
      status: row.active ? "confirmed" : "cancelled",
    })
  }

  for (const value of missing.keys()) note("reservas", `Referencia sin registro, ${value}.`)
  if (earlyDepartures.length)
    note(
      "reservas",
      `${earlyDepartures.length} salidas antes de las 04:00, revisar si son AM/PM mal capturados: ${earlyDepartures.slice(0, 6).join(", ")}.`,
    )
  return records
}

/**
 * El export no traía alimentación: son opciones que define el operador, no
 * datos heredados. Se fijan aquí para que sobrevivan a un `db:reset`.
 */
const meals = ["Pollo", "Pescado", "Vegetariano", "Vegano", "Sin gluten"].map((name) => ({
  id: `meal_${slug(name)}`,
  organizationId: ORGANIZATION.id,
  name,
  priceCents: 0,
  active: true,
}))

const tables = {
  organizations: [ORGANIZATION],
  tours: tours.records,
  guides: guides.records,
  drivers: drivers.records,
  hotels: hotels.records,
  agents: agents.records,
  meal_options: meals,
  reservations: reservations(),
}

// ---------- Salida ----------

const sqlValue = (value) => {
  if (value === null || value === undefined) return "NULL"
  if (typeof value === "number") return String(value)
  if (typeof value === "boolean") return value ? "1" : "0"
  return `'${String(value).replace(/'/g, "''")}'`
}

const snake = (value) => value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)

function toSql(table, rows) {
  if (!rows.length) return ""
  const columns = Object.keys(rows[0])
  const header = columns.map(snake).join(", ")
  // Lotes: D1 rechaza sentencias muy largas.
  const batches = []
  for (let index = 0; index < rows.length; index += 50) {
    const values = rows
      .slice(index, index + 50)
      .map((row) => `  (${columns.map((column) => sqlValue(row[column])).join(", ")})`)
      .join(",\n")
    batches.push(`INSERT INTO ${table} (${header}) VALUES\n${values};`)
  }
  return `-- ${table} (${rows.length})\n${batches.join("\n")}\n`
}

mkdirSync(out, { recursive: true })
for (const [table, rows] of Object.entries(tables)) {
  writeFileSync(join(out, `${table}.json`), `${JSON.stringify(rows, null, 2)}\n`)
}
writeFileSync(
  join(out, "seed.sql"),
  [
    "-- Generado por scripts/import/build-seed.mjs. No editar a mano.",
    "PRAGMA defer_foreign_keys = true;",
    ...Object.entries(tables).map(([table, rows]) => toSql(table, rows)),
  ].join("\n"),
)

const grouped = notes.reduce((all, item) => {
  ;(all[item.table] ??= []).push(item.message)
  return all
}, {})

writeFileSync(
  join(out, "REPORT.md"),
  [
    "# Import de la app actual",
    "",
    `Generado el ${new Date().toISOString().slice(0, 10)} desde \`${source}\`.`,
    "Reejecutable con `npm run import:seed`; los ids se derivan del nombre, así que no cambian.",
    "",
    "## Filas",
    "",
    "| Tabla | Filas |",
    "| --- | --- |",
    ...Object.entries(tables).map(([table, rows]) => `| ${table} | ${rows.length} |`),
    "",
    "## Transformaciones",
    "",
    "- Se recortan espacios sobrantes en todos los campos (el export los trae en casi todos).",
    "- `pendiente`, `n/a` y similares pasan a `NULL`: eran un relleno, no un dato.",
    "- Teléfonos guardados solo con dígitos; el formato es cosa de la interfaz.",
    "- Precios y tarifas en céntimos enteros, en dólares, la moneda con la que se cotiza.",
    "- Fechas desde el serial de Excel a ISO, y horas de `07:40 AM` a `07:40`.",
    "- Nombres de cliente en mayúsculas capturadas se pasan a capitalización normal.",
    "- Tours, hoteles, choferes, guías y agentes se referencian por id, no por nombre.",
    "- El export solo trae registros vigentes, así que todo entra como activo.",
    "",
    "## Qué hubo que decidir",
    "",
    ...(notes.length
      ? Object.entries(grouped).flatMap(([table, messages]) => [
          `### ${table}`,
          "",
          ...messages.map((message) => `- ${message}`),
          "",
        ])
      : ["- Nada: los seis archivos entraron limpios.", ""]),
  ].join("\n"),
)

console.log(
  Object.entries(tables)
    .map(([table, rows]) => `${table}: ${rows.length}`)
    .join("\n"),
)
console.log(`\n${notes.length} notas en data/seed/REPORT.md`)
