"use client"

import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react"
import { type ReactNode, useEffect, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ReservationSearchBarProps = {
  query: string
  activeCount: number
  onQueryChange: (query: string) => void
  onOpenFilters: () => void
  /** El menú de tres puntos, con la exportación. */
  actions?: ReactNode
}

/** Espera a que el usuario deje de escribir antes de consultar al servidor. */
const DEBOUNCE_MS = 300

export function ReservationSearchBar({
  query,
  activeCount,
  onQueryChange,
  onOpenFilters,
  actions,
}: ReservationSearchBarProps) {
  // El campo es local: cada tecla no puede depender de una ida al servidor.
  const [text, setText] = useState(query)
  const latest = useRef(onQueryChange)
  latest.current = onQueryChange

  // Si el filtro cambia desde fuera, por ejemplo al limpiarlo, el campo debe
  // seguirlo. Se ajusta durante el render (no en un Effect aparte) para que
  // no haya un frame de por medio con el texto viejo.
  const [prevQuery, setPrevQuery] = useState(query)
  if (query !== prevQuery) {
    setPrevQuery(query)
    setText(query)
  }

  useEffect(() => {
    if (text === query) return
    const timer = setTimeout(() => latest.current(text), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [text, query])

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="relative min-w-0">
        <IconSearch className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          className="h-11 bg-card pr-4 pl-11 text-[15px]"
          placeholder="Buscar cliente, código o tour"
          aria-label="Buscar reservas"
        />
      </div>

      <Button
        variant="outline"
        className="size-12 px-0 sm:w-auto sm:px-4.5"
        onClick={onOpenFilters}
        aria-label="Filtros"
      >
        <IconAdjustmentsHorizontal />
        <span className="hidden sm:inline">Filtros</span>
        {activeCount ? (
          <Badge className="size-5 justify-center rounded-full p-0 text-[11px]">
            {activeCount}
          </Badge>
        ) : null}
      </Button>

      <div className="md:hidden">{actions}</div>
    </div>
  )
}
