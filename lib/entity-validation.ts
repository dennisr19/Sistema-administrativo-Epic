import { z } from "zod"

import { entityKinds } from "@/lib/entities"

const emptyToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value

const emptyToNull = (value: unknown) => {
  if (typeof value !== "string") return value
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

const id = z.preprocess(emptyToUndefined, z.string().trim().min(1).max(120).optional())
const name = z.string().trim().min(1, "Escribe un nombre.").max(160, "Máximo 160 caracteres.")
const optionalText = (maximum = 240) =>
  z.preprocess(emptyToNull, z.string().trim().max(maximum).nullable())
const optionalEmail = z.preprocess(
  emptyToNull,
  z.string().trim().max(254).email("Escribe un correo válido.").nullable(),
)

const common = { id, name }

export const entityInputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("tours"),
    ...common,
    description: optionalText(500),
    tourKind: z.preprocess(emptyToNull, z.enum(["nature", "mountain", "water", "city"]).nullable()),
    price: z.preprocess(
      (value) => (value === "" ? 0 : value),
      z.coerce.number().finite().min(0, "El precio no puede ser negativo.").max(1_000_000),
    ),
    includesMeals: z.preprocess(
      (value) => value === "true" || value === "on" || value === "si",
      z.boolean(),
    ),
  }),
  z.object({
    kind: z.literal("guides"),
    ...common,
    phone: optionalText(60),
    email: optionalEmail,
  }),
  z.object({
    kind: z.literal("drivers"),
    ...common,
    phone: optionalText(60),
    license: optionalText(80),
  }),
  z.object({
    kind: z.literal("hotels"),
    ...common,
    phone: optionalText(60),
    address: optionalText(300),
    email: optionalEmail,
  }),
  z.object({
    kind: z.literal("agents"),
    ...common,
    phone: optionalText(60),
    company: optionalText(160),
    email: optionalEmail,
  }),
  z.object({
    kind: z.literal("meals"),
    ...common,
  }),
])

export const entityReferenceSchema = z.object({
  kind: z.enum(entityKinds),
  id: z.string().trim().min(1).max(120),
})

export type EntityInput = z.infer<typeof entityInputSchema>

export function fieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form")
    errors[key] ??= issue.message
  }
  return errors
}
