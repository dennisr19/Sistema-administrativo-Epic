"use client"

import { useEntityOptions } from "@/components/settings/use-entity-options"
import { FilterSelectField } from "@/components/today/filter-select-field"
import type { EntityFilters } from "@/lib/filter-options"

type EntityFilterFieldsProps = {
  /** Prefijo del id: las dos pantallas pueden montar estos campos a la vez. */
  scope: string
  filters: EntityFilters
  onChange: (patch: Partial<EntityFilters>) => void
}

export function EntityFilterFields({ scope, filters, onChange }: EntityFilterFieldsProps) {
  const { filters: options } = useEntityOptions()

  return (
    <>
      <FilterSelectField
        id={`${scope}-tour`}
        label="Tour"
        value={filters.tour}
        options={options.tour}
        onChange={(tour) => onChange({ tour })}
      />
      <FilterSelectField
        id={`${scope}-hotel`}
        label="Hotel"
        value={filters.hotel}
        options={options.hotel}
        onChange={(hotel) => onChange({ hotel })}
      />
      <FilterSelectField
        id={`${scope}-guide`}
        label="Guía"
        value={filters.guide}
        options={options.guide}
        onChange={(guide) => onChange({ guide })}
      />
      <FilterSelectField
        id={`${scope}-agent`}
        label="Agente"
        value={filters.agent}
        options={options.agent}
        onChange={(agent) => onChange({ agent })}
      />
    </>
  )
}
