"use client"

import { ErrorState } from "@/components/error-state"

/**
 * Cubre Hoy, Reservas, Reportes, Configuración y Perfil. Todas usan
 * `use(promise)` sobre datos de D1 sin `await` en el Server Component: si la
 * promesa rechaza, `use()` relanza hacia este boundary, no hacia el genérico
 * de Next.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorState error={error} reset={reset} />
}
