"use client"

import { useState } from "react"

import { EntityFilterFields } from "@/components/entity-filter-fields"
import { FilterSection } from "@/components/filter-section"
import { TimeRangeFields } from "@/components/today/time-range-fields"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { countEntityFilters, defaultEntityFilters } from "@/lib/filter-options"
import {
  countActiveFilters,
  defaultOperationFilters,
  filterReservations,
  hasInvalidTimeRange,
  type OperationFilters,
} from "@/lib/operation-filters"
import type { Reservation } from "@/lib/reservation"

type OperationFilterSheetProps = {
  filters: OperationFilters
  reservations: Reservation[]
  onApply: (filters: OperationFilters) => void
  onClose: () => void
}

export function OperationFilterSheet({
  filters,
  reservations,
  onApply,
  onClose,
}: OperationFilterSheetProps) {
  const [draft, setDraft] = useState(filters)
  const activeCount = countActiveFilters(draft)
  const invalidTimeRange = hasInvalidTimeRange(draft)
  const resultCount = invalidTimeRange ? 0 : filterReservations(reservations, draft).length

  const resetDraft = () => {
    setDraft({ ...defaultOperationFilters, query: filters.query })
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full! max-w-none! gap-0 border-0 bg-white sm:w-[440px]! sm:max-w-[440px]!"
      >
        <SheetHeader className="border-b px-5 pt-7 pb-5 md:px-7 md:pt-8">
          <SheetTitle className="text-xl font-semibold tracking-[-0.03em]">
            Filtrar salidas
          </SheetTitle>
          <SheetDescription>
            Acota la operación por horario, tour, hotel, guía o agente.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6 md:px-7">
          <TimeRangeFields
            startTime={draft.startTime}
            endTime={draft.endTime}
            invalid={invalidTimeRange}
            onChange={(times) => setDraft((current) => ({ ...current, ...times }))}
          />

          <FilterSection
            title="Filtrar por"
            onClear={
              countEntityFilters(draft)
                ? () => setDraft((current) => ({ ...current, ...defaultEntityFilters }))
                : undefined
            }
          >
            <EntityFilterFields
              scope="operacion"
              filters={draft}
              onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
            />
          </FilterSection>
        </div>

        <SheetFooter className="gap-3 border-t bg-white px-5 py-4 md:px-7">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-muted-foreground">
              {resultCount} {resultCount === 1 ? "salida coincide" : "salidas coinciden"}
            </span>
            {activeCount ? (
              <Button
                variant="ghost"
                className="h-11 px-3 text-[13px] font-semibold text-secondary-foreground underline decoration-secondary-foreground/40 underline-offset-4 hover:text-secondary-foreground"
                onClick={resetDraft}
              >
                Restablecer
              </Button>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="lg" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              size="lg"
              disabled={invalidTimeRange}
              onClick={() => {
                onApply(draft)
                onClose()
              }}
            >
              Aplicar filtros
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
