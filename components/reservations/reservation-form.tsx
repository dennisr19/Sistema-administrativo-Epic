"use client"

import { IconArrowLeft } from "@tabler/icons-react"
import { useActionState, useState } from "react"

import { saveReservationAction } from "@/app/(app)/reservas/actions"
import { DesktopFields } from "@/components/reservations/form/desktop-fields"
import { FormActions } from "@/components/reservations/form/form-actions"
import { ReservationHiddenFields } from "@/components/reservations/form/hidden-fields"
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
            <DesktopFields draft={draft} errors={errors} onChange={change} />
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

          <FormActions
            isDesktop={isDesktop}
            saving={saving}
            submitLabel={submitLabel}
            step={step}
            stepCount={steps.length}
            errorMessage={state.status === "error" ? state.message : undefined}
            onCancel={onCancel}
            onBack={() => setStep(step - 1)}
            onContinue={continueStep}
            isBlocked={blockedBeforeSubmit}
          />
        </form>
      </Card>
    </div>
  )
}
