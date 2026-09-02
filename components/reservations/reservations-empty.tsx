"use client"

import { IconSearchOff } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

/** Lo que se ve cuando el filtro no deja pasar nada. */
export function ReservationsEmpty({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <IconSearchOff className="size-5" />
      </span>
      <p className="font-semibold">Ninguna reserva coincide</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Prueba con otro término, amplía el rango de fechas o quita los filtros activos.
      </p>
      <Button variant="secondary" className="mt-4" onClick={onClear}>
        Ver todo el historial
      </Button>
    </div>
  )
}
