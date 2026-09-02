"use client"

import { IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { Suspense, use, useOptimistic, useTransition } from "react"

import { PageHeader } from "@/components/page-header"
import { EntityFormSheet } from "@/components/settings/entity-form-sheet"
import {
  type Catalog,
  NavFallback,
  PanelFallback,
  SettingsNav,
  SettingsPanel,
} from "@/components/settings/settings-blocks"
import { SettingsStoreProvider, useSettingsStore } from "@/components/settings/settings-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { definitionOf, type EntityKind } from "@/lib/entities"
import { cn } from "@/lib/utils"

type SettingsWorkspaceProps = {
  /** Sale de la URL, no de la base: se sabe sin esperar a D1. */
  kind: EntityKind
  countsPromise: Promise<Record<EntityKind, number>>
  catalogPromise: Promise<Catalog>
}

/** Le da a `SettingsWorkspaceContent` su propio store: uno por montaje, no uno por módulo. */
export function SettingsWorkspace(props: SettingsWorkspaceProps) {
  return (
    <SettingsStoreProvider>
      <SettingsWorkspaceContent {...props} />
    </SettingsStoreProvider>
  )
}

function SettingsWorkspaceContent({ kind, countsPromise, catalogPromise }: SettingsWorkspaceProps) {
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
            <Suspense fallback={<NavFallback />}>
              <SettingsNav
                promise={countsPromise}
                kind={optimisticKind}
                onSelect={select}
                onPrefetch={prefetch}
              />
            </Suspense>
          </div>

          <section
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col",
              !openOnMobile && "hidden md:flex",
            )}
          >
            <Suspense fallback={<PanelFallback />}>
              <SettingsPanel
                promise={catalogPromise}
                definition={visibleDefinition}
                kind={kind}
                pending={pending}
              />
            </Suspense>
          </section>
        </div>
      </Card>

      {creating || editingId ? (
        <EditSheet definition={definition} promise={catalogPromise} onClose={closeForm} />
      ) : null}
    </div>
  )
}

/**
 * El registro que se edita sale del catálogo ya cargado; si el panel todavía
 * no resolvió, esto espera con él en vez de bloquear la pantalla entera.
 */
function EditSheet({
  definition,
  promise,
  onClose,
}: {
  definition: ReturnType<typeof definitionOf>
  promise: Promise<Catalog>
  onClose: () => void
}) {
  const editingId = useSettingsStore((state) => state.editingId)

  return (
    <Suspense fallback={null}>
      <EditSheetContent
        definition={definition}
        promise={promise}
        editingId={editingId}
        onClose={onClose}
      />
    </Suspense>
  )
}

function EditSheetContent({
  definition,
  promise,
  editingId,
  onClose,
}: {
  definition: ReturnType<typeof definitionOf>
  promise: Promise<Catalog>
  editingId: string | null
  onClose: () => void
}) {
  const { records } = use(promise)
  const editing = records.find((record) => record.id === editingId) ?? null
  return <EntityFormSheet definition={definition} record={editing} onClose={onClose} />
}
