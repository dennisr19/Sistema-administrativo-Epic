"use client"

import { Dialog } from "@base-ui/react/dialog"
import { IconArrowRight, IconSearch } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react"
import { searchReservationsAction } from "@/app/(app)/reservas/search-action"
import { useEntities } from "@/components/settings/entities-provider"
import { type CommandItem, searchCommands } from "@/lib/command-search"
import { cn } from "@/lib/utils"

type CommandPaletteProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Búsqueda global: reservas, entidades y navegación, desde cualquier pantalla. */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const { entities } = useEntities()
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const [matches, setMatches] = useState<CommandItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const deferred = useDeferredValue(query)

  // Entidades y rutas se resuelven en el cliente porque ya están aquí; las
  // reservas se consultan en SQL, que son miles y no viajan al navegador.
  useEffect(() => {
    let vigente = true
    if (deferred.trim().length < 2) {
      setMatches([])
      return
    }
    searchReservationsAction(deferred).then((rows) => {
      if (vigente) setMatches(rows)
    })
    return () => {
      vigente = false
    }
  }, [deferred])

  const items = useMemo(
    () => [...matches, ...searchCommands(query, entities)],
    [query, matches, entities],
  )

  useEffect(() => {
    if (!open) setQuery("")
    setActive(0)
    // El cursor va en el campo: es el propósito de la paleta.
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  const go = (item: CommandItem) => {
    onOpenChange(false)
    router.push(item.href)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActive((current) => Math.min(items.length - 1, current + 1))
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((current) => Math.max(0, current - 1))
    }
    if (event.key === "Enter" && items[active]) {
      event.preventDefault()
      go(items[active])
    }
  }

  let lastGroup = ""

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-foreground/25 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup className="fixed top-24 left-1/2 z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-3xl bg-popover text-popover-foreground ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
          <Dialog.Title className="sr-only">Buscar en epic-ops</Dialog.Title>

          <div className="flex h-14 items-center gap-3 border-b px-5">
            <IconSearch className="size-5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Busca una reserva, un hotel, un guía"
              aria-label="Buscar en epic-ops"
              className="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden shrink-0 rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground sm:block">
              esc
            </kbd>
          </div>

          <ul className="max-h-[min(420px,60svh)] overflow-y-auto py-2">
            {items.length ? (
              items.map((item, index) => {
                const heading = item.group !== lastGroup ? item.group : null
                lastGroup = item.group

                return (
                  <li key={item.id}>
                    {heading ? (
                      <p className="px-5 pt-3 pb-1.5 text-[13px] font-semibold text-muted-foreground">
                        {heading}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      className={cn(
                        "flex min-h-12 w-full items-center gap-3 px-5 text-left",
                        index === active && "bg-accent text-accent-foreground",
                      )}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => go(item)}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium">{item.label}</span>
                        <span className="block truncate text-[13px] text-muted-foreground">
                          {item.detail}
                        </span>
                      </span>
                      <IconArrowRight className="size-4 shrink-0 text-muted-foreground/70" />
                    </button>
                  </li>
                )
              })
            ) : (
              <li className="px-5 py-6 text-[15px] text-muted-foreground">
                Nada coincide con «{query}».
              </li>
            )}
          </ul>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
