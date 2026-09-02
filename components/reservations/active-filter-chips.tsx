import { IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { formatDate, formatRange } from "@/lib/format-date"
import { pendingLabels, type ReservationFilters, statusOptions } from "@/lib/reservation-filters"
import { cn } from "@/lib/utils"

type ActiveFilterChipsProps = {
  filters: ReservationFilters
  onClear: (patch: Partial<ReservationFilters>) => void
}

function Chip({
  label,
  onClear,
  className,
}: {
  label: string
  onClear: () => void
  className?: string
}) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-9 w-fit shrink-0 gap-1.5 bg-secondary px-3 text-[13px] font-medium text-secondary-foreground hover:bg-secondary",
        className,
      )}
      onClick={onClear}
      aria-label={`Quitar el filtro ${label}`}
    >
      {label}
      <IconX className="size-4" />
    </Button>
  )
}

/** Deja visibles fuera del sheet los filtros que llegan por enlace y ahí se olvidan. */
export function ActiveFilterChips({ filters, onClear }: ActiveFilterChipsProps) {
  const { from, to, pending, status } = filters
  if (!from && !to && pending === "all" && status === "all") return null

  const rangeLabel =
    from && to
      ? formatRange(from, to)
      : from
        ? `Desde ${formatDate(from).label} ${formatDate(from).year}`
        : `Hasta ${formatDate(to).label} ${formatDate(to).year}`

  return (
    <div className="flex flex-wrap items-center gap-2">
      {from || to ? (
        <Chip label={rangeLabel} onClear={() => onClear({ from: "", to: "" })} />
      ) : null}
      {pending !== "all" ? (
        <Chip label={pendingLabels[pending]} onClear={() => onClear({ pending: "all" })} />
      ) : null}
      {/* En desktop el estado ya se ve en el segmentado; el chip sería redundante. */}
      {status !== "all" ? (
        <Chip
          className="md:hidden"
          label={statusOptions.find((option) => option.value === status)?.label ?? ""}
          onClear={() => onClear({ status: "all" })}
        />
      ) : null}
    </div>
  )
}
