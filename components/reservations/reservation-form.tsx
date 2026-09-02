"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import { useActionState, useState } from "react"

import { saveReservationAction } from "@/app/(app)/reservas/actions"
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
import { ReservationHiddenFields } from "@/components/reservations/form/hidden-fields"
import { PaymentFields } from "@/components/reservations/form/payment-fields"
import { StatusField } from "@/components/reservations/form/status-field"
import { stepTitles, wizardSteps } from "@/components/reservations/form/wizard-steps"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  type DraftErrors,
  type ReservationDraft,
  stepFields,
  validateDraft,
} from "@/lib/reservation-form"
import { initialReservationFormState } from "@/lib/reservation-input"

type ReservationFormProps = {
  mode: "create" | "edit"
  initial: ReservationDraft
  subtitle: string
  /** Presente al editar: le dice a la acción qué reserva actualizar. */
  reservationId?: string
  onCancel: () => void
}

export function ReservationForm({
  mode,
  initial,
  subtitle,
  reservationId,
  onCancel,
}: ReservationFormProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [draft, setDraft] = useState(initial)
  const [errors, setErrors] = useState<DraftErrors>({})
  const [step, setStep] = useState(0)
  const [state, formAction, saving] = useActionState(
    saveReservationAction,
    initialReservationFormState,
  )

  const change = (patch: Partial<ReservationDraft>) =>
    setDraft((current) => ({ ...current, ...patch }))
  const submitLabel = mode === "create" ? "Crear reserva" : "Guardar cambios"
  const title = mode === "create" ? "Nueva reserva" : "Editar reserva"
  const extrasSummary = [
    draft.tickets.length ? `${draft.tickets.length} entradas` : "",
    draft.meals.length ? "alimentación" : "",
    draft.notes.trim() ? "nota" : "",
  ]
    .filter(Boolean)
    .join(", ")

  const steps = wizardSteps({ draft, errors, onChange: change })

  /** Validación de conveniencia: la que manda es la del servidor. */
  const blockedBeforeSubmit = () => {
    const nextErrors = validateDraft(draft)
    setErrors(nextErrors)
    if (!Object.keys(nextErrors).length) return false

    const failing = Number(
      Object.keys(stepFields).find((index) =>
        stepFields[Number(index)].some((field) => nextErrors[field]),
      ),
    )
    if (!isDesktop && !Number.isNaN(failing)) setStep(failing)
    return true
  }

  const continueStep = () => {
    const nextErrors = validateDraft(draft)
    const blocking = stepFields[step].filter((field) => nextErrors[field])
    if (blocking.length) {
      setErrors(Object.fromEntries(blocking.map((field) => [field, nextErrors[field]])))
      return
    }
    setErrors({})
    setStep((current) => Math.min(steps.length - 1, current + 1))
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_minmax(0,1fr)] md:gap-5">
      {/* En mobile el encabezado vive dentro de la card para alinear con los campos. */}
      <header className="hidden items-center gap-4 md:flex">
        <Button variant="ghost" size="icon-lg" onClick={onCancel} aria-label="Volver a reservas">
          <IconArrowLeft />
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-[28px] font-semibold tracking-[-0.04em]">{title}</h1>
          <p className="truncate text-base text-muted-foreground">{subtitle}</p>
        </div>
      </header>

      <Card
        // En desktop la card termina donde termina el formulario, sin caja vacía debajo.
        className="min-h-0 gap-0 overflow-hidden rounded-xl border-0 py-0 md:mx-auto md:max-h-full md:w-full md:max-w-[860px] md:self-start"
      >
        {/* `contents`: el formulario envuelve sin alterar el layout de la card. */}
        <form action={formAction} className="contents">
          <ReservationHiddenFields draft={draft} id={reservationId} />
          {isDesktop ? (
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-3 md:px-8">
              {/* Dos columnas arriba y lo opcional en pestañas: la reserva cabe en una pantalla. */}
              {/* Una columna: el flujo se lee de arriba abajo y entra en la pantalla. */}
              <div className="grid gap-4">
                <FormSection title="Reserva">
                  <TourField draft={draft} errors={errors} onChange={change} />
                  <ScheduleFields draft={draft} errors={errors} onChange={change} />
                  <ClientField draft={draft} errors={errors} onChange={change} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <HotelField draft={draft} onChange={change} />
                    <PickupField draft={draft} onChange={change} />
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
                    <TeamFields draft={draft} onChange={change} />
                    <AgentField draft={draft} onChange={change} />
                  </div>
                </FormSection>

                <FormSection title="Pago">
                  <PaymentFields
                    draft={draft}
                    onChange={change}
                    trailing={<StatusField draft={draft} onChange={change} />}
                  />
                </FormSection>

                <FormSection
                  title="Detalles adicionales"
                  collapsible
                  defaultOpen={false}
                  summary={extrasSummary}
                >
                  <ExtrasTabs draft={draft} onChange={change} />
                </FormSection>
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-4 flex items-start gap-2">
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="-ml-2 shrink-0"
                  onClick={onCancel}
                  aria-label="Volver a reservas"
                >
                  <IconArrowLeft />
                </Button>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-xl font-semibold tracking-[-0.03em]">{title}</h1>
                  <p className="truncate text-[13px] text-muted-foreground">
                    Paso {step + 1} de {steps.length}, {stepTitles[step]}
                  </p>
                </div>
              </div>
              {steps[step]}
            </div>
          )}

          <div className="flex shrink-0 items-center gap-3 border-t bg-surface-muted px-4 py-3 md:justify-end md:px-8">
            {state.status === "error" && state.message ? (
              <p className="mr-auto text-[13px] text-destructive" role="alert">
                {state.message}
              </p>
            ) : null}
            {isDesktop ? (
              <>
                <Button type="button" variant="outline" size="lg" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={saving}
                  onClick={(event) => {
                    if (blockedBeforeSubmit()) event.preventDefault()
                  }}
                >
                  {saving ? "Guardando" : submitLabel}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => (step === 0 ? onCancel() : setStep(step - 1))}
                >
                  {step === 0 ? "Cancelar" : "Atrás"}
                </Button>
                <Button
                  // Solo el último paso envía; los anteriores solo avanzan.
                  type={step === steps.length - 1 ? "submit" : "button"}
                  size="lg"
                  className="flex-1"
                  disabled={saving}
                  onClick={(event) => {
                    if (step < steps.length - 1) {
                      continueStep()
                      return
                    }
                    if (blockedBeforeSubmit()) event.preventDefault()
                  }}
                >
                  {step === steps.length - 1 ? (saving ? "Guardando" : submitLabel) : "Continuar"}
                </Button>
              </>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}
