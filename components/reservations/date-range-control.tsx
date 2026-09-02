"use client"

import { IconCalendar, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RangeCalendar } from "@/components/ui/range-calendar"
import { parseIso, rangeLabel, toIso } from "@/lib/calendar"

type DateRangeControlProps = {
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
}

const DAY = 86_400_000

/** Mueve el rango completo, tantos días como dure. Sin rango no hay a dónde ir. */
function step(from: string, to: string, direction: 1 | -1) {
  if (!from || !to) return null
  const start = parseIso(from).getTime()
  const end = parseIso(to).getTime()
  const length = end - start + DAY
  return {
    from: toIso(new Date(start + direction * length)),
    to: toIso(new Date(end + direction * length)),
  }
}

export function DateRangeControl({ from, to, onChange }: DateRangeControlProps) {
  const [open, setOpen] = useState(false)
  const movable = Boolean(from && to)

  const move = (direction: 1 | -1) => {
    const next = step(from, to, direction)
    if (next) onChange(next)
  }

  return (
    <div className="flex h-11 items-center rounded-lg border border-input bg-card">
      <Button
        variant="ghost"
        size="icon-lg"
        className="rounded-md"
        disabled={!movable}
        onClick={() => move(-1)}
        aria-label="Periodo anterior"
      >
        <IconChevronLeft />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="ghost"
              className="h-11 gap-2 rounded-md px-3 text-[15px] font-medium"
              aria-label={`Rango de fechas, ${rangeLabel(from, to)}`}
            >
              <IconCalendar className="size-[18px] text-muted-foreground" />
              {rangeLabel(from, to)}
            </Button>
          }
        />
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-4">
          <RangeCalendar
            from={from}
            to={to}
            onChange={(range) => {
              onChange(range)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon-lg"
        className="rounded-md"
        disabled={!movable}
        onClick={() => move(1)}
        aria-label="Periodo siguiente"
      >
        <IconChevronRight />
      </Button>
    </div>
  )
}
