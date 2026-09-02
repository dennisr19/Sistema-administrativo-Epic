"use client"

import { IconCheck, IconPlus } from "@tabler/icons-react"
import { useState } from "react"

import { Field } from "@/components/reservations/form/field"
import { useEntities } from "@/components/settings/entities-provider"
import { EntityFormSheet } from "@/components/settings/entity-form-sheet"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
} from "@/components/ui/combobox"
import { definitionOf, type EntityKind } from "@/lib/entities"

type Option = { value: string; label: string; creatable?: string }

type EntityComboboxProps = {
  id: string
  label: string
  kind: EntityKind
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
  error?: string
  /** Con `false` solo busca, sin ofrecer crear. */
  creatable?: boolean
  /** Opción para dejar el campo vacío, por ejemplo `Sin asignar`. */
  emptyOption?: string
}

/**
 * Buscar y, si no existe, crear sin abandonar la reserva: al guardar, la entidad queda creada,
 * el overlay se cierra y el valor queda seleccionado.
 */
export function EntityCombobox({
  id,
  label,
  kind,
  value,
  onChange,
  placeholder,
  hint,
  error,
  creatable = true,
  emptyOption,
}: EntityComboboxProps) {
  const { entities } = useEntities()
  const [query, setQuery] = useState("")
  const [creatingName, setCreatingName] = useState<string | null>(null)

  const options: Option[] = [
    ...(emptyOption ? [{ value: "", label: emptyOption }] : []),
    ...entities[kind]
      .filter((record) => record.active)
      .map((record) => ({ value: record.name, label: record.name })),
  ]

  const typed = query.trim()
  const exists = options.some(
    (option) => option.label.toLocaleLowerCase("es") === typed.toLocaleLowerCase("es"),
  )
  const items: Option[] =
    creatable && typed && !exists
      ? [...options, { value: `crear:${typed}`, label: `Crear "${typed}"`, creatable: typed }]
      : options

  const selected = options.find((option) => option.value === value) ?? null

  return (
    <>
      <Field id={id} label={label} hint={hint} error={error}>
        <Combobox
          items={items}
          value={selected}
          inputValue={query || selected?.label || ""}
          onInputValueChange={setQuery}
          onValueChange={(next: Option | null) => {
            if (next?.creatable) {
              setCreatingName(next.creatable)
              return
            }
            onChange(next?.value ?? "")
            setQuery("")
          }}
        >
          <ComboboxInput
            id={id}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
          />
          <ComboboxContent>
            <ComboboxEmpty>Sin resultados.</ComboboxEmpty>
            <ComboboxList>
              {(item: Option) => (
                <ComboboxItem key={item.value} value={item}>
                  {item.creatable ? (
                    <>
                      <IconPlus className="size-4 shrink-0 text-secondary-foreground" />
                      <span className="font-medium text-secondary-foreground">{item.label}</span>
                    </>
                  ) : (
                    <>
                      <span className="flex size-4 shrink-0 items-center justify-center">
                        <ComboboxItemIndicator>
                          <IconCheck className="size-4" />
                        </ComboboxItemIndicator>
                      </span>
                      <span className="min-w-0 truncate">{item.label}</span>
                    </>
                  )}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>

      {creatingName !== null ? (
        <EntityFormSheet
          definition={definitionOf(kind)}
          record={null}
          initialName={creatingName}
          onSaved={(name) => {
            onChange(name)
            setQuery("")
          }}
          onClose={() => setCreatingName(null)}
        />
      ) : null}
    </>
  )
}
