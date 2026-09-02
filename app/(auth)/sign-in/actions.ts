"use server"

import { APIError } from "better-auth/api"
import { redirect } from "next/navigation"
import { z } from "zod"

import { getAuth } from "@/lib/auth/server"

export type SignInState = {
  step: "email" | "code"
  email: string
  error?: string
}

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Escribe un correo válido."),
})

const codeSchema = emailSchema.extend({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "El código son 6 dígitos."),
})

/**
 * Se responde igual exista o no la cuenta. Decir cuáles correos están
 * registrados convertiría esta pantalla en un directorio de usuarios.
 */
export async function requestCodeAction(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = emailSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return {
      step: "email",
      email: String(formData.get("email") ?? ""),
      error: parsed.error.issues[0].message,
    }
  }

  const auth = await getAuth()
  try {
    await auth.api.sendVerificationOTP({
      body: { email: parsed.data.email, type: "sign-in" },
    })
  } catch (error) {
    if (!(error instanceof APIError)) throw error
  }

  return { step: "code", email: parsed.data.email }
}

export async function verifyCodeAction(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = codeSchema.safeParse(Object.fromEntries(formData))
  const email = String(formData.get("email") ?? "")
  if (!parsed.success) {
    return { step: "code", email, error: parsed.error.issues[0].message }
  }

  const auth = await getAuth()
  try {
    await auth.api.signInEmailOTP({
      body: { email: parsed.data.email, otp: parsed.data.code },
    })
  } catch (error) {
    if (error instanceof APIError) {
      return { step: "code", email, error: "El código no es válido o ya venció." }
    }
    throw error
  }

  redirect("/")
}
