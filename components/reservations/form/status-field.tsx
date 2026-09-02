"use client"

import { SelectField } from "@/components/reservations/form/select-field"
import type { ReservationStatus } from "@/lib/reservation"
import type { ReservationDraft } from "@/lib/reservation-form"

const statuses = [
  { value: "confirmed", label: "Confirmada" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
]

export function StatusField({
  draft,
  onChange,
}: {
  draft: ReservationDraft
  onChange: (patch: Partial<ReservationDraft>) => void
}) {
  return (
    <div className="sm:max-w-[240px]">
      <SelectField
        id="status"
        label="Estado de la reserva"
        value={draft.status}
        options={statuses}
        onChange={(status) => onChange({ status: status as ReservationStatus })}
      />
    </div>
  )
}
