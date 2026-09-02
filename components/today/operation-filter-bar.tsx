"use client"

import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react"

import { ExportMenu } from "@/components/export-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { countActiveFilters, type OperationFilters } from "@/lib/operation-filters"

type OperationFilterBarProps = {
  filters: OperationFilters
  onChange: (filters: OperationFilters) => void
  onOpen: () => void
}

export function OperationFilterBar({ filters, onChange, onOpen }: OperationFilterBarProps) {
  const activeCount = countActiveFilters(filters)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="relative min-w-0">
        <IconSearch className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          className="h-11 bg-white pr-4 pl-12 text-[15px]"
          placeholder="Buscar reserva, cliente u hotel"
          aria-label="Buscar reservas"
        />
      </div>

      <Button
        variant="outline"
        className="size-11 px-0 sm:w-auto sm:px-4.5"
        onClick={onOpen}
        aria-label="Filtros"
      >
        <IconAdjustmentsHorizontal />
        <span className="hidden sm:inline">Filtros</span>
        {activeCount ? (
          <Badge className="size-5 justify-center rounded-full p-0 text-[11px]">
            {activeCount}
          </Badge>
        ) : null}
      </Button>

      <div className="md:hidden">
        <ExportMenu kind="hoy" />
      </div>
    </div>
  )
}
