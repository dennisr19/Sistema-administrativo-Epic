"use client"

import type { ReactNode } from "react"

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
import { PaymentFields } from "@/components/reservations/form/payment-fields"
import { ReviewStep } from "@/components/reservations/form/review-step"
import { StatusField } from "@/components/reservations/form/status-field"
import type { DraftErrors, ReservationDraft } from "@/lib/reservation-form"

/** En mobile no se apila el desktop: se recorre el flujo qué, cuándo, dónde, quién, dinero. */
export const stepTitles = [
  "Tour y salida",
  "Cliente y recogida",
  "Asignación",
  "Pago",
  "Detalles",
  "Revisar",
]

type WizardStepsProps = {
  draft: ReservationDraft
  errors: DraftErrors
  onChange: (patch: Partial<ReservationDraft>) => void
}

export function wizardSteps({ draft, errors, onChange }: WizardStepsProps): ReactNode[] {
  return [
    <div key="tour" className="grid gap-4">
      <TourField draft={draft} errors={errors} onChange={onChange} />
      <ScheduleFields draft={draft} errors={errors} onChange={onChange} />
    </div>,
    <div key="client" className="grid gap-4">
      <ClientField draft={draft} errors={errors} onChange={onChange} />
      <HotelField draft={draft} onChange={onChange} />
      <PickupField draft={draft} onChange={onChange} />
    </div>,
    <div key="team" className="grid gap-4">
      <TeamFields draft={draft} onChange={onChange} />
      <AgentField draft={draft} onChange={onChange} />
    </div>,
    <PaymentFields key="payment" draft={draft} onChange={onChange} />,
    <div key="extras" className="grid gap-6">
      <ExtrasTabs draft={draft} onChange={onChange} />
      <div className="border-t pt-5">
        <StatusField draft={draft} onChange={onChange} />
      </div>
    </div>,
    <ReviewStep key="review" draft={draft} />,
  ]
}
