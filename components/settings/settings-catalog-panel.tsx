"use client"

import { IconArrowLeft, IconPlus } from "@tabler/icons-react"

import { ExportMenu } from "@/components/export-menu"
import { ListPagination } from "@/components/list-pagination"
import { EntityList } from "@/components/settings/entity-list"
import { EntitySearch } from "@/components/settings/entity-search"
import { EntityTable } from "@/components/settings/entity-table"
import { SettingsCatalogSkeleton } from "@/components/settings/settings-catalog-skeleton"
import { useSettingsStore } from "@/components/settings/settings-store"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { EntityDefinition, EntityKind, EntityRecord } from "@/lib/entities"

const pageSize = 10
const normalize = (value: string) =>
  value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

const searchableText = (record: EntityRecord) =>
  [record.name, record.email, record.phone, record.company, record.address, record.description]
    .filter(Boolean)
    .join(" ")

type SettingsCatalogPanelProps = {
  definition: EntityDefinition
  kind: EntityKind
  records: EntityRecord[]
  usage: Record<string, number>
  pending: boolean
}

export function SettingsCatalogPanel({
  definition,
  kind,
  records,
  usage,
  pending,
}: SettingsCatalogPanelProps) {
  const page = useSettingsStore((state) => state.page)
  const query = useSettingsStore((state) => state.query)
  const setPage = useSettingsStore((state) => state.setPage)
  const setQuery = useSettingsStore((state) => state.setQuery)
  const startCreating = useSettingsStore((state) => state.startCreating)
  const startEditing = useSettingsStore((state) => state.startEditing)
  const closeMobile = useSettingsStore((state) => state.closeMobile)

  const term = normalize(query)
  const matches = term
    ? records.filter((record) => normalize(searchableText(record)).includes(term))
    : records
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const visible = matches.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <>
      <CardHeader className="shrink-0 gap-3 border-b px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-lg"
            className="-ml-2 shrink-0 md:hidden"
            aria-label="Volver a Configuración"
            onClick={closeMobile}
          >
            <IconArrowLeft />
          </Button>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[17px] font-semibold tracking-[-0.02em]">
              {definition.label}
            </h2>
            <p className="mt-0.5 text-[13px] text-muted-foreground tabular-nums">
              {pending
                ? `Cargando ${definition.plural}`
                : `${query ? `${matches.length} de ${records.length}` : records.length} ${records.length === 1 ? definition.singular : definition.plural}`}
            </p>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <EntitySearch value={query} singular={definition.singular} onChange={setQuery} />
            <ExportMenu kind="catalogo" entity={definition.kind} />
          </div>
          <Button
            variant="outline"
            className="h-11 shrink-0 gap-2 px-4 text-[13px] font-medium md:hidden"
            disabled={pending}
            onClick={startCreating}
          >
            <IconPlus />
            Nuevo
          </Button>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <EntitySearch value={query} singular={definition.singular} onChange={setQuery} />
          <ExportMenu kind="catalogo" entity={definition.kind} />
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 overflow-y-auto px-0" aria-busy={pending}>
        {pending ? (
          <SettingsCatalogSkeleton />
        ) : visible.length ? (
          <>
            <EntityTable
              definition={definition}
              kind={kind}
              records={visible}
              usage={(record) => usage[record.id] ?? 0}
              onEdit={(record) => startEditing(record.id)}
            />
            <EntityList
              definition={definition}
              kind={kind}
              records={visible}
              usage={(record) => usage[record.id] ?? 0}
              onEdit={(record) => startEditing(record.id)}
            />
          </>
        ) : (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">
            {query ? `Nada coincide con "${query}".` : `Todavía no hay ${definition.plural}.`}
          </p>
        )}
      </CardContent>

      <CardFooter className="h-14 shrink-0 justify-between border-t bg-surface-muted px-4 py-2 sm:px-5">
        <span className="shrink-0 text-[13px] whitespace-nowrap text-muted-foreground tabular-nums">
          {pending
            ? "Cargando"
            : matches.length
              ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, matches.length)} de ${matches.length}`
              : "0"}
        </span>
        <ListPagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
      </CardFooter>
    </>
  )
}
