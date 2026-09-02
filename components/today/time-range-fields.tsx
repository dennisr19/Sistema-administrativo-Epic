"use client"

import { FilterSection } from "@/components/filter-section"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TimeRangeFieldsProps = {
  startTime: string
  endTime: string
  invalid: boolean
  onChange: (times: { startTime: string; endTime: string }) => void
}

export function TimeRangeFields({ startTime, endTime, invalid, onChange }: TimeRangeFieldsProps) {
  return (
    <FilterSection
      title="Horario"
      hint="Deja un campo vacío para no limitar ese extremo."
      onClear={startTime || endTime ? () => onChange({ startTime: "", endTime: "" }) : undefined}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="start-time">Desde</Label>
          <Input
            id="start-time"
            type="time"
            step={900}
            value={startTime}
            aria-invalid={invalid}
            className="h-11 text-[15px]"
            onChange={(event) => onChange({ startTime: event.target.value, endTime })}
          />
        </div>
        <div className="grid min-w-0 gap-2">
          <Label htmlFor="end-time">Hasta</Label>
          <Input
            id="end-time"
            type="time"
            step={900}
            value={endTime}
            aria-invalid={invalid}
            className="h-11 text-[15px]"
            onChange={(event) => onChange({ startTime, endTime: event.target.value })}
          />
        </div>
      </div>
      {invalid ? (
        <p className="text-[13px] font-medium text-destructive">
          La hora inicial debe ser anterior a la final.
        </p>
      ) : null}
    </FilterSection>
  )
}
