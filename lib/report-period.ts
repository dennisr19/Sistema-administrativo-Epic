import { daysBack, monthRange, shiftMonth } from "@/lib/report-metrics"
import { operationToday } from "@/lib/today"

export type Preset = "month" | "previous" | "quarter" | "year" | "custom"

export const reportPresets: { value: Preset; label: string }[] = [
  { value: "month", label: "Este mes" },
  { value: "previous", label: "Mes pasado" },
  { value: "quarter", label: "90 días" },
  { value: "year", label: "Este año" },
  { value: "custom", label: "Personalizado" },
]

/** Lo usa el servidor para resolver el periodo y el cliente para proponerlo. */
export function rangeOf(preset: Exclude<Preset, "custom">) {
  const today = operationToday()
  if (preset === "month") return monthRange(today)
  if (preset === "previous") return shiftMonth(today, -1)
  if (preset === "quarter") return daysBack(today, 90)
  return { from: `${today.slice(0, 4)}-01-01`, to: today }
}
