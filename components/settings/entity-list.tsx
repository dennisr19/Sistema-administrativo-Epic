"use client"

import { IconPencil } from "@tabler/icons-react"

import { EntityStateBadge } from "@/components/settings/entity-state-badge"
import { EntityToggleButton } from "@/components/settings/entity-toggle-button"
import { Button } from "@/components/ui/button"
import {
  displayValue,
  type EntityDefinition,
  type EntityKind,
  type EntityRecord,
} from "@/lib/entities"

type EntityListProps = {
  definition: EntityDefinition
  kind: EntityKind
  records: EntityRecord[]
  usage: (record: EntityRecord) => number
  /** Marca el cambio de estado como optimista antes de que el servidor conteste. */
  onToggle: (id: string) => void
  onEdit: (record: EntityRecord) => void
}

/** La versión mobile de la tabla: mismos datos, apilados. */
export function EntityList({
  definition,
  kind,
  records,
  usage,
  onEdit,
  onToggle,
}: EntityListProps) {
  return (
    <ul className="min-[1400px]:hidden">
      {records.map((record) => {
        const used = definition.usageKey ? usage(record) : 0
        // Sin encabezados de tabla, un valor suelto como "B3" no dice nada: va con su etiqueta.
        const details = definition.fields
          .slice(1)
          .map((field) => ({ label: field.label, value: displayValue(record, field) }))
          .filter((detail) => detail.value)

        return (
          <li key={record.id} className="border-b px-4 py-3.5 last:border-b-0">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">{record.name}</p>
                {/* Separación por layout: el HTML colapsa espacios y no usamos glifos. */}
                <p className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-0.5 text-[13px]">
                  {details.map((detail) => (
                    <span key={detail.label} className="flex items-baseline gap-1.5">
                      <span className="text-muted-foreground">{detail.label}</span>
                      <span className="text-foreground">{detail.value}</span>
                    </span>
                  ))}
                  {definition.usageKey ? (
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-muted-foreground">Reservas</span>
                      <span className="text-foreground tabular-nums">{used}</span>
                    </span>
                  ) : null}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-lg"
                className="shrink-0"
                aria-label={`Editar ${record.name}`}
                onClick={() => onEdit(record)}
              >
                <IconPencil />
              </Button>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-3">
              <EntityStateBadge active={record.active} />
              <EntityToggleButton
                onToggle={onToggle}
                kind={kind}
                id={record.id}
                name={record.name}
                active={record.active}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
