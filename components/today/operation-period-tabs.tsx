import { SegmentedTabs } from "@/components/segmented-tabs"
import type { TimeRange } from "@/lib/reservation"

const periods = [
  { value: "today" as const, label: "Hoy" },
  { value: "tomorrow" as const, label: "Mañana" },
  { value: "week" as const, label: "Semana" },
]

type OperationPeriodTabsProps = {
  value: TimeRange
  onValueChange: (value: TimeRange) => void
  className?: string
  stretch?: boolean
}

export function OperationPeriodTabs(props: OperationPeriodTabsProps) {
  return <SegmentedTabs options={periods} ariaLabel="Periodo" {...props} />
}
