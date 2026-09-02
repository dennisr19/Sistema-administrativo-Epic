"use client"

import { useState } from "react"

import { InlineSubmit } from "@/components/auth/inline-submit"
import { Input } from "@/components/ui/input"

/**
 * Un solo campo, no seis cajas: pegar el código del correo tiene que funcionar
 * de una, y el teclado numérico en móvil sale del `inputMode`.
 */
export function CodeField({ error, pending }: { error?: string; pending: boolean }) {
  const [value, setValue] = useState("")

  return (
    <div className="grid gap-2">
      <div className="relative">
        <Input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          required
          autoFocus
          aria-label="Código de 6 dígitos"
          value={value}
          // Solo dígitos: pegar "123 456" o "código: 123456" no debería fallar.
          onChange={(event) => setValue(event.target.value.replace(/\D/g, "").slice(0, 6))}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "code-error" : undefined}
          className="h-14 bg-card pr-14 pl-14 text-center text-[24px] font-semibold tracking-[0.28em] tabular-nums"
        />
        <InlineSubmit pending={pending} label="Entrar" />
      </div>
      {error ? (
        <p id="code-error" className="px-1 text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
