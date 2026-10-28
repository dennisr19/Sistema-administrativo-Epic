"use client"

import { usePathname, useRouter } from "next/navigation"
import { Suspense, useTransition } from "react"

import { PageHeader } from "@/components/page-header"
import { ReportsNav } from "@/components/reports/reports-nav"
import { SettlementControls } from "@/components/settlements/settlement-controls"
import {
  SettlementResults,
  SettlementResultsFallback,
} from "@/components/settlements/settlement-results"
import { type Settlement, type SettlementFilters, settlementSearch } from "@/lib/settlement"

type SettlementWorkspaceProps = {
  settlementPromise: Promise<Settlement | null>
  filters: SettlementFilters
}

/** Igual que Reportes: los controles pintan de una y solo el resultado espera a D1. */
export function SettlementWorkspace({ settlementPromise, filters }: SettlementWorkspaceProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [, startTransition] = useTransition()

  // Los filtros viven en la URL: se puede compartir o volver a un corte exacto.
  const apply = (patch: Partial<SettlementFilters>) => {
    startTransition(() => {
      router.replace(`${pathname}${settlementSearch({ ...filters, ...patch })}`, { scroll: false })
    })
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_minmax(0,1fr)] md:gap-4">
      <PageHeader title="Reportes" subtitle="Comisiones de agentes y pagos a guías" action={null} />

      <div className="min-h-0 overflow-y-auto pb-1">
        {/* `minmax(0,1fr)`: sin esto la columna crece al ancho del texto más
            largo de la lista y en mobile la página entera se sale por la derecha. */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
          <h1 className="text-xl font-semibold tracking-[-0.025em] md:hidden">Comisiones</h1>
          <ReportsNav />
          <SettlementControls filters={filters} onChange={apply} />

          {/* La llave reinicia el bloque al cambiar de persona o rango, así el
              fallback se ve en vez de quedar pintado el resultado anterior. */}
          <Suspense
            key={`${filters.kind}|${filters.name}|${filters.from}|${filters.to}`}
            fallback={<SettlementResultsFallback />}
          >
            <SettlementResults
              promise={settlementPromise}
              filters={filters}
              onStatus={(status) => apply({ status })}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
