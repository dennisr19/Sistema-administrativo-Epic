"use client"

import { useEntities } from "@/components/settings/entities-provider"
import { ALL, UNASSIGNED } from "@/lib/filter-options"
import type { TourKind } from "@/lib/reservation"

/**
 * Una sola fuente: lo que se administra en Configuración es lo que se ofrece al crear una
 * reserva y al filtrar. Lo desactivado deja de ofrecerse, pero no desaparece del historial.
 */
export function useEntityOptions() {
  const { entities, activeNames } = useEntities()
  const options = (names: string[]) => names.map((name) => ({ value: name, label: name }))
  const withAll = (label: string, names: string[]) => [{ value: ALL, label }, ...options(names)]

  return {
    tours: options(activeNames("tours")),
    hotels: options(activeNames("hotels")),
    guides: options(activeNames("guides")),
    drivers: options(activeNames("drivers")),
    agents: options(activeNames("agents")),
    meals: options(activeNames("meals")),
    filters: {
      tour: withAll("Todos los tours", activeNames("tours")),
      hotel: withAll("Todos los hoteles", activeNames("hotels")),
      agent: withAll("Todos los agentes", activeNames("agents")),
      guide: [
        { value: ALL, label: "Todos los guías" },
        { value: UNASSIGNED, label: "Sin guía asignado" },
        ...options(activeNames("guides")),
      ],
    },
    kindOf: (tour: string): TourKind | undefined =>
      entities.tours.find((record) => record.name === tour)?.kind,
  }
}
