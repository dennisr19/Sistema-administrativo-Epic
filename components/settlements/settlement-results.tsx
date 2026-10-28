"use client"

import { IconUserSearch } from "@tabler/icons-react"
import { use } from "react"

import { SegmentedTabs } from "@/components/segmented-tabs"
import { SettlementList } from "@/components/settlements/settlement-list"
import { SettlementSummary } from "@/components/settlements/settlement-summary"
import {
  type Settlement,
  type SettlementFilters,
  type SettlementStatus,
  settlementStatusOptions,
} from "@/lib/settlement"

type SettlementResultsProps = {
  promise: Promise<Settlement | null>
  filters: SettlementFilters
  onStatus: (status: SettlementStatus) => void
}

export function SettlementResults({ promise, filters, onStatus }: SettlementResultsProps) {
  const settlement = use(promise)

  if (!settlement) {
    const who = filters.kind === "agent" ? "un agente" : "un guía"
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-xl bg-card px-6 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <IconUserSearch className="size-5" />
        </span>
        <p className="font-semibold">Elige {who} para ver su liquidación</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Se listan sus reservas del periodo, sin las canceladas, con lo que falta por pagar.
        </p>
      </div>
    )
  }

  return (
    <>
      <SettlementSummary kind={filters.kind} summary={settlement.summary} />
      <div className="rounded-xl bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:px-5">
          <SegmentedTabs
            value={filters.status}
            options={settlementStatusOptions}
            ariaLabel="Estado del pago"
            onValueChange={onStatus}
          />
          <span className="text-[13px] text-muted-foreground">
            {settlement.rows.length === 1 ? "1 reserva" : `${settlement.rows.length} reservas`}
          </span>
        </div>
        <SettlementList kind={filters.kind} rows={settlement.rows} />
      </div>
    </>
  )
}

export function SettlementResultsFallback() {
  const pulse = "animate-pulse rounded-xl bg-muted"
  return (
    <>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {["a", "b", "c", "d"].map((key) => (
          <div key={key} className={`${pulse} h-[72px]`} />
        ))}
      </div>
      <div className={`${pulse} h-80`} />
    </>
  )
}
