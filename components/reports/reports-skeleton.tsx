import { Card, CardContent, CardHeader } from "@/components/ui/card"

/** Misma silueta que el informe: KPIs, titular y rankings. */
export function ReportsSkeleton() {
  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_minmax(0,1fr)] md:gap-5">
      <div className="hidden h-[76px] md:block" />
      <Card className="min-h-0 gap-0 rounded-xl border-0 py-0">
        <CardHeader className="shrink-0 gap-3 px-4 py-4 sm:px-5 md:px-6">
          <div className="h-11 w-80 animate-pulse rounded-full bg-muted" />
        </CardHeader>
        <CardContent className="min-h-0 flex-1 px-0">
          <div className="grid grid-cols-2 xl:grid-cols-4">
            {["reservas", "pax", "ingresos", "ticket"].map((kpi) => (
              <div key={kpi} className="grid gap-2 px-4 py-4 sm:px-6">
                <div className="h-9 w-24 animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
          <div className="h-[89px] border-y bg-surface-muted" />
          <div className="grid gap-6 px-4 py-5 sm:px-6 xl:grid-cols-3">
            {["tours", "agentes", "hoteles"].map((rank) => (
              <div key={rank} className="grid gap-4">
                <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
                <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
