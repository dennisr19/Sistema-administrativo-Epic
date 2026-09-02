"use client"

import { IconPlus, IconTrash } from "@tabler/icons-react"

import { SelectField } from "@/components/reservations/form/select-field"
import { useEntities } from "@/components/settings/entities-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { MealLine } from "@/lib/reservation-form"

type MealLinesProps = {
  lines: MealLine[]
  pax: number
  onChange: (lines: MealLine[]) => void
}

/** Cuántas de cada opción salen con la reserva: es lo que se le pide a la cocina. */
export function MealLines({ lines, pax, onChange }: MealLinesProps) {
  const { entities } = useEntities()
  const options = entities.meals
    .filter((meal) => meal.active)
    .map((meal) => ({ value: meal.name, label: meal.name }))
  const assigned = lines.reduce((total, line) => total + (Number(line.quantity) || 0), 0)

  const update = (index: number, patch: Partial<MealLine>) =>
    onChange(lines.map((line, current) => (current === index ? { ...line, ...patch } : line)))

  return (
    <div className="grid gap-3">
      {lines.map((line, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: las líneas no tienen identidad propia
          key={index}
          className="grid grid-cols-[minmax(0,1fr)_92px_auto] items-end gap-2"
        >
          <SelectField
            id={`meal-${index}`}
            label={index === 0 ? "Opción" : ""}
            value={line.option}
            options={options}
            placeholder="Elige la opción"
            onChange={(option) => update(index, { option })}
          />
          <div className="grid gap-2">
            {index === 0 ? <Label htmlFor={`meal-qty-${index}`}>Cantidad</Label> : null}
            <Input
              id={`meal-qty-${index}`}
              type="number"
              min={1}
              inputMode="numeric"
              className="h-11 text-[15px]"
              value={String(line.quantity)}
              onChange={(event) => update(index, { quantity: Number(event.target.value) || 0 })}
            />
          </div>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={`Quitar la línea ${index + 1}`}
            onClick={() => onChange(lines.filter((_, current) => current !== index))}
          >
            <IconTrash />
          </Button>
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="outline"
          className="h-11 gap-2 px-4 text-[13px] font-medium"
          onClick={() => onChange([...lines, { option: options[0]?.value ?? "", quantity: 1 }])}
        >
          <IconPlus />
          Agregar opción
        </Button>
        <p className="text-[13px] text-muted-foreground">
          {assigned} de {pax} {pax === 1 ? "pasajero" : "pasajeros"} con alimentación
        </p>
      </div>
    </div>
  )
}
