import type { OperationalIssue, Reservation } from "@/lib/reservation"
import { addDays } from "@/lib/today"

export type UpcomingAlert = {
  reservation: Reservation
  issue: OperationalIssue
  /** `0` sale hoy, `1` sale mañana. */
  daysAway: number
}

const issueLabels: Record<OperationalIssue, string> = {
  guide: "sin guía",
  driver: "sin chofer",
  payment: "pago pendiente",
}

export function alertLabel(issue: OperationalIssue) {
  return issueLabels[issue]
}

/**
 * Una notificación es una salida que se acerca con algo sin resolver. Nada más:
 * un pendiente de dentro de tres semanas es una tarea, no una alerta.
 */
export function upcomingAlerts(reservations: Reservation[], today: string): UpcomingAlert[] {
  const window = [today, addDays(today, 1)]

  return reservations
    .filter(
      (reservation) =>
        reservation.status === "confirmed" &&
        reservation.issue &&
        window.includes(reservation.date),
    )
    .map((reservation) => ({
      reservation,
      issue: reservation.issue as OperationalIssue,
      daysAway: window.indexOf(reservation.date),
    }))
    .sort((a, b) =>
      a.daysAway === b.daysAway
        ? a.reservation.time.localeCompare(b.reservation.time)
        : a.daysAway - b.daysAway,
    )
}
