"use client"

import { DateRangeControl } from "@/components/reservations/date-range-control"
import { EntityCombobox } from "@/components/reservations/form/entity-combobox"
import { SegmentedTabs } from "@/components/segmented-tabs"
import { Label } from "@/components/ui/label"
import { type SettlementFilters, type SettlementKind, settlementKindLabels } from "@/lib/settlement"

type SettlementControlsProps = {
  filters: SettlementFilters
  onChange: (patch: Partial<SettlementFilters>) => void
}

const kinds = (Object.keys(settlementKindLabels) as SettlementKind[]).map((value) => ({
  value,
  label: settlementKindLabels[value],
}))

/** A quién se liquida y qué periodo: es todo lo que hace falta elegir. */
export function SettlementControls({ filters, onChange }: SettlementControlsProps) {
  return (
    <div className="grid gap-4 rounded-xl bg-card p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-end md:p-5">
      <div className="grid gap-2">
        <Label>Liquidar a</Label>
        <SegmentedTabs
          value={filters.kind}
          options={kinds}
          responsive
          ariaLabel="Liquidar a"
          // Cambiar de agente a guía deja la persona vacía: los nombres no se comparten.
          onValueChange={(kind) => onChange({ kind, name: "" })}
        />
      </div>
      {/* Con búsqueda: hay decenas de agentes y se llega más rápido escribiendo. */}
      <EntityCombobox
        key={filters.kind}
        id="liquidacion-persona"
        label={settlementKindLabels[filters.kind]}
        kind={filters.kind === "agent" ? "agents" : "guides"}
        value={filters.name}
        placeholder={filters.kind === "agent" ? "Busca el agente" : "Busca el guía"}
        creatable={false}
        onChange={(name) => onChange({ name })}
      />
      <div className="grid gap-2">
        <Label>Fechas</Label>
        <DateRangeControl
          from={filters.from}
          to={filters.to}
          onChange={(range) => onChange(range)}
        />
      </div>
    </div>
  )
}
