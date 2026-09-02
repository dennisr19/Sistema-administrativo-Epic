"use client"

import { useState, useTransition } from "react"

import { saveEntityAction } from "@/app/(app)/configuracion/actions"
import { Field } from "@/components/reservations/form/field"
import { SelectField } from "@/components/reservations/form/select-field"
import { SegmentedTabs } from "@/components/segmented-tabs"
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
import type { EntityDefinition, EntityRecord } from "@/lib/entities"
import { initialEntityActionState } from "@/lib/entity-action-state"

type EntityFormSheetProps = {
  definition: EntityDefinition
  record: EntityRecord | null
  onClose: () => void
  /** Se avisa con el nombre guardado: el combobox lo deja seleccionado. */
  onSaved?: (name: string) => void
  /** Lo que el usuario ya había escrito en el combobox. */
  initialName?: string
}

export function EntityFormSheet({
  definition,
  record,
  onClose,
  onSaved,
  initialName = "",
}: EntityFormSheetProps) {
  const [draft, setDraft] = useState<EntityRecord>(
    record ?? { id: "", name: initialName, active: true },
  )
  const [state, setState] = useState(initialEntityActionState)
  const [pending, startTransition] = useTransition()

  const update = (patch: Partial<EntityRecord>) => setDraft((current) => ({ ...current, ...patch }))

  // Sin useEffect: se reacciona al resultado ahí donde llega, no observando
  // un estado que cambió. Un solo camino de guardado, aquí y al crear desde
  // una reserva.
  const formAction = (formData: FormData) => {
    startTransition(async () => {
      const result = await saveEntityAction(state, formData)
      if (result.status === "success") {
        onSaved?.(draft.name.trim())
        onClose()
        return
      }
      setState(result)
    })
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full! max-w-none! gap-0 border-0 bg-white sm:w-[440px]! sm:max-w-[440px]!"
      >
        <form action={formAction} className="contents">
          <input type="hidden" name="kind" value={definition.kind} />
          <input type="hidden" name="id" value={draft.id} />
          <SheetHeader className="border-b px-5 pt-7 pb-5 md:px-7 md:pt-8">
            <SheetTitle className="text-xl font-semibold tracking-[-0.03em]">
              {record ? `Editar ${definition.singular}` : `Nuevo ${definition.singular}`}
            </SheetTitle>
            <SheetDescription>{definition.description}</SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6 md:px-7">
            {definition.fields.map((field) => {
              const actionKey = field.key === "kind" ? "tourKind" : field.key
              const error = state.errors?.[actionKey]

              return field.type === "boolean" ? (
                <div key={field.key} className="grid gap-2">
                  <input
                    type="hidden"
                    name={actionKey}
                    value={draft[field.key] ? "true" : "false"}
                  />
                  <Label htmlFor={`entity-${field.key}`}>{field.label}</Label>
                  <SegmentedTabs
                    value={draft[field.key] ? "si" : "no"}
                    options={[
                      { value: "si", label: "Incluida" },
                      { value: "no", label: "No incluye" },
                    ]}
                    ariaLabel={field.label}
                    responsive
                    onValueChange={(value) => update({ [field.key]: value === "si" })}
                  />
                  {field.hint ? (
                    <p className="text-[13px] text-muted-foreground">{field.hint}</p>
                  ) : null}
                </div>
              ) : field.type === "select" ? (
                <div key={field.key}>
                  <input type="hidden" name={actionKey} value={String(draft[field.key] ?? "")} />
                  <SelectField
                    id={`entity-${field.key}`}
                    label={field.label}
                    value={String(draft[field.key] ?? "")}
                    options={field.options ?? []}
                    onChange={(value) => update({ [field.key]: value })}
                  />
                  {error ? <p className="mt-1 text-[13px] text-destructive">{error}</p> : null}
                </div>
              ) : (
                <Field
                  key={field.key}
                  id={`entity-${field.key}`}
                  label={field.label}
                  hint={field.hint}
                  error={error}
                >
                  <Input
                    id={`entity-${field.key}`}
                    name={actionKey}
                    className="h-11 text-[15px]"
                    inputMode={field.type === "number" ? "decimal" : undefined}
                    value={String(draft[field.key] ?? "")}
                    aria-invalid={Boolean(error)}
                    onChange={(event) =>
                      update({
                        [field.key]:
                          field.type === "number"
                            ? Number(event.target.value) || 0
                            : event.target.value,
                      })
                    }
                  />
                </Field>
              )
            })}
            <p className="min-h-5 text-[13px] text-destructive" aria-live="polite">
              {state.status === "error" ? state.message : ""}
            </p>
          </div>

          <SheetFooter className="grid grid-cols-2 gap-2 border-t bg-white px-5 py-4 md:px-7">
            <Button type="button" variant="outline" size="lg" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Guardando" : "Guardar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
