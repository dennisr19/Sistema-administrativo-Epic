"use client"

import { IconChevronDown } from "@tabler/icons-react"
import { type ReactNode, useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FormSectionProps = {
  title: string
  children: ReactNode
  /** Con `collapsible` la sección se puede plegar; `defaultOpen` decide cómo llega. */
  collapsible?: boolean
  defaultOpen?: boolean
  /** Resumen que se muestra cuando la sección está plegada. */
  summary?: string
}

/**
 * Superficie continua: la jerarquía la dan el espacio y el rótulo, no una card por sección.
 */
export function FormSection({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
  summary,
}: FormSectionProps) {
  const id = useId()
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="grid gap-3">
      {collapsible ? (
        // Fila completa con el chevron al extremo: se lee como plegable, no como rótulo.
        <Button
          variant="ghost"
          // Borde y fondo propios: sin ellos la fila se leía como un rótulo
          // más y nadie adivinaba que se abre.
          className="h-11 w-full justify-start gap-3 rounded-lg border border-input bg-card px-3 text-left hover:bg-muted"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((current) => !current)}
        >
          <span className="shrink-0 text-[13px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            {title}
          </span>
          {!open && summary ? (
            <span className="min-w-0 truncate text-[13px] font-normal text-muted-foreground">
              {summary}
            </span>
          ) : null}
          {/* El chevron va en su propio cuadro: es el signo de que esto abre. */}
          <span className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <IconChevronDown
              className={cn("size-[18px] transition-transform", open && "rotate-180")}
            />
          </span>
        </Button>
      ) : (
        <h2 className="text-[13px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          {title}
        </h2>
      )}

      <div id={id} className={cn("grid gap-4", collapsible && !open && "hidden")}>
        {children}
      </div>
    </section>
  )
}
