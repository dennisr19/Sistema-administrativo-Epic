"use client"

import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"

type ErrorStateProps = {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Boundary compartido por `app/(app)/error.tsx` y `app/(auth)/error.tsx`. Un
 * fallo de render (D1, Better Auth, lo que sea) cae aquí en vez del error
 * genérico de Next, sin marca y sin forma de reintentar.
 */
export function ErrorState({ error, reset }: ErrorStateProps) {
  useEffect(() => {
    console.error("[error-boundary]", error)
  }, [error])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <IconAlertTriangle className="size-5" />
      </span>
      <div className="grid gap-1">
        <p className="font-semibold">Algo salió mal</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          No pudimos cargar esta pantalla. Puede ser algo pasajero, intenta de nuevo.
        </p>
      </div>
      <Button variant="secondary" className="mt-1 gap-2" onClick={reset}>
        <IconRefresh className="size-4" />
        Reintentar
      </Button>
    </div>
  )
}
