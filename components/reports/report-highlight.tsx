import { IconMinus, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import type { Narrative } from "@/lib/report-narrative"
import { cn } from "@/lib/utils"

const icons = { up: IconTrendingUp, down: IconTrendingDown, flat: IconMinus }

/** El titular del periodo. Las cifras se destacan; el resto es lectura corrida. */
export function ReportHighlight({ narrative }: { narrative: Narrative }) {
  const Icon = icons[narrative.trend]

  return (
    <section className="flex gap-3.5 rounded-xl bg-card px-5 py-4 sm:gap-4">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          narrative.trend === "down"
            ? "bg-[#f8dfe2] text-[#7a2233]"
            : "bg-secondary text-secondary-foreground",
        )}
      >
        <Icon className="size-5" />
      </span>

      <p className="max-w-2xl text-[17px] leading-relaxed tracking-[-0.01em] text-balance">
        {narrative.parts.map((part, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: las piezas son posicionales
            key={index}
            className={cn(
              part.emphasis === "up" && "font-semibold text-secondary-foreground tabular-nums",
              part.emphasis === "down" && "font-semibold text-destructive tabular-nums",
              part.emphasis === "neutral" && "font-semibold",
            )}
          >
            {part.text}
          </span>
        ))}
      </p>
    </section>
  )
}
