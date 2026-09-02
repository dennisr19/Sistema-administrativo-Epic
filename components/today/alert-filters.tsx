"use client"

import { IconAlertTriangle, IconCar, IconCash, IconUserQuestion } from "@tabler/icons-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { OperationalIssue } from "@/lib/reservation"
import { cn } from "@/lib/utils"

type AlertFiltersProps = {
  counts: Record<OperationalIssue, number>
  activeIssue: OperationalIssue | null
  onSelect: (issue: OperationalIssue | null) => void
}

const alerts = [
  {
    issue: "guide" as const,
    singular: "guía pendiente",
    plural: "guías pendientes",
    shortSingular: "guía",
    shortPlural: "guías",
    icon: IconUserQuestion,
  },
  {
    issue: "driver" as const,
    singular: "chofer pendiente",
    plural: "choferes pendientes",
    shortSingular: "chofer",
    shortPlural: "choferes",
    icon: IconCar,
  },
  {
    issue: "payment" as const,
    singular: "pago pendiente",
    plural: "pagos pendientes",
    shortSingular: "pago",
    shortPlural: "pagos",
    icon: IconCash,
  },
]

export function AlertFilters({ counts, activeIssue, onSelect }: AlertFiltersProps) {
  const [open, setOpen] = useState(false)
  const visibleAlerts = alerts.filter((alert) => counts[alert.issue] > 0)
  const total = visibleAlerts.reduce((sum, alert) => sum + counts[alert.issue], 0)

  if (!total) return null

  const selectFromSheet = (issue: OperationalIssue | null) => {
    onSelect(issue)
    setOpen(false)
  }

  return (
    <>
      <fieldset className="hidden min-h-8 items-center gap-1 md:flex" aria-label="Pendientes">
        <IconAlertTriangle className="size-[18px] shrink-0 text-warning-foreground" />
        {visibleAlerts.map((alert) => {
          const count = counts[alert.issue]
          const label = count === 1 ? alert.singular : alert.plural

          return (
            <span key={alert.issue} className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-2.5 text-muted-foreground hover:bg-muted hover:text-foreground",
                  activeIssue === alert.issue &&
                    "font-semibold text-secondary-foreground underline decoration-secondary-foreground/40 underline-offset-4 hover:text-secondary-foreground",
                )}
                onClick={() => onSelect(activeIssue === alert.issue ? null : alert.issue)}
                aria-pressed={activeIssue === alert.issue}
              >
                {count} {label}
              </Button>
            </span>
          )
        })}
      </fieldset>

      <Button
        variant="ghost"
        className="h-11 w-fit justify-start gap-2 px-0 text-warning-foreground hover:bg-transparent hover:text-warning-foreground md:hidden"
        onClick={() => setOpen(true)}
        aria-label={`${total} pendientes. Ver detalle`}
      >
        <IconAlertTriangle />
        <span>{total} pendientes</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[70svh] gap-0 rounded-t-3xl border-0 bg-white pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
        >
          <SheetHeader className="px-5 pt-6 pb-3 text-left">
            <SheetTitle className="text-xl font-semibold tracking-[-0.025em]">
              Pendientes
            </SheetTitle>
            <SheetDescription>Selecciona un tipo para ver las reservas afectadas.</SheetDescription>
          </SheetHeader>

          <div className="space-y-1 px-2 py-2">
            {visibleAlerts.map((alert) => {
              const Icon = alert.icon
              const count = counts[alert.issue]
              const label = count === 1 ? alert.shortSingular : alert.shortPlural

              return (
                <Button
                  key={alert.issue}
                  variant="ghost"
                  className={cn(
                    "h-12 w-full justify-start gap-3 px-4 text-sm",
                    activeIssue === alert.issue &&
                      "bg-secondary text-secondary-foreground hover:bg-secondary",
                  )}
                  onClick={() => selectFromSheet(alert.issue)}
                  aria-pressed={activeIssue === alert.issue}
                >
                  <Icon className="text-muted-foreground" />
                  <span className="flex-1 text-left">
                    {count} {label}
                  </span>
                </Button>
              )
            })}
          </div>

          <SheetFooter className="px-5 pt-3 pb-0">
            <Button variant="secondary" size="lg" onClick={() => selectFromSheet(null)}>
              Ver todas las reservas
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
