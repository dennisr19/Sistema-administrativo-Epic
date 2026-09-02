/**
 * Misma silueta que `ReportsWorkspace`: sin una card que envuelva todo (la
 * página real tampoco tiene una, cada bloque es su propia superficie), en el
 * mismo orden — filtros, KPIs, titular, rankings, incidentes y el botón de
 * cierre. Antes esta pantalla vivía metida en una sola Card con borde, que
 * es justo lo que la implementación real evita a propósito.
 */
export function ReportsSkeleton() {
  const pulse = "animate-pulse rounded-xl bg-muted"

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_minmax(0,1fr)] md:gap-4">
      <div className="hidden h-[76px] md:block" />

      <div className="min-h-0 overflow-y-auto pb-1">
        <div className="grid gap-3">
          <div className="hidden items-center justify-between gap-3 md:flex">
            <div className="h-10 w-64 animate-pulse rounded-full bg-muted" />
            <div className="h-11 w-72 animate-pulse rounded-lg bg-muted" />
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {["reservas", "pax", "ingresos", "ticket"].map((kpi) => (
              <div key={kpi} className={`${pulse} h-[68px]`} />
            ))}
          </div>

          <div className={`${pulse} h-[72px]`} />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {["tours", "agentes", "hoteles"].map((rank) => (
              <div key={rank} className={`${pulse} h-[188px]`} />
            ))}
          </div>

          <div className={`${pulse} h-[104px]`} />

          <div className="h-12 w-full animate-pulse rounded-lg bg-muted sm:w-64" />
        </div>
      </div>
    </div>
  )
}
