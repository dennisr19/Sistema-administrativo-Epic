"use client"

import { Button } from "@/components/ui/button"

type FormActionsProps = {
  isDesktop: boolean
  saving: boolean
  submitLabel: string
  /** Solo en mobile: en qué paso del asistente va y cuántos hay. */
  step: number
  stepCount: number
  errorMessage?: string
  onCancel: () => void
  onBack: () => void
  onContinue: () => void
  /** `true` cancela el envío: la validación local encontró algo. */
  isBlocked: () => boolean
}

export function FormActions({
  isDesktop,
  saving,
  submitLabel,
  step,
  stepCount,
  errorMessage,
  onCancel,
  onBack,
  onContinue,
  isBlocked,
}: FormActionsProps) {
  const lastStep = step === stepCount - 1

  return (
    <div className="flex shrink-0 items-center gap-3 border-t bg-surface-muted px-4 py-3 md:justify-end md:px-8">
      {errorMessage ? (
        <p className="mr-auto text-[13px] text-destructive" role="alert">
          {errorMessage}
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
              if (isBlocked()) event.preventDefault()
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
            onClick={() => (step === 0 ? onCancel() : onBack())}
          >
            {step === 0 ? "Cancelar" : "Atrás"}
          </Button>
          <Button
            // Solo el último paso envía; los anteriores solo avanzan.
            type={lastStep ? "submit" : "button"}
            size="lg"
            className="flex-1"
            disabled={saving}
            onClick={(event) => {
              if (!lastStep) {
                onContinue()
                return
              }
              if (isBlocked()) event.preventDefault()
            }}
          >
            {lastStep ? (saving ? "Guardando" : submitLabel) : "Continuar"}
          </Button>
        </>
      )}
    </div>
  )
}
