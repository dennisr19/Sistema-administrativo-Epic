"use client"

import { IconPlus, IconSearch } from "@tabler/icons-react"
import type { ReactNode } from "react"

import { useCommandPalette } from "@/components/command-palette-provider"
import { NotificationsBell } from "@/components/notifications-bell"
import { Button } from "@/components/ui/button"

type PageHeaderProps = {
  title: string
  subtitle: string
  /** Reemplaza el botón `Nueva reserva`. `null` deja el encabezado sin acción primaria. */
  action?: ReactNode | null
  onNewReservation?: () => void
}

export function PageHeader({ title, subtitle, action, onNewReservation }: PageHeaderProps) {
  const palette = useCommandPalette()

  return (
    <header className="hidden items-start justify-between gap-5 md:flex">
      {/* `min-w-0` y `truncate`: sin esto el subtítulo largo no deja encoger el
          bloque y en tablet la fila entera se sale de la pantalla. */}
      <div className="min-w-0">
        <h1 className="truncate text-[32px] font-semibold tracking-[-0.04em] text-foreground">
          {title}
        </h1>
        <p className="mt-1.5 truncate text-base text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {/* Abre la búsqueda global, que funciona igual en Hoy, Reportes o Configuración. */}
        <Button
          variant="outline"
          className="h-11 justify-start gap-2.5 border-input bg-card px-3.5 text-[15px] font-normal text-muted-foreground hover:bg-card xl:w-[240px]"
          aria-label="Buscar en epic-ops"
          onClick={palette.open}
        >
          <IconSearch className="text-muted-foreground" />
          <span className="hidden xl:inline">Buscar</span>
          <kbd className="ml-auto hidden rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium xl:inline">
            ⌘K
          </kbd>
        </Button>

        <NotificationsBell />
        {action !== undefined ? (
          action
        ) : (
          <Button size="lg" className="ml-2 h-11 px-4.5" onClick={onNewReservation}>
            <IconPlus />
            Nueva reserva
          </Button>
        )}
      </div>
    </header>
  )
}
