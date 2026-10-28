"use server"

import { refresh, updateTag } from "next/cache"
import { z } from "zod"

import { setSettlementPaid } from "@/db/mutations/settlement"
import { requireSession } from "@/lib/auth/server"
import { tags } from "@/lib/cache-tags"

const inputSchema = z.object({
  kind: z.enum(["agent", "guide"]),
  ids: z.array(z.string().min(1)).min(1).max(1000),
  paid: z.boolean(),
})

export async function setSettlementPaidAction(input: z.input<typeof inputSchema>) {
  const { organizationId } = await requireSession()
  const parsed = inputSchema.safeParse(input)
  if (!parsed.success) return { ok: false as const }

  try {
    await setSettlementPaid(organizationId, parsed.data.kind, parsed.data.ids, parsed.data.paid)
  } catch {
    return { ok: false as const }
  }

  // Igual que al guardar una reserva: la etiqueta cubre lo cacheado y
  // `refresh` el Router Cache, para que la lista se pinte ya con el cambio.
  updateTag(tags.reservations(organizationId))
  refresh()
  return { ok: true as const }
}
