import "server-only"

import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm"

import { db } from "@/db"
import { reservations } from "@/db/schema"
import type { SettlementKind } from "@/lib/settlement"

/** D1 acepta hasta 100 parámetros por consulta; se deja margen para el resto del `where`. */
const CHUNK = 90

/**
 * Marca o desmarca como pagadas varias reservas a la vez. Al marcar solo se
 * tocan las pendientes, para no mover la fecha de un pago que ya existía.
 */
export async function setSettlementPaid(
  organizationId: string,
  kind: SettlementKind,
  ids: string[],
  paid: boolean,
) {
  const client = await db()
  const column = kind === "agent" ? "agentCommissionPaidAt" : "guidePaidAt"
  const paidAt = reservations[column]
  const now = new Date()

  const chunks: string[][] = []
  for (let start = 0; start < ids.length; start += CHUNK) {
    chunks.push(ids.slice(start, start + CHUNK))
  }

  await Promise.all(
    chunks.map((chunk) =>
      client
        .update(reservations)
        .set({ [column]: paid ? now : null })
        .where(
          and(
            eq(reservations.organizationId, organizationId),
            inArray(reservations.id, chunk),
            paid ? isNull(paidAt) : isNotNull(paidAt),
          ),
        ),
    ),
  )
}
