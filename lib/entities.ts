import type { TourKind } from "@/lib/reservation"

export const entityKinds = ["tours", "guides", "drivers", "hotels", "agents", "meals"] as const

export type EntityKind = (typeof entityKinds)[number]

/** Los campos siguen los de la app actual de Sistema Administrativo Epic, tipo por tipo. */
export type EntityRecord = {
  id: string
  name: string
  active: boolean
  phone?: string
  email?: string
  company?: string
  address?: string
  license?: string
  description?: string
  price?: number
  kind?: TourKind
  /** Solo tours: si no la incluye, la reserva no pregunta por alimentación. */
  includesMeals?: boolean
}

export type FieldKey = keyof Omit<EntityRecord, "id" | "active">

export type EntityField = {
  key: FieldKey
  label: string
  type: "text" | "email" | "tel" | "number" | "select" | "boolean"
  options?: { value: string; label: string }[]
  hint?: string
  /** Ancho de la columna en la tabla desktop. */
  width?: string
  align?: "right"
  /** Columna secundaria: se oculta en la tabla cuando el ancho no alcanza. */
  secondary?: boolean
}

export type EntityDefinition = {
  kind: EntityKind
  label: string
  singular: string
  /** Cómo se cuenta. Casi siempre es la etiqueta en minúscula, pero no
   *  "Alimentación": se cuentan opciones, no alimentaciones. */
  plural: string
  description: string
  /** Campo de la reserva contra el que se cuenta el uso. `null` si todavía no se registra. */
  usageKey: "tour" | "guide" | "driver" | "hotel" | "agent" | null
  fields: EntityField[]
}

export type SettingsData = {
  kind: EntityKind
  records: EntityRecord[]
  usage: Record<string, number>
  counts: Record<EntityKind, number>
}

const tourKinds = [
  { value: "nature", label: "Naturaleza" },
  { value: "mountain", label: "Montaña" },
  { value: "water", label: "Agua" },
  { value: "city", label: "Ciudad" },
]

export const entityDefinitions: EntityDefinition[] = [
  {
    kind: "tours",
    plural: "tours",
    label: "Tours",
    singular: "tour",
    description: "Lo que se vende.",
    usageKey: "tour",
    fields: [
      { key: "name", label: "Nombre", type: "text", width: "w-[26%]" },
      { key: "description", label: "Descripción", type: "text", width: "w-[30%]" },
      {
        key: "kind",
        label: "Tipo",
        type: "select",
        options: tourKinds,
        width: "w-[110px]",
        secondary: true,
        hint: "Define el icono de color en las listas de reservas.",
      },
      { key: "price", label: "Precio", type: "number", width: "w-[80px]", align: "right" },
      {
        key: "includesMeals",
        label: "Alimentación",
        type: "boolean",
        width: "w-[120px]",
        secondary: true,
        hint: "Si no la incluye, la reserva no pregunta por alimentación.",
      },
    ],
  },
  {
    kind: "guides",
    plural: "guías",
    label: "Guías",
    singular: "guía",
    description: "Quién acompaña la salida.",
    usageKey: "guide",
    fields: [
      { key: "name", label: "Nombre", type: "text", width: "w-[26%]" },
      { key: "phone", label: "Teléfono", type: "tel", width: "w-[120px]" },
      { key: "email", label: "Email", type: "email", width: "w-[28%]" },
    ],
  },
  {
    kind: "drivers",
    plural: "choferes",
    label: "Choferes",
    singular: "chofer",
    description: "Quién transporta a los pasajeros.",
    usageKey: "driver",
    fields: [
      { key: "name", label: "Nombre", type: "text", width: "w-[26%]" },
      { key: "phone", label: "Teléfono", type: "tel", width: "w-[120px]" },
      { key: "license", label: "Licencia", type: "text", width: "w-[110px]" },
    ],
  },
  {
    kind: "hotels",
    plural: "hoteles",
    label: "Hoteles",
    singular: "hotel",
    description: "Puntos de recogida.",
    usageKey: "hotel",
    fields: [
      { key: "name", label: "Nombre", type: "text", width: "w-[26%]" },
      { key: "phone", label: "Teléfono", type: "tel", width: "w-[120px]" },
      { key: "address", label: "Dirección", type: "text", width: "w-[24%]" },
      { key: "email", label: "Email", type: "email", width: "w-[20%]", secondary: true },
    ],
  },
  {
    kind: "agents",
    plural: "agentes",
    label: "Agentes",
    singular: "agente",
    description: "De dónde llegan las reservas.",
    usageKey: "agent",
    fields: [
      { key: "name", label: "Nombre", type: "text", width: "w-[26%]" },
      { key: "phone", label: "Teléfono", type: "tel", width: "w-[120px]" },
      { key: "company", label: "Empresa", type: "text", width: "w-[24%]" },
      { key: "email", label: "Email", type: "email", width: "w-[20%]", secondary: true },
    ],
  },
  {
    kind: "meals",
    plural: "opciones",
    label: "Alimentación",
    singular: "opción",
    description: "Opciones que se pueden agregar a un tour.",
    usageKey: null,
    fields: [{ key: "name", label: "Nombre", type: "text", width: "w-[26%]" }],
  },
]

export function definitionOf(kind: EntityKind) {
  return entityDefinitions.find((definition) => definition.kind === kind) as EntityDefinition
}

export function entityKindOf(value: string | string[] | undefined): EntityKind {
  const candidate = Array.isArray(value) ? value[0] : value
  return entityKinds.includes(candidate as EntityKind) ? (candidate as EntityKind) : "tours"
}

export function displayValue(record: EntityRecord, field: EntityField) {
  const value = record[field.key]
  if (field.type === "boolean") return value ? "Incluida" : "No incluye"
  if (value === undefined || value === "") return ""
  if (field.key === "price") return `$${value}`
  if (field.key === "kind") return field.options?.find((o) => o.value === value)?.label ?? ""
  return String(value)
}
