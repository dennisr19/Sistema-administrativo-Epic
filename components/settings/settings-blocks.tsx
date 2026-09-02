"use client"

import { use } from "react"

import { EntityNav } from "@/components/settings/entity-nav"
import { SettingsCatalogPanel } from "@/components/settings/settings-catalog-panel"
import type { EntityDefinition, EntityKind, EntityRecord } from "@/lib/entities"

type Counts = Record<EntityKind, number>
export type Catalog = { records: EntityRecord[]; usage: Record<string, number> }

/**
 * El menú solo espera los seis enteros, que es una consulta trivial; la tabla
 * espera la suya, que es la pesada. Cada uno suspende por su lado.
 */
export function SettingsNav({
  promise,
  kind,
  onSelect,
  onPrefetch,
}: {
  promise: Promise<Counts>
  kind: EntityKind
  onSelect: (kind: EntityKind) => void
  onPrefetch: (kind: EntityKind) => void
}) {
  return <EntityNav kind={kind} counts={use(promise)} onSelect={onSelect} onPrefetch={onPrefetch} />
}

/** Mismas seis filas del menú real, sin los conteos todavía. */
export function NavFallback() {
  return (
    <nav className="w-full shrink-0 space-y-1.5 py-2 md:h-full md:w-[228px] md:p-2.5">
      {["tours", "guides", "drivers", "hotels", "agents", "meals"].map((row) => (
        <div key={row} className="h-11 w-full animate-pulse rounded-full bg-muted" />
      ))}
    </nav>
  )
}

export function SettingsPanel({
  promise,
  definition,
  kind,
  pending,
}: {
  promise: Promise<Catalog>
  definition: EntityDefinition
  kind: EntityKind
  pending: boolean
}) {
  const { records, usage } = use(promise)
  return (
    <SettingsCatalogPanel
      definition={definition}
      kind={kind}
      records={records}
      usage={usage}
      pending={pending}
    />
  )
}

export function PanelFallback() {
  return (
    <div className="space-y-3 p-6">
      {["a", "b", "c", "d", "e", "f", "g"].map((row) => (
        <div key={row} className="h-12 w-full animate-pulse rounded-lg bg-muted" />
      ))}
    </div>
  )
}
