"use client"

import type { ReactNode } from "react"

import { Field } from "@/components/reservations/form/field"
import { SegmentedTabs } from "@/components/segmented-tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ReservationDraft } from "@/lib/reservation-form"

type PaymentFieldsProps = {
  draft: ReservationDraft
  onChange: (patch: Partial<ReservationDraft>) => void
  /** El estado de la reserva viaja aquí: es el otro estado de la misma fila. */
  trailing?: ReactNode
}

const payment = [
  { value: "paid" as const, label: "Pagado" },
  { value: "pending" as const, label: "Pendiente" },
]

export function PaymentFields({ draft, onChange, trailing }: PaymentFieldsProps) {
  const pax = Number(draft.pax) || 0
  const total = (Number(draft.rate) || 0) * pax
  const deposit = Number(draft.deposit) || 0
  const pending = Math.max(0, total - deposit)

  // El total es información calculada, no un campo: sale de la tarifa por las personas.
  const setRate = (rate: string) => onChange({ rate, total: String((Number(rate) || 0) * pax) })

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,200px)_minmax(0,200px)]">
        <Field id="rate" label="Tarifa por persona">
          <Input
            id="rate"
            inputMode="decimal"
            className="h-11 text-[15px]"
            placeholder="65"
            value={draft.rate}
            onChange={(event) => setRate(event.target.value)}
          />
        </Field>
        <Field id="deposit" label="Depósito recibido">
          <Input
            id="deposit"
            inputMode="decimal"
            className="h-11 text-[15px]"
            placeholder="0"
            value={draft.deposit}
            onChange={(event) => onChange({ deposit: event.target.value })}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p className="text-[13px] text-muted-foreground">Total</p>
          <p className="mt-1 text-[28px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
            ${total.toLocaleString("en-US")}
          </p>
          {/* El texto auxiliar solo aparece cuando dice algo. */}
          {deposit > 0 && pending > 0 ? (
            <p className="mt-1.5 text-[13px] text-muted-foreground tabular-nums">
              Pendiente de cobro ${pending.toLocaleString("en-US")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <div className="grid gap-2">
            <Label htmlFor="payment-state">Estado del pago</Label>
            <SegmentedTabs
              value={draft.paymentPending ? "pending" : "paid"}
              options={payment}
              ariaLabel="Estado del pago"
              responsive
              onValueChange={(value) => onChange({ paymentPending: value === "pending" })}
            />
          </div>
          {trailing}
        </div>
      </div>
    </div>
  )
}
