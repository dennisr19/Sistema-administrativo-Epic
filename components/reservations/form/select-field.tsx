"use client"

import { Field } from "@/components/reservations/form/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SelectFieldProps = {
  id: string
  label: string
  value: string
  options: { value: string; label: string }[]
  placeholder?: string
  error?: string
  hint?: string
  onChange: (value: string) => void
}

export function SelectField({
  id,
  label,
  value,
  options,
  placeholder,
  error,
  hint,
  onChange,
}: SelectFieldProps) {
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <Select items={options} value={value} onValueChange={(next) => onChange(String(next))}>
        <SelectTrigger
          id={id}
          className="h-11 w-full text-[15px]"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent align="start">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  )
}
