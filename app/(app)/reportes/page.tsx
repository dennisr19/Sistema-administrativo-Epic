import type { Metadata } from "next"
import { Suspense } from "react"

import { ReportsSkeleton } from "@/components/reports/reports-skeleton"
import { ReportsWorkspace } from "@/components/reports/reports-workspace"
import { getReport } from "@/db/queries/report"
import { requireSession } from "@/lib/auth/server"
import { type Preset, rangeOf } from "@/lib/report-period"

export const metadata: Metadata = {
  title: "Reportes | epic-ops",
}

const presets: Preset[] = ["month", "previous", "quarter", "year", "custom"]
const isDate = (value?: string) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; desde?: string; hasta?: string }>
}) {
  const [{ organizationId }, params] = await Promise.all([requireSession(), searchParams])

  const preset = presets.includes(params.preset as Preset) ? (params.preset as Preset) : "month"
  // El rango explícito manda; si no viene o no es válido, lo define el preset.
  // `custom` no tiene rango propio: siempre llega con fechas.
  const range =
    isDate(params.desde) && isDate(params.hasta)
      ? { from: params.desde as string, to: params.hasta as string }
      : rangeOf(preset === "custom" ? "month" : preset)

  const reportPromise = getReport(organizationId, range.from, range.to)

  return (
    <Suspense fallback={<ReportsSkeleton />}>
      <ReportsWorkspace reportPromise={reportPromise} preset={preset} range={range} />
    </Suspense>
  )
}
