"use client"

import { IconSearch } from "@tabler/icons-react"

import { Input } from "@/components/ui/input"

type EntitySearchProps = {
  value: string
  singular: string
  onChange: (value: string) => void
}

/**
 * El catálogo entero ya está en el cliente, así que buscar es filtrar: no hay
 * ida al servidor ni razón para esperar a que el usuario deje de escribir.
 */
export function EntitySearch({ value, singular, onChange }: EntitySearchProps) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-[280px]">
      <IconSearch className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 pr-3 pl-10 text-[15px]"
        placeholder={`Buscar ${singular}`}
        aria-label={`Buscar ${singular}`}
      />
    </div>
  )
}
