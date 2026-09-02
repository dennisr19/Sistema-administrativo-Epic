import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"

import type { Database } from "@/db"
import { schema } from "@/db"

/** Cuánto dura la sesión antes de volver a pedir un código. */
const SESSION_DAYS = 30
/** Ventana de vida del código de un solo uso. */
const OTP_MINUTES = 10

type AuthOptions = {
  database: Database
  secret: string
  /** Sin valor, se deriva del request. Sobrevive a que cambie el dominio. */
  baseUrl?: string
  sendOtp: (email: string, otp: string) => Promise<void>
}

/**
 * La instancia depende del cliente D1 del request, así que se construye por
 * request desde `lib/auth/server.ts`, no como singleton de módulo.
 */
export function createAuth({ database, secret, baseUrl, sendOtp }: AuthOptions) {
  return betterAuth({
    database: drizzleAdapter(database, { provider: "sqlite", schema }),
    secret,
    ...(baseUrl ? { baseURL: baseUrl } : {}),
    session: {
      expiresIn: SESSION_DAYS * 24 * 60 * 60,
      // Sin caché en cookie a propósito: con ella, editar tu nombre tardaba una
      // navegación en verse. La lectura de sesión es una consulta por índice.
      cookieCache: { enabled: false },
    },
    advanced: {
      ipAddress: {
        // En Cloudflare la IP real del cliente llega aquí. Sin esto, el límite
        // de intentos cae en un balde compartido y deja de proteger.
        ipAddressHeaders: ["cf-connecting-ip"],
      },
    },
    // El operador entra con su correo y un código. Sin contraseñas que recordar.
    emailAndPassword: { enabled: false },
    user: {
      additionalFields: {
        organizationId: { type: "string", required: false, input: false },
      },
    },
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: OTP_MINUTES * 60,
        allowedAttempts: 5,
        // Nadie se da de alta solo: las cuentas se crean desde adentro.
        disableSignUp: true,
        async sendVerificationOTP({ email, otp }) {
          await sendOtp(email, otp)
        },
      }),
      // Siempre al final: deja que las Server Actions escriban la cookie de sesión.
      nextCookies(),
    ],
  })
}

export type Auth = ReturnType<typeof createAuth>
