"use client"

import { EntityCombobox } from "@/components/reservations/form/entity-combobox"
import { Field } from "@/components/reservations/form/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { DraftErrors, ReservationDraft } from "@/lib/reservation-form"

type GroupProps = {
  draft: ReservationDraft
  errors: DraftErrors
  onChange: (patch: Partial<ReservationDraft>) => void
}

export function TourField({ draft, errors, onChange }: GroupProps) {
  return (
    <EntityCombobox
      id="tour"
      label="Tour"
      kind="tours"
      value={draft.tour}
      placeholder="Busca el tour"
      error={errors.tour}
      creatable={false}
      onChange={(tour) => onChange({ tour })}
    />
  )
}

export function ScheduleFields({ draft, errors, onChange }: GroupProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,180px)_minmax(0,140px)_minmax(0,140px)]">
      <Field id="date" label="Fecha" error={errors.date}>
        <Input
          id="date"
          type="date"
          className="h-11 text-[15px]"
          value={draft.date}
          aria-invalid={Boolean(errors.date)}
          onChange={(event) => onChange({ date: event.target.value })}
        />
      </Field>
      <Field id="time" label="Hora" error={errors.time}>
        <Input
          id="time"
          type="time"
          step={900}
          className="h-11 text-[15px]"
          value={draft.time}
          aria-invalid={Boolean(errors.time)}
          onChange={(event) => onChange({ time: event.target.value })}
        />
      </Field>
      <Field id="pax" label="Personas" error={errors.pax}>
        <Input
          id="pax"
          type="number"
          min={1}
          max={40}
          inputMode="numeric"
          className="h-11 text-[15px]"
          value={draft.pax}
          aria-invalid={Boolean(errors.pax)}
          onChange={(event) => onChange({ pax: event.target.value })}
        />
      </Field>
    </div>
  )
}

export function HotelField({ draft, onChange }: Omit<GroupProps, "errors">) {
  return (
    <EntityCombobox
      id="hotel"
      label="Hotel"
      kind="hotels"
      value={draft.hotel}
      placeholder="Busca o crea el hotel"
      onChange={(hotel) => onChange({ hotel })}
    />
  )
}

export function AgentField({ draft, onChange }: Omit<GroupProps, "errors">) {
  return (
    <EntityCombobox
      id="agent"
      label="Agente"
      kind="agents"
      value={draft.agent}
      placeholder="Busca o crea el agente"
      onChange={(agent) => onChange({ agent })}
    />
  )
}

export function ClientField({ draft, errors, onChange }: GroupProps) {
  return (
    <Field id="client" label="Cliente" error={errors.client}>
      <Input
        id="client"
        className="h-11 text-[15px]"
        placeholder="Nombre de quien reserva"
        value={draft.client}
        aria-invalid={Boolean(errors.client)}
        onChange={(event) => onChange({ client: event.target.value })}
      />
    </Field>
  )
}

export function PickupField({ draft, onChange }: Omit<GroupProps, "errors">) {
  return (
    <Field id="pickup" label="Punto de recogida">
      <Input
        id="pickup"
        className="h-11 text-[15px]"
        placeholder="Lobby principal"
        value={draft.pickup}
        onChange={(event) => onChange({ pickup: event.target.value })}
      />
    </Field>
  )
}

export function TeamFields({ draft, onChange }: Omit<GroupProps, "errors">) {
  return (
    <>
      <EntityCombobox
        id="guide"
        label="Guía"
        kind="guides"
        value={draft.guide}
        placeholder="Busca o crea el guía"
        emptyOption="Sin asignar"
        onChange={(guide) => onChange({ guide })}
      />
      <EntityCombobox
        id="driver"
        label="Conductor"
        kind="drivers"
        value={draft.driver}
        placeholder="Busca o crea el chofer"
        emptyOption="Sin asignar"
        onChange={(driver) => onChange({ driver })}
      />
    </>
  )
}

export function NotesField({ draft, onChange }: Omit<GroupProps, "errors">) {
  return (
    <Field
      id="notes"
      label="Notas"
      hint="Alergias, sillas de bebé, idioma del guía o cualquier cosa que el equipo deba saber."
    >
      <Textarea
        id="notes"
        className="text-[15px]"
        placeholder="Sin notas"
        value={draft.notes}
        onChange={(event) => onChange({ notes: event.target.value })}
      />
    </Field>
  )
}
