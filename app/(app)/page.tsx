import { Suspense } from "react"

import { ReservationsSkeleton } from "@/components/reservations/reservations-skeleton"
import { TodayOperations } from "@/components/today/today-operations"
import { listOperationPeriod } from "@/db/queries/reservations"
import { requireSession } from "@/lib/auth/server"
import { formatLongDate } from "@/lib/format-date"
import { operationToday, presetRange } from "@/lib/today"

const isDate = (value?: string) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>
}) {
  const [{ organizationId, name }, params] = await Promise.all([requireSession(), searchParams])
  const today = operationToday()

  // El rango manda; sin él, la pantalla abre en el día de hoy.
  const range =
    isDate(params.desde) && isDate(params.hasta)
      ? { from: params.desde as string, to: params.hasta as string }
      : presetRange("today", today)

  const reservationsPromise = listOperationPeriod(organizationId, range.from, range.to)

  // Sin `key`: con `key` cada cambio de rango montaba un Suspense nuevo, se
  // tiraba la pantalla y aparecía el esqueleto. Sin él, la transición mantiene
  // lo anterior hasta que llega lo nuevo.
  return (
    <Suspense fallback={<ReservationsSkeleton />}>
      <TodayOperations
        reservationsPromise={reservationsPromise}
        range={range}
        greeting={`Buenos días, ${name.split(" ")[0]}`}
        dateLabel={formatLongDate(today)}
      />
    </Suspense>
  )
}
