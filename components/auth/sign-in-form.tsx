"use client"

import { IconArrowLeft, IconRefresh } from "@tabler/icons-react"
import { useActionState, useState } from "react"

import { requestCodeAction, type SignInState, verifyCodeAction } from "@/app/(auth)/sign-in/actions"
import { AppMark } from "@/components/app-logo"
import { CodeField } from "@/components/auth/code-field"
import { InlineSubmit } from "@/components/auth/inline-submit"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const initial: SignInState = { step: "email", email: "" }

export function SignInForm({ notice }: { notice?: string }) {
  const [emailState, requestCode, requesting] = useActionState(requestCodeAction, initial)
  const [codeState, verifyCode, verifying] = useActionState(verifyCodeAction, initial)

  // Volver a escribir el correo es una decisión local: no hay que pedirle nada
  // al servidor para corregir un tecleo.
  const [changingEmail, setChangingEmail] = useState(false)
  const onCodeStep = emailState.step === "code" && !changingEmail
  const email = codeState.email || emailState.email
  const error = onCodeStep ? codeState.error : emailState.error

  return (
    <div className="grid w-full max-w-[400px] gap-8">
      <div className="grid justify-items-center gap-5 text-center">
        {/* Solo la marca: el nombre lo dice el titular, no hace falta dos veces. */}
        <AppMark large />
        <div className="grid gap-2">
          <h1 className="text-[28px] font-semibold tracking-[-0.035em]">
            {onCodeStep ? "Revisa tu correo" : "Entra a epic-ops"}
          </h1>
          {/* Esta línea no desaparece al escribir, así que hace de instrucción
              permanente y el campo puede ir sin rótulo encima. */}
          <p className="text-[15px] text-muted-foreground text-balance">
            {onCodeStep
              ? `Escribe el código de 6 dígitos que enviamos a ${email}`
              : "Te enviamos un código y entras sin contraseña."}
          </p>
        </div>
      </div>

      {onCodeStep ? (
        // Dos formularios hermanos, nunca anidados: reenviar es otra acción.
        <div className="grid gap-4">
          <form action={verifyCode}>
            <input type="hidden" name="email" value={email} />
            <CodeField error={error} pending={verifying} />
          </form>

          <div className="grid grid-cols-2 gap-2">
            {/* La flecha es de volver y el círculo de reenviar: cada acción con su signo. */}
            <Button
              type="button"
              variant="ghost"
              className="h-11 gap-2 px-2 font-normal text-muted-foreground"
              onClick={() => setChangingEmail(true)}
            >
              <IconArrowLeft className="size-[18px] shrink-0" />
              <span className="min-w-0 truncate">Otro correo</span>
            </Button>

            <form action={requestCode}>
              <input type="hidden" name="email" value={email} />
              <Button
                type="submit"
                variant="ghost"
                className="h-11 w-full gap-2 px-2 font-normal text-muted-foreground"
                disabled={requesting}
              >
                <IconRefresh className="size-[18px] shrink-0" />
                <span className="min-w-0 truncate">
                  {requesting ? "Enviando" : "Reenviar código"}
                </span>
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <form action={requestCode} onSubmit={() => setChangingEmail(false)}>
          <div className="grid gap-2">
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="tu@correo.com"
                defaultValue={email}
                required
                autoFocus
                aria-label="Correo"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "email-error" : undefined}
                className="h-14 bg-card pr-14 pl-5 text-[16px]"
              />
              <InlineSubmit pending={requesting} label="Enviar código" />
            </div>
            {error ? (
              <p id="email-error" className="px-1 text-[13px] text-destructive">
                {error}
              </p>
            ) : null}
          </div>
        </form>
      )}

      {notice ? (
        <p className="rounded-xl bg-surface-muted px-4 py-3 text-center text-[13px] text-muted-foreground">
          {notice}
        </p>
      ) : null}
    </div>
  )
}
