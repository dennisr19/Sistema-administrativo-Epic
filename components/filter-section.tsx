import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

type FilterSectionProps = {
  title: string
  hint?: string
  children: ReactNode
  /** Se ofrece solo cuando hay algo que limpiar en esta sección. */
  onClear?: () => void
}

/** Mismo rótulo que las secciones del formulario de reserva: una sola voz. */
export function FilterSection({ title, hint, children, onClear }: FilterSectionProps) {
  return (
    <section className="grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            {title}
          </h3>
          {hint ? <p className="mt-1 text-[13px] text-muted-foreground">{hint}</p> : null}
        </div>
        {onClear ? (
          <Button
            type="button"
            variant="ghost"
            className="-mt-2 h-11 shrink-0 px-3 text-[13px] font-semibold text-secondary-foreground hover:text-secondary-foreground"
            onClick={onClear}
          >
            Limpiar
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  )
}
