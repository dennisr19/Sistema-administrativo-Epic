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

  // Sin un Suspense envolvente: los bloques que esperan datos tienen el suyo
  // dentro de la vista, así que el encabezado y las pestañas de periodo
  // pintan sin esperar a D1 en vez de esconderse tras un esqueleto entero.
  return (
    <TodayOperations
      reservationsPromise={reservationsPromise}
      range={range}
      greeting={`Buenos días, ${name.split(" ")[0]}`}
      dateLabel={formatLongDate(today)}
    />
  )
}
