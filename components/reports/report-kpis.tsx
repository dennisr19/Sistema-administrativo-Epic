import type { Icon } from "@tabler/icons-react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import type { Delta } from "@/lib/report-metrics"
import { cn } from "@/lib/utils"

export type Kpi = {
  value: string
  label: string
  delta: Delta
  icon: Icon
  tone: string
}

/** Menos de dos puntos no es una tendencia, es ruido: se dice "estable". */
const FLAT = 2

function Trend({ delta }: { delta: Delta }) {
  if (delta === null) {
    return (
      <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-[12px] font-medium text-muted-foreground">
        Sin comparación
      </span>
    )
  }

  const flat = Math.abs(delta) < FLAT
  const up = delta > 0
  const Arrow = up ? IconTrendingUp : IconTrendingDown

  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[12px] font-medium tabular-nums",
        flat
          ? "bg-muted text-muted-foreground"
          : up
            ? "bg-[#d7efe1] text-[#14532d]"
            : "bg-[#fbd7d7] text-[#991b1b]",
      )}
    >
      {flat ? null : <Arrow className="size-3.5" stroke={2.4} />}
      {flat ? "Estable" : `${up ? "+" : ""}${delta}%`}
    </span>
  )
}

/** El icono lleva el color y la variación va en un chip, como en las referencias. */
export function ReportKpis({ items }: { items: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className="grid gap-3 rounded-xl bg-card px-4 py-4">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  item.tone,
                )}
              >
                <Icon className="size-[18px]" stroke={1.9} />
              </span>
              <Trend delta={item.delta} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 truncate text-[26px] leading-tight font-semibold tracking-[-0.03em] tabular-nums">
                {item.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
