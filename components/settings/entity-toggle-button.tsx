"use client"

import { IconPower } from "@tabler/icons-react"
import { useActionState } from "react"

import { toggleEntityAction } from "@/app/(app)/configuracion/actions"
import { Button } from "@/components/ui/button"
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
  const [state, action, pending] = useActionState(toggleEntityAction, initialEntityActionState)
  const label = `${active ? "Desactivar" : "Activar"} ${name}`

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
      <span className="sr-only" aria-live="polite">
        {state.status === "error" ? state.message : ""}
      </span>
    </form>
  )
}
