import type { Metadata } from "next"

import { SettingsWorkspace } from "@/components/settings/settings-workspace"
import { getActiveCatalog, getCatalogCounts } from "@/db/queries/settings"
import { requireSession } from "@/lib/auth/server"
import { entityKindOf } from "@/lib/entities"

export const metadata: Metadata = {
  title: "Configuración | Sistema Administrativo Epic",
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string | string[] }>
}) {
  const [{ organizationId }, params] = await Promise.all([requireSession(), searchParams])
  // `kind` sale de la URL, no de la base: el menú y el encabezado ya saben
  // cuál está activo sin esperar a D1. Las dos consultas van por separado
  // para que el menú no dependa de la tabla.
  const kind = entityKindOf(params.tipo)
  const countsPromise = getCatalogCounts(organizationId)
  const catalogPromise = getActiveCatalog(organizationId, kind)

  return (
    <SettingsWorkspace kind={kind} countsPromise={countsPromise} catalogPromise={catalogPromise} />
  )
}
