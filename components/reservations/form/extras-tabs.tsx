"use client"

import { NotesField } from "@/components/reservations/form/field-groups"
import { MealLines } from "@/components/reservations/form/meal-lines"
import { TicketLines } from "@/components/reservations/form/ticket-lines"
import { useEntities } from "@/components/settings/entities-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ReservationDraft } from "@/lib/reservation-form"

type ExtrasTabsProps = {
  draft: ReservationDraft
  onChange: (patch: Partial<ReservationDraft>) => void
}

export function ExtrasTabs({ draft, onChange }: ExtrasTabsProps) {
  const { entities } = useEntities()
  const includesMeals = entities.tours.find((tour) => tour.name === draft.tour)?.includesMeals
  const pax = Number(draft.pax) || 0
  const meals = draft.meals.reduce((total, meal) => total + (Number(meal.quantity) || 0), 0)

  return (
    <Tabs defaultValue="entradas" className="gap-0">
      <TabsList variant="line" className="h-11! gap-1 border-b">
        <TabsTrigger value="entradas" className="h-11! px-3 text-[15px]">
          Entradas{draft.tickets.length ? ` (${draft.tickets.length})` : ""}
        </TabsTrigger>
        {includesMeals ? (
          <TabsTrigger value="alimentacion" className="h-11! px-3 text-[15px]">
            Alimentación{meals ? ` (${meals})` : ""}
          </TabsTrigger>
        ) : null}
        <TabsTrigger value="nota" className="h-11! px-3 text-[15px]">
          Nota
        </TabsTrigger>
      </TabsList>

      <TabsContent value="entradas" className="pt-4">
        <TicketLines
          lines={draft.tickets}
          pax={pax}
          onChange={(tickets) => onChange({ tickets })}
        />
      </TabsContent>
      {includesMeals ? (
        <TabsContent value="alimentacion" className="pt-4">
          <MealLines lines={draft.meals} pax={pax} onChange={(meals) => onChange({ meals })} />
        </TabsContent>
      ) : null}
      <TabsContent value="nota" className="pt-4">
        <NotesField draft={draft} onChange={onChange} />
      </TabsContent>
    </Tabs>
  )
}
