"use client"

import { useState } from "react"

import { EntityFilterFields } from "@/components/entity-filter-fields"
import { FilterSection } from "@/components/filter-section"
import { FilterSelectField } from "@/components/today/filter-select-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  countActiveReservationFilters,
  defaultReservationFilters,
  hasInvalidRange,
  type ReservationFilters,
  statusOptions,
} from "@/lib/reservation-filters"

type ReservationFilterSheetProps = {
  filters: ReservationFilters
  onApply: (filters: ReservationFilters) => void
  onClose: () => void
}

export function ReservationFilterSheet({ filters, onApply, onClose }: ReservationFilterSheetProps) {
  const [draft, setDraft] = useState(filters)
  const activeCount = countActiveReservationFilters(draft)
  const invalidRange = hasInvalidRange(draft)

  const update = (patch: Partial<ReservationFilters>) =>
    setDraft((current) => ({ ...current, ...patch }))

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full! max-w-none! gap-0 border-0 bg-white sm:w-[440px]! sm:max-w-[440px]!"
      >
        <SheetHeader className="border-b px-5 pt-7 pb-5 md:px-7 md:pt-8">
          <SheetTitle className="text-xl font-semibold tracking-[-0.03em]">
            Filtrar reservas
          </SheetTitle>
          <SheetDescription>
            Acota el historial por fechas, estado, tour, hotel, guía o agente.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6 md:px-7">
          <FilterSection
            title="Fechas"
            hint="Deja un campo vacío para no limitar ese extremo."
            onClear={draft.from || draft.to ? () => update({ from: "", to: "" }) : undefined}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="from-date">Desde</Label>
                <Input
                  id="from-date"
                  type="date"
                  value={draft.from}
                  aria-invalid={invalidRange}
                  className="h-11 text-[15px]"
                  onChange={(event) => update({ from: event.target.value })}
                />
              </div>
              <div className="grid min-w-0 gap-2">
                <Label htmlFor="to-date">Hasta</Label>
                <Input
                  id="to-date"
                  type="date"
                  value={draft.to}
                  aria-invalid={invalidRange}
                  className="h-11 text-[15px]"
                  onChange={(event) => update({ to: event.target.value })}
                />
              </div>
            </div>
            {invalidRange ? (
              <p className="text-[13px] font-medium text-destructive">
                La fecha inicial debe ser anterior a la final.
              </p>
            ) : null}
          </FilterSection>

          <FilterSection
            title="Filtrar por"
            onClear={
              countEntityFilters(draft) ? () => update({ ...defaultEntityFilters }) : undefined
            }
          >
            <FilterSelectField
              id="historial-estado"
              label="Estado"
              value={draft.status}
              options={statusOptions}
              onChange={(status) => update({ status: status as ReservationFilters["status"] })}
            />
            <EntityFilterFields
              scope="historial"
              filters={draft}
              onChange={(patch) => update(patch)}
            />
          </FilterSection>
        </div>

        <SheetFooter className="gap-3 border-t bg-white px-5 py-4 md:px-7">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[13px] text-muted-foreground">
              {activeCount === 1 ? "1 filtro activo" : `${activeCount} filtros activos`}
            </span>
            {activeCount ? (
              <Button
                variant="ghost"
                className="h-11 px-3 text-[13px] font-semibold text-secondary-foreground underline decoration-secondary-foreground/40 underline-offset-4 hover:text-secondary-foreground"
                onClick={() =>
                  setDraft({
                    ...defaultReservationFilters,
                    query: draft.query,
                    status: draft.status,
                  })
                }
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
              disabled={invalidRange}
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
