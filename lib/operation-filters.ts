import {
  countEntityFilters,
  defaultEntityFilters,
  type EntityFilters,
  matchesEntityFilters,
} from "@/lib/filter-options"
import type { Reservation } from "@/lib/reservation"

export type OperationFilters = EntityFilters & {
  query: string
  startTime: string
  endTime: string
}

export const defaultOperationFilters: OperationFilters = {
  ...defaultEntityFilters,
  query: "",
  startTime: "",
  endTime: "",
}

export function countActiveFilters(filters: OperationFilters) {
  return Number(Boolean(filters.startTime || filters.endTime)) + countEntityFilters(filters)
}

export function filterReservations(reservations: Reservation[], filters: OperationFilters) {
  const query = filters.query.trim().toLocaleLowerCase("es")
  const startTime = filters.startTime ? toMinutes(filters.startTime) : null
  const endTime = filters.endTime ? toMinutes(filters.endTime) : null

  return reservations.filter((reservation) => {
    const matchesQuery =
      !query ||
      [reservation.id, reservation.tour, reservation.client, reservation.hotel, reservation.agent]
        .join(" ")
        .toLocaleLowerCase("es")
        .includes(query)

    const reservationTime = toMinutes(reservation.time)
    const matchesHour =
      (startTime === null || reservationTime >= startTime) &&
      (endTime === null || reservationTime <= endTime)

    return matchesQuery && matchesHour && matchesEntityFilters(reservation, filters)
  })
}

export function hasInvalidTimeRange(filters: OperationFilters) {
  if (!filters.startTime || !filters.endTime) return false
  return toMinutes(filters.startTime) > toMinutes(filters.endTime)
}

function toMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}
