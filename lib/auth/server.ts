import "server-only"

import { getCloudflareContext } from "@opennextjs/cloudflare"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { db } from "@/db"
import { createAuth } from "@/lib/auth/config"
import { sendOtpEmail } from "@/lib/auth/email"

/** Una sola instancia por request: `cache` evita reconstruirla en cada capa. */
export const getAuth = cache(async () => {
  const [{ env }, database] = await Promise.all([getCloudflareContext({ async: true }), db()])

  return createAuth({
    database,
    secret: env.BETTER_AUTH_SECRET,
    baseUrl: env.BETTER_AUTH_URL || undefined,
    sendOtp: (to, code) =>
      sendOtpEmail({ to, code, from: env.RESEND_FROM, apiKey: env.RESEND_API_KEY, minutes: 10 }),
  })
})

/** La sesión del request, o `null`. Se resuelve una sola vez por render. */
export const getSession = cache(async () => {
  const auth = await getAuth()
  return auth.api.getSession({ headers: await headers() })
})

export type ActiveSession = {
  userId: string
  organizationId: string
  name: string
  email: string
}

/**
 * Toda lectura y toda escritura pasa por aquí. Las Server Actions son
 * endpoints públicos, así que cada una revalida por su cuenta: el middleware
 * solo cubre navegaciones.
 */
export async function requireSession(): Promise<ActiveSession> {
  const session = await getSession()
  if (!session) redirect("/sign-in")

  const { organizationId, id, name, email } = session.user
  // Una cuenta sin organización no puede operar nada; se trata como sin sesión.
  if (!organizationId) redirect("/sign-in?error=sin-organizacion")

  return { userId: id, organizationId, name, email }
}
