import { Card } from "@/components/ui/card"

/**
 * Esta ruta sí espera a D1 antes de pintar (`findReservation`), así que el
 * clic en "Editar" pasa por aquí de verdad. Forma de formulario, no de
 * tabla: heredar el `loading.tsx` de `/reservas` mostraría la silueta
 * equivocada.
 */
export default function Loading() {
  const pulse = "animate-pulse rounded-lg bg-muted"

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_minmax(0,1fr)] md:gap-5">
      <div className="hidden items-center gap-4 md:flex">
        <div className={`${pulse} size-10 rounded-full`} />
        <div className="grid gap-2">
          <div className={`${pulse} h-6 w-40`} />
          <div className={`${pulse} h-4 w-56`} />
        </div>
      </div>
      <Card className="min-h-0 gap-0 overflow-hidden rounded-xl border-0 py-0 md:mx-auto md:max-h-full md:w-full md:max-w-[860px] md:self-start">
        <div className="grid gap-4 p-6 md:p-8">
          {["a", "b", "c", "d", "e"].map((row) => (
            <div key={row} className={`${pulse} h-14 w-full`} />
          ))}
        </div>
      </Card>
    </div>
  )
}
