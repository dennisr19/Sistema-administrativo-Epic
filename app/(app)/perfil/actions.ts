"use server"

import { eq } from "drizzle-orm"
import { refresh, updateTag } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { db } from "@/db"
import { organizations } from "@/db/schema"
import { getAuth, requireSession } from "@/lib/auth/server"
import { tags } from "@/lib/cache-tags"
import type { ProfileState } from "@/lib/profile-action-state"

const profileSchema = z.object({
  name: z.string().trim().min(1, "Escribe tu nombre.").max(120, "Máximo 120 caracteres."),
  organizationName: z
    .string()
    .trim()
    .min(1, "La organización necesita un nombre.")
    .max(120, "Máximo 120 caracteres."),
})

export async function updateProfileAction(
  _previous: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const { organizationId } = await requireSession()

  const parsed = profileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form")
      errors[key] ??= issue.message
    }
    return { status: "error", message: "Revisa los campos indicados.", errors }
  }

  const [auth, client] = await Promise.all([getAuth(), db()])

  try {
    await Promise.all([
      // Por la API de Better Auth, no por Drizzle: así refresca la sesión que
      // viaja cacheada en la cookie y el nombre nuevo se ve de inmediato.
      auth.api.updateUser({ body: { name: parsed.data.name }, headers: await headers() }),
      client
        .update(organizations)
        .set({ name: parsed.data.organizationName })
        .where(eq(organizations.id, organizationId)),
    ])
  } catch {
    return { status: "error", message: "No pudimos guardar los cambios. Intenta nuevamente." }
  }

  // El nombre se ve en la barra lateral, que pinta el layout: además de
  // soltar la entrada cacheada hay que refrescar el cliente.
  updateTag(tags.organization(organizationId))
  refresh()
  return { status: "success", message: "Cambios guardados." }
}

export async function signOutAction() {
  const auth = await getAuth()
  await auth.api.signOut({ headers: await headers() })
  redirect("/sign-in")
}
