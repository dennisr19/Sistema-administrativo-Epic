import "server-only"

import { getCatalogs } from "@/db/queries/catalogs"
import { listOperationPeriod, listReservations } from "@/db/queries/reservations"
import { definitionOf, displayValue, type EntityKind } from "@/lib/entities"
import type { ExportTable } from "@/lib/export/formats"
import { formatDate } from "@/lib/format-date"
import type { Reservation } from "@/lib/reservation"
import type { ReservationFilters } from "@/lib/reservation-filters"

const stateLabels: Record<string, string> = {
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
}

const issueLabels: Record<string, string> = {
  guide: "Sin guía",
  driver: "Sin chofer",
  payment: "Por cobrar",
}

/** Una fila por reserva, con los nombres resueltos y sin símbolos de moneda. */
function reservationRows(reservations: Reservation[]) {
  return reservations.map((reservation) => [
    reservation.code,
    reservation.date,
    reservation.time,
    reservation.client,
    reservation.tour,
    reservation.hotel,
    reservation.pickup,
    reservation.guide ?? "",
    reservation.driver ?? "",
    reservation.agent,
    String(reservation.pax),
    String(reservation.rate ?? 0),
    // Sin el "$": así Excel lo trata como número y se puede sumar.
    reservation.total.replace("$", "").replace(/,/g, ""),
    reservation.issue ? issueLabels[reservation.issue] : stateLabels[reservation.status],
    reservation.notes ?? "",
  ])
}

const reservationHeaders = [
  "Código",
  "Fecha",
  "Hora",
  "Cliente",
  "Tour",
  "Hotel",
  "Recogida",
  "Guía",
  "Chofer",
  "Agente",
  "Pax",
  "Tarifa",
  "Total",
  "Estado",
  "Nota",
]

/** Todo lo que cumple el filtro, no solo la página que se está viendo. */
export async function reservationsTable(
  organizationId: string,
  filters: ReservationFilters,
): Promise<ExportTable> {
  const { reservations } = await listReservations({
    organizationId,
    filters,
    page: 1,
    pageSize: 10_000,
  })

  const range = filters.from && filters.to ? ` ${filters.from} a ${filters.to}` : ""
  return {
    name: `reservas${range.replace(/ /g, "-")}`,
    title: "Reservas",
    headers: reservationHeaders,
    rows: reservationRows(reservations),
  }
}

export async function operationTable(
  organizationId: string,
  range: { from: string; to: string },
): Promise<ExportTable> {
  const reservations = await listOperationPeriod(organizationId, range.from, range.to)

  return {
    name: `salidas-${range.from}`,
    title: "Salidas",
    headers: reservationHeaders,
    rows: reservationRows(reservations),
  }
}

/** Los campos son los mismos que muestra la tabla de Configuración. */
export async function catalogTable(organizationId: string, kind: EntityKind): Promise<ExportTable> {
  const catalogs = await getCatalogs(organizationId)
  const definition = definitionOf(kind)

  return {
    name: definition.label.toLowerCase(),
    title: definition.label,
    headers: [...definition.fields.map((field) => field.label), "Estado"],
    rows: catalogs[kind].map((record) => [
      ...definition.fields.map((field) => displayValue(record, field)),
      record.active ? "Activo" : "Inactivo",
    ]),
  }
}

export const exportFileName = (table: ExportTable, extension: string) =>
  `${table.name}-${formatDate(new Date().toISOString().slice(0, 10)).label.replace(/ /g, "-")}.${extension}`
