"use client"

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react"

import { CommandPalette } from "@/components/command-palette"

const CommandPaletteContext = createContext<{ open: () => void } | null>(null)

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  // Cmd K desde cualquier pantalla, que es el punto de una búsqueda global.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const value = useMemo(() => ({ open: () => setOpen(true) }), [])

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  )
}

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext)
  if (!context) throw new Error("useCommandPalette debe usarse dentro de CommandPaletteProvider")
  return context
}
