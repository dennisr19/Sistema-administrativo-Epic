"use client"

import { createContext, type ReactNode, useContext, useMemo } from "react"

import type { Reservation } from "@/lib/reservation"

type AlertsContextValue = {
  /** Salidas de hoy y mañana con algo sin resolver, ya filtradas en SQL. */
  upcoming: Reservation[]
  today: string
}

const AlertsContext = createContext<AlertsContextValue | null>(null)

export function AlertsProvider({
  upcoming,
  today,
  children,
}: AlertsContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ upcoming, today }), [upcoming, today])
  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>
}

export function useAlerts() {
  const context = useContext(AlertsContext)
  if (!context) throw new Error("useAlerts debe usarse dentro de AlertsProvider")
  return context
}
