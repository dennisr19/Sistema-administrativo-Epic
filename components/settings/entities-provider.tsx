"use client"

import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react"

import type { Catalogs } from "@/db/queries/catalogs"
import type { EntityKind } from "@/lib/entities"

type EntitiesContextValue = {
  entities: Catalogs
  /** Solo lo activo se ofrece al crear una reserva o al filtrar. */
  activeNames: (kind: EntityKind) => string[]
}

const EntitiesContext = createContext<EntitiesContextValue | null>(null)

/**
 * Los catálogos llegan resueltos desde el servidor. Este contexto solo los
 * reparte: quien los modifica son las Server Actions de Configuración, y el
 * `revalidatePath` de cada una vuelve a bajar la lista.
 */
export function EntitiesProvider({
  entities,
  children,
}: {
  entities: Catalogs
  children: ReactNode
}) {
  const activeNames = useCallback(
    (kind: EntityKind) => entities[kind].filter((item) => item.active).map((item) => item.name),
    [entities],
  )

  const value = useMemo(() => ({ entities, activeNames }), [entities, activeNames])

  return <EntitiesContext.Provider value={value}>{children}</EntitiesContext.Provider>
}

export function useEntities() {
  const context = useContext(EntitiesContext)
  if (!context) throw new Error("useEntities debe usarse dentro de EntitiesProvider")
  return context
}
