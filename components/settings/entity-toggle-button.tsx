"use client"

import { IconPower } from "@tabler/icons-react"
import { useState, useTransition } from "react"

import { toggleEntityAction } from "@/app/(app)/configuracion/actions"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { EntityKind } from "@/lib/entities"
import { initialEntityActionState } from "@/lib/entity-action-state"

type EntityToggleButtonProps = {
  kind: EntityKind
  id: string
  name: string
  active: boolean
  compact?: boolean
}

export function EntityToggleButton({
  kind,
  id,
  name,
  active,
  compact = false,
}: EntityToggleButtonProps) {
  const [pending, startTransition] = useTransition()
  const [state, setState] = useState(initialEntityActionState)
  const toast = useToast()
  const label = `${active ? "Desactivar" : "Activar"} ${name}`

  // El cambio de estado (activo/inactivo) ya se ve solo en el propio botón:
  // no hace falta un toast de éxito. El error sí, porque hoy solo se avisaba
  // por aria-live, invisible para quien no usa lector de pantalla.
  const action = (formData: FormData) => {
    startTransition(async () => {
      const result = await toggleEntityAction(state, formData)
      if (result.status === "error") {
        toast.add({ type: "error", title: result.message ?? "No pudimos cambiar el estado." })
      }
      setState(result)
    })
  }

  const button = (
    <Button
      type="submit"
      variant="ghost"
      size={compact ? "icon-lg" : "default"}
      className={compact ? undefined : "h-11 px-3 text-[13px] font-medium"}
      disabled={pending}
      aria-label={label}
    >
      {compact ? <IconPower /> : pending ? "Guardando…" : active ? "Desactivar" : "Activar"}
    </Button>
  )

  return (
    <form action={action}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      {compact ? (
        <Tooltip>
          <TooltipTrigger render={button} />
          <TooltipContent>{active ? "Desactivar" : "Activar"}</TooltipContent>
        </Tooltip>
      ) : (
        button
      )}
    </form>
  )
}
