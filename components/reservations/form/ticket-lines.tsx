"use client"

import { IconPlus, IconTrash } from "@tabler/icons-react"

import { SelectField } from "@/components/reservations/form/select-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { TicketLine } from "@/lib/reservation-form"

type TicketLinesProps = {
  lines: TicketLine[]
  pax: number
  onChange: (lines: TicketLine[]) => void
}

const kinds = [
  { value: "adulto", label: "Adulto" },
  { value: "niño", label: "Niño" },
]

/** Las entradas al parque piden pasaporte y nombre de cada pasajero. */
export function TicketLines({ lines, pax, onChange }: TicketLinesProps) {
  const update = (index: number, patch: Partial<TicketLine>) =>
    onChange(lines.map((line, current) => (current === index ? { ...line, ...patch } : line)))

  return (
    <div className="grid gap-3">
      {lines.map((line, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: las líneas no tienen identidad propia
          key={index}
          className="grid items-end gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_130px_auto]"
        >
          <div className="grid gap-2">
            {index === 0 ? <Label htmlFor={`ticket-name-${index}`}>Nombre</Label> : null}
            <Input
              id={`ticket-name-${index}`}
              className="h-11 text-[15px]"
              placeholder="Como aparece en el pasaporte"
              value={line.name}
              onChange={(event) => update(index, { name: event.target.value })}
            />
          </div>
          <div className="grid gap-2">
            {index === 0 ? <Label htmlFor={`ticket-passport-${index}`}>Pasaporte</Label> : null}
            <Input
              id={`ticket-passport-${index}`}
              className="h-11 text-[15px]"
              value={line.passport}
              onChange={(event) => update(index, { passport: event.target.value })}
            />
          </div>
          <SelectField
            id={`ticket-kind-${index}`}
            label={index === 0 ? "Tipo" : ""}
            value={line.kind}
            options={kinds}
            onChange={(kind) => update(index, { kind: kind as TicketLine["kind"] })}
          />
          <Button
            variant="ghost"
            size="icon-lg"
            className="justify-self-end"
            aria-label={`Quitar la entrada ${index + 1}`}
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
          onClick={() => onChange([...lines, { passport: "", name: "", kind: "adulto" }])}
        >
          <IconPlus />
          Agregar entrada
        </Button>
        <p className="text-[13px] text-muted-foreground">
          {lines.length} de {pax} {pax === 1 ? "pasajero" : "pasajeros"} con entrada
        </p>
      </div>
    </div>
  )
}
