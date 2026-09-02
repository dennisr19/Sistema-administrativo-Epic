"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type SegmentedOption<T extends string> = {
  value: T
  label: string
}

type SegmentedTabsProps<T extends string> = {
  value: T
  options: SegmentedOption<T>[]
  onValueChange: (value: T) => void
  className?: string
  /** En mobile el pill necesita 44 px reales de target táctil. */
  stretch?: boolean
  /** Táctil por debajo de `md` y compacto arriba, en una sola instancia. */
  responsive?: boolean
  ariaLabel?: string
}

export function SegmentedTabs<T extends string>({
  value,
  options,
  onValueChange,
  className,
  stretch = false,
  responsive = false,
  ariaLabel,
}: SegmentedTabsProps<T>) {
  const triggerClass = cn(
    "min-w-16 rounded-md px-4 text-foreground data-active:bg-primary! data-active:text-primary-foreground! data-active:hover:bg-primary! data-active:hover:text-primary-foreground! data-active:focus-visible:bg-primary! data-active:focus-visible:text-primary-foreground!",
    responsive ? "h-11! md:h-9!" : stretch ? "h-11!" : "h-9!",
  )

  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      className={cn(stretch || responsive ? "w-full md:w-fit" : "w-fit", className)}
      aria-label={ariaLabel}
    >
      <TabsList
        className={cn(
          // `p-1` deja el grupo en 44 con disparadores de 36: la fila del encabezado
          // mide 44 en todos sus controles y ninguno desentona.
          "gap-1 rounded-lg border border-input bg-surface-muted p-1",
          // `w-max min-w-full` deja que el grupo crezca dentro de un contenedor con scroll
          // horizontal cuando las opciones no caben, en vez de estirar la pantalla entera.
          responsive
            ? "h-14! w-full md:h-11! md:w-auto"
            : stretch
              ? "h-14! w-max min-w-full"
              : "h-11! w-auto",
        )}
      >
        {options.map((option) => (
          <TabsTrigger key={option.value} value={option.value} className={triggerClass}>
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
