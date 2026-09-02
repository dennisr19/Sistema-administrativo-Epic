"use client"

import { IconFilterOff } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

/** Lo que se ve cuando el filtro o la categoría de alerta no deja pasar nada. */
export function OperationEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <IconFilterOff className="size-5" />
      </span>
      <p className="font-semibold">Nada pendiente en esta categoría</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Cambia los filtros o vuelve a ver toda la operación.
      </p>
      <Button variant="secondary" className="mt-4" onClick={onClear}>
        Ver todas
      </Button>
    </div>
  )
}
