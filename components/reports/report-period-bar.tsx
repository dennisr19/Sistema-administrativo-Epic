"use client"

import { SegmentedTabs } from "@/components/segmented-tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Preset, reportPresets } from "@/lib/report-period"

export type { Preset }

/** `custom` no es un atajo, es el resultado de elegir fechas en el calendario. */
const presets = reportPresets.filter((option) => option.value !== "custom")

type ReportPeriodBarProps = {
  preset: Preset
  onPreset: (preset: Exclude<Preset, "custom">) => void
}

export function ReportPeriodBar({ preset, onPreset }: ReportPeriodBarProps) {
  const choose = (value: string) => onPreset(value as Exclude<Preset, "custom">)

  return (
    <>
      {/* En pantallas angostas cinco pills no caben: van en un desplegable. */}
      <Select
        items={presets}
        value={preset}
        onValueChange={(value) => choose(String(value))}
        aria-label="Periodo del reporte"
      >
        <SelectTrigger className="h-11 w-full text-[15px] sm:w-[220px] xl:hidden">
          <SelectValue placeholder="Personalizado" />
        </SelectTrigger>
        <SelectContent align="start">
          {presets.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="hidden xl:block">
        <SegmentedTabs
          value={preset}
          options={presets}
          onValueChange={choose}
          ariaLabel="Periodo del reporte"
        />
      </div>
    </>
  )
}
