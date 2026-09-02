import type { Metadata } from "next"
import { Suspense } from "react"

import { SettingsSkeleton } from "@/components/settings/settings-skeleton"
import { SettingsWorkspace } from "@/components/settings/settings-workspace"
import { getSettingsData } from "@/db/queries/settings"
import { requireSession } from "@/lib/auth/server"
import { entityKindOf } from "@/lib/entities"

export const metadata: Metadata = {
  title: "Configuración | epic-ops",
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string | string[] }>
}) {
  const [{ organizationId }, params] = await Promise.all([requireSession(), searchParams])
  const kind = entityKindOf(params.tipo)
  // La promesa se pasa sin await: el shell pinta y la tabla llega por Suspense.
  const dataPromise = getSettingsData(organizationId, kind)

  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsWorkspace dataPromise={dataPromise} />
    </Suspense>
  )
}
