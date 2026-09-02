"use server"

import { revalidatePath } from "next/cache"

import { saveCatalogEntity, toggleCatalogEntity } from "@/db/mutations/catalog"
import { requireSession } from "@/lib/auth/server"
import type { EntityActionState } from "@/lib/entity-action-state"
import { entityInputSchema, entityReferenceSchema, fieldErrors } from "@/lib/entity-validation"

const databaseMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : ""
  if (message.includes("UNIQUE constraint failed")) {
    return "Ya existe un registro con ese nombre."
  }
  return "No pudimos guardar los cambios. Intenta nuevamente."
}

export async function saveEntityAction(
  _previousState: EntityActionState,
  formData: FormData,
): Promise<EntityActionState> {
  const { organizationId } = await requireSession()

  const parsed = entityInputSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa los campos indicados.",
      errors: fieldErrors(parsed.error),
    }
  }

  try {
    const rows = await saveCatalogEntity(organizationId, parsed.data)
    if (!rows.length) return { status: "error", message: "El registro ya no existe." }
    revalidatePath("/configuracion")
    return { status: "success", message: "Cambios guardados." }
  } catch (error) {
    return { status: "error", message: databaseMessage(error) }
  }
}

export async function toggleEntityAction(
  _previousState: EntityActionState,
  formData: FormData,
): Promise<EntityActionState> {
  const { organizationId } = await requireSession()

  const parsed = entityReferenceSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { status: "error", message: "El registro no es válido." }

  try {
    const rows = await toggleCatalogEntity(organizationId, parsed.data.kind, parsed.data.id)
    if (!rows.length) return { status: "error", message: "El registro ya no existe." }
    revalidatePath("/configuracion")
    return { status: "success" }
  } catch {
    return { status: "error", message: "No pudimos cambiar el estado." }
  }
}
