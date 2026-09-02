"use client"

import { IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { use, useOptimistic, useTransition } from "react"

import { PageHeader } from "@/components/page-header"
import { EntityFormSheet } from "@/components/settings/entity-form-sheet"
import { EntityNav } from "@/components/settings/entity-nav"
import { SettingsCatalogPanel } from "@/components/settings/settings-catalog-panel"
import { useSettingsStore } from "@/components/settings/settings-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { definitionOf, type EntityKind, type SettingsData } from "@/lib/entities"
import { cn } from "@/lib/utils"

export function SettingsWorkspace({ dataPromise }: { dataPromise: Promise<SettingsData> }) {
  const { kind, records, usage, counts } = use(dataPromise)
  const router = useRouter()
  const [optimisticKind, setOptimisticKind] = useOptimistic(kind)
  const [pending, beginNavigation] = useTransition()
  const openOnMobile = useSettingsStore((state) => state.openOnMobile)
  const creating = useSettingsStore((state) => state.creating)
  const editingId = useSettingsStore((state) => state.editingId)
  const selectKind = useSettingsStore((state) => state.selectKind)
  const startCreating = useSettingsStore((state) => state.startCreating)
  const closeForm = useSettingsStore((state) => state.closeForm)

  const definition = definitionOf(kind)
  const visibleDefinition = definitionOf(optimisticKind)
  const editing = records.find((record) => record.id === editingId) ?? null
  const href = (next: EntityKind) => `/configuracion?tipo=${next}`

  const select = (next: EntityKind) => {
    if (next === kind) {
      selectKind()
      return
    }

    selectKind()
    beginNavigation(() => {
      setOptimisticKind(next)
      router.replace(href(next), { scroll: false })
    })
  }

  const prefetch = (next: EntityKind) => {
    router.prefetch(href(next))
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_minmax(0,1fr)] md:gap-4">
      <PageHeader
        title="Configuración"
        subtitle="Lo que alimenta las reservas"
        action={
          <Button size="lg" className="ml-2 h-11 px-4.5" disabled={pending} onClick={startCreating}>
            <IconPlus />
            Nuevo {visibleDefinition.singular}
          </Button>
        }
      />

      <Card className="min-h-0 gap-0 overflow-hidden rounded-xl border-0 py-0">
        <div className="flex min-h-0 flex-1 md:divide-x">
          <div className={cn("w-full md:w-auto md:shrink-0", openOnMobile && "hidden md:block")}>
            <EntityNav
              kind={optimisticKind}
              counts={counts}
              onSelect={select}
              onPrefetch={prefetch}
            />
          </div>

          <section
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col",
              !openOnMobile && "hidden md:flex",
            )}
          >
            <SettingsCatalogPanel
              definition={visibleDefinition}
              kind={kind}
              records={records}
              usage={usage}
              pending={pending}
            />
          </section>
        </div>
      </Card>

      {creating || editing ? (
        <EntityFormSheet definition={definition} record={editing} onClose={closeForm} />
      ) : null}
    </div>
  )
}
