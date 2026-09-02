import { Card, CardContent, CardHeader } from "@/components/ui/card"

/** Misma silueta que la tabla real: el salto al llegar los datos es mínimo. */
export function ReservationsSkeleton() {
  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_minmax(0,1fr)] md:gap-5">
      <div className="hidden h-[76px] md:block" />
      <Card className="min-h-0 gap-0 rounded-xl border-0 py-0">
        <CardHeader className="shrink-0 gap-3 px-4 py-4 sm:px-5 md:px-6 md:py-5">
          <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
          <div className="h-11 w-full animate-pulse rounded-full bg-muted" />
        </CardHeader>
        <CardContent className="min-h-0 flex-1 px-0">
          {["a", "b", "c", "d", "e", "f"].map((fila) => (
            <div key={fila} className="flex h-[68px] items-center gap-4 px-5 even:bg-row-alt">
              <div className="h-4 w-12 animate-pulse rounded-full bg-muted" />
              <div className="h-4 w-48 animate-pulse rounded-full bg-muted" />
              <div className="ml-auto h-4 w-16 animate-pulse rounded-full bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
