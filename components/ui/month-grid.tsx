"use client"

import { type CalendarDay, monthGrid, monthTitle, weekdays } from "@/lib/calendar"
import { cn } from "@/lib/utils"

type MonthGridProps = {
  year: number
  month: number
  from: string
  to: string
  /** Se pinta mientras se elige el segundo extremo, sin haberlo confirmado. */
  preview: string
  onPick: (iso: string) => void
  onHover: (iso: string) => void
}

const isBetween = (iso: string, from: string, to: string) =>
  Boolean(from && to && iso > from && iso < to)

export function MonthGrid({ year, month, from, to, preview, onPick, onHover }: MonthGridProps) {
  // Mientras se elige el segundo día, el rango que se pinta usa el día bajo el cursor.
  const end = to || preview
  const [start, close] = from && end && end < from ? [end, from] : [from, end]

  return (
    <div className="min-w-0">
      <p className="mb-3 text-center text-[15px] font-semibold tracking-[-0.01em]">
        {monthTitle(year, month)}
      </p>

      <div className="grid grid-cols-7 gap-y-1">
        {weekdays.map((weekday) => (
          <span
            key={weekday.key}
            aria-hidden
            className="pb-1 text-center text-[12px] font-medium text-muted-foreground"
          >
            {weekday.initial}
          </span>
        ))}

        {monthGrid(year, month).map((day: CalendarDay) => {
          const selected = day.iso === start || day.iso === close
          const inside = isBetween(day.iso, start, close)

          return (
            <button
              key={day.iso}
              type="button"
              // Los días de relleno se muestran para no romper la rejilla, pero no se eligen.
              disabled={!day.inMonth}
              onClick={() => onPick(day.iso)}
              onMouseEnter={() => onHover(day.iso)}
              className={cn(
                "mx-auto flex size-9 items-center justify-center rounded-full text-[13px] tabular-nums transition-colors",
                !day.inMonth && "invisible",
                selected && "bg-primary font-semibold text-primary-foreground",
                !selected && inside && "bg-secondary text-secondary-foreground",
                !selected && !inside && "hover:bg-muted",
              )}
              aria-pressed={selected}
            >
              {day.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
