"use client"

import { IconChevronRight } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { type EntityKind, entityDefinitions } from "@/lib/entities"
import { cn } from "@/lib/utils"

type EntityNavProps = {
  kind: EntityKind
  counts: Record<EntityKind, number>
  onSelect: (kind: EntityKind) => void
  onPrefetch: (kind: EntityKind) => void
}

/** Misma gramática que la barra lateral: el activo se rellena, no se subraya. */
export function EntityNav({ kind, counts, onSelect, onPrefetch }: EntityNavProps) {
  return (
    <nav
      className="w-full shrink-0 py-2 md:h-full md:w-[228px] md:p-2.5"
      aria-label="Tipos de entidad"
    >
      <h1 className="px-4 pt-2 pb-3 text-xl font-semibold tracking-[-0.025em] md:hidden">
        Configuración
      </h1>
      {entityDefinitions.map((item) => {
        const active = item.kind === kind
        return (
          <Button
            key={item.kind}
            variant="ghost"
            className={cn(
              // En mobile es una lista con filetes; en desktop, elementos de navegación.
              "h-14 w-full justify-start gap-3 rounded-none border-b border-b-border px-4 text-left last:border-b-0 md:h-11 md:rounded-lg md:border-b-0",
              active
                ? "md:bg-sidebar-accent md:text-sidebar-accent-foreground"
                : "md:text-slate-600 md:hover:bg-sidebar-accent/60",
            )}
            aria-current={active ? "true" : undefined}
            onClick={() => onSelect(item.kind)}
            onPointerEnter={() => onPrefetch(item.kind)}
            onFocus={() => onPrefetch(item.kind)}
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-[15px]",
                active ? "font-semibold" : "font-medium md:font-normal",
              )}
            >
              {item.label}
            </span>
            <span className="shrink-0 text-[13px] font-normal text-muted-foreground tabular-nums">
              {counts[item.kind]}
            </span>
            <IconChevronRight className="shrink-0 text-muted-foreground/70 md:hidden" />
          </Button>
        )
      })}
    </nav>
  )
}
