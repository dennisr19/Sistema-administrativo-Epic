"use client"

import { ExtrasTabs } from "@/components/reservations/form/extras-tabs"
import {
  AgentField,
  ClientField,
  HotelField,
  PickupField,
  ScheduleFields,
  TeamFields,
  TourField,
} from "@/components/reservations/form/field-groups"
import { FormSection } from "@/components/reservations/form/form-section"
import { PaymentFields } from "@/components/reservations/form/payment-fields"
import { StatusField } from "@/components/reservations/form/status-field"
import type { DraftErrors, ReservationDraft } from "@/lib/reservation-form"

type DesktopFieldsProps = {
  draft: ReservationDraft
  errors: DraftErrors
  onChange: (patch: Partial<ReservationDraft>) => void
}

/** Una columna: el flujo se lee de arriba abajo y entra en la pantalla. */
export function DesktopFields({ draft, errors, onChange }: DesktopFieldsProps) {
  const extrasSummary = [
    draft.tickets.length ? `${draft.tickets.length} entradas` : "",
    draft.meals.length ? "alimentación" : "",
    draft.notes.trim() ? "nota" : "",
  ]
    .filter(Boolean)
    .join(", ")

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-3 md:px-8">
      <div className="grid gap-4">
        <FormSection title="Reserva">
          <TourField draft={draft} errors={errors} onChange={onChange} />
          <ScheduleFields draft={draft} errors={errors} onChange={onChange} />
          <ClientField draft={draft} errors={errors} onChange={onChange} />
          <div className="grid gap-3 sm:grid-cols-2">
            <HotelField draft={draft} onChange={onChange} />
            <PickupField draft={draft} onChange={onChange} />
          </div>
        </FormSection>

        <FormSection
          title="Asignación y operación"
          collapsible
          defaultOpen={false}
          summary={[draft.guide || "sin guía", draft.driver || "sin chofer", draft.agent]
            .filter(Boolean)
            .join(", ")}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <TeamFields draft={draft} onChange={onChange} />
            <AgentField draft={draft} onChange={onChange} />
          </div>
        </FormSection>

        <FormSection title="Pago">
          <PaymentFields
            draft={draft}
            onChange={onChange}
            trailing={<StatusField draft={draft} onChange={onChange} />}
          />
        </FormSection>

        <FormSection
          title="Detalles adicionales"
          collapsible
          defaultOpen={false}
          summary={extrasSummary}
        >
          <ExtrasTabs draft={draft} onChange={onChange} />
        </FormSection>
      </div>
    </div>
  )
}
