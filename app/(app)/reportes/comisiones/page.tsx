import type { Metadata } from "next"

import { SettlementWorkspace } from "@/components/settlements/settlement-workspace"
import { getSettlement } from "@/db/queries/settlement"
import { requireSession } from "@/lib/auth/server"
import { rangeOf } from "@/lib/report-period"
import { parseSettlementParams, type SettlementParams } from "@/lib/settlement"

export const metadata: Metadata = {
  title: "Comisiones | Sistema Administrativo Epic",
}

export default async function SettlementPage({
  searchParams,
}: {
  searchParams: Promise<SettlementParams>
}) {
  const [{ organizationId }, params] = await Promise.all([requireSession(), searchParams])
  // Sin fechas en la URL se liquida el mes en curso, que es el corte habitual.
  const filters = parseSettlementParams(params, rangeOf("month"))
  const settlementPromise = getSettlement(organizationId, filters)

  return <SettlementWorkspace settlementPromise={settlementPromise} filters={filters} />
}
