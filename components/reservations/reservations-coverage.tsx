"use client"

import { use } from "react"

import { formatDate } from "@/lib/format-date"

type Coverage = { oldest: string | null; newest: string | null }

/** Fallback del subtítulo: la misma altura de texto, para no mover el header. */
export function CoverageFallback() {
  return <span className="inline-block h-4 w-64 animate-pulse rounded-full bg-muted align-middle" />
}

/**
 * Suspende solo el subtítulo. El título y las acciones del header pintan de
 * una: no dependen de esta consulta.
 */
export function ReservationsCoverage({ promise }: { promise: Promise<Coverage> }) {
  const { oldest, newest } = use(promise)
  if (!oldest || !newest) return "Historial completo"

  const from = formatDate(oldest)
  const to = formatDate(newest)
  return `Historial de ${from.month} ${from.year} a ${to.month} ${to.year}`
}
