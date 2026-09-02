import type { ReservationDraft } from "@/lib/reservation-form"

/**
 * El formulario es controlado, así que los valores llegan a la Server Action
 * por campos ocultos. Las listas viajan como JSON: `FormData` no lleva arreglos.
 */
export function ReservationHiddenFields({ draft, id }: { draft: ReservationDraft; id?: string }) {
  const fields: Record<string, string> = {
    id: id ?? "",
    tour: draft.tour,
    date: draft.date,
    time: draft.time,
    pax: draft.pax,
    client: draft.client,
    hotel: draft.hotel,
    pickup: draft.pickup,
    agent: draft.agent,
    guide: draft.guide,
    driver: draft.driver,
    rate: draft.rate || "0",
    deposit: draft.deposit || "0",
    status: draft.status,
    notes: draft.notes,
    paymentPending: draft.paymentPending ? "true" : "false",
    meals: JSON.stringify(draft.meals.filter((meal) => meal.option && meal.quantity > 0)),
    tickets: JSON.stringify(draft.tickets.filter((ticket) => ticket.name.trim())),
  }

  return (
    <>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </>
  )
}
