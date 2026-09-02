import { StatusBadge } from "@/components/today/status-badge"
import { formatLongDate } from "@/lib/format-date"
import { type ReservationDraft, summarizeMeals, summarizeTickets } from "@/lib/reservation-form"

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b py-3 last:border-b-0">
      <span className="shrink-0 text-[13px] text-muted-foreground">{label}</span>
      <span className="text-right text-[15px] font-medium">{value}</span>
    </div>
  )
}

export function ReviewStep({ draft }: { draft: ReservationDraft }) {
  const pending = !draft.guide
    ? "guide"
    : !draft.driver
      ? "driver"
      : draft.paymentPending
        ? "payment"
        : undefined

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xl font-semibold tracking-[-0.025em]">
            {draft.tour || "Sin tour"}
          </p>
          <p className="mt-1 text-[15px] text-muted-foreground">{draft.client || "Sin cliente"}</p>
        </div>
        <StatusBadge issue={pending} status={draft.status} />
      </div>

      <div className="mt-5">
        <Row
          label="Salida"
          value={draft.date ? `${formatLongDate(draft.date)}, ${draft.time}` : "Sin fecha"}
        />
        <Row label="Pasajeros" value={`${draft.pax || 0} pax`} />
        <Row
          label="Recogida"
          value={`${draft.hotel || "Sin hotel"}, ${draft.pickup || "por confirmar"}`}
        />
        <Row label="Guía" value={draft.guide || "Sin asignar"} />
        <Row label="Conductor" value={draft.driver || "Sin asignar"} />
        <Row label="Agente" value={draft.agent} />
        {summarizeMeals(draft.meals) ? (
          <Row label="Alimentación" value={summarizeMeals(draft.meals)} />
        ) : null}
        {summarizeTickets(draft.tickets) ? (
          <Row label="Entradas" value={summarizeTickets(draft.tickets)} />
        ) : null}
        <Row label="Total" value={`$${Number(draft.total) || 0}`} />
        {draft.notes ? <Row label="Notas" value={draft.notes} /> : null}
      </div>
    </div>
  )
}
