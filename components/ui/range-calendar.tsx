"use client"

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MonthGrid } from "@/components/ui/month-grid"
import { parseIso, shiftMonths, toIso } from "@/lib/calendar"

type RangeCalendarProps = {
  from: string
  to: string
  onChange: (range: { from: string; to: string }) => void
}

/**
 * Dos meses en desktop, uno en móvil. El primer clic fija un extremo y el
 * segundo cierra el rango; si se elige al revés, se ordena solo.
 */
export function RangeCalendar({ from, to, onChange }: RangeCalendarProps) {
  const anchor = from ? parseIso(from) : new Date()
  const [cursor, setCursor] = useState({
    year: anchor.getUTCFullYear(),
    month: anchor.getUTCMonth(),
  })
  // `null` cuando el rango está cerrado; con valor, se está eligiendo el otro extremo.
  const [pending, setPending] = useState<string | null>(null)
  const [preview, setPreview] = useState("")

  const next = shiftMonths(cursor.year, cursor.month, 1)

  const pick = (iso: string) => {
    if (pending === null) {
      setPending(iso)
      setPreview(iso)
      return
    }
    const [start, close] = iso < pending ? [iso, pending] : [pending, iso]
    setPending(null)
    setPreview("")
    onChange({ from: start, to: close })
  }

  const move = (delta: number) => setCursor(shiftMonths(cursor.year, cursor.month, delta))

  return (
    <div className="grid gap-4">
      <div className="relative grid gap-6 sm:grid-cols-2">
        <Button
          variant="ghost"
          size="icon-lg"
          className="absolute top-0 left-0"
          onClick={() => move(-1)}
          aria-label="Mes anterior"
        >
          <IconChevronLeft />
        </Button>

        <MonthGrid
          {...cursor}
          from={pending ?? from}
          to={pending ? "" : to}
          preview={preview}
          onPick={pick}
          onHover={setPreview}
        />
        <div className="hidden sm:block">
          <MonthGrid
            {...next}
            from={pending ?? from}
            to={pending ? "" : to}
            preview={preview}
            onPick={pick}
            onHover={setPreview}
          />
        </div>

        <Button
          variant="ghost"
          size="icon-lg"
          className="absolute top-0 right-0"
          onClick={() => move(1)}
          aria-label="Mes siguiente"
        >
          <IconChevronRight />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-3">
        <Button
          variant="ghost"
          className="h-11 px-3 text-[13px] font-semibold text-secondary-foreground"
          onClick={() => {
            setPending(null)
            setPreview("")
            onChange({ from: "", to: "" })
          }}
        >
          Todo el historial
        </Button>
        <Button
          variant="ghost"
          className="h-11 px-3 text-[13px] font-medium text-muted-foreground"
          onClick={() => {
            const today = toIso(new Date())
            setPending(null)
            setPreview("")
            onChange({ from: today, to: today })
          }}
        >
          Hoy
        </Button>
      </div>
    </div>
  )
}
