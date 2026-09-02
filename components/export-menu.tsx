"use client"

import { IconDots, IconFileSpreadsheet, IconFileTypeCsv, IconRefresh } from "@tabler/icons-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ExportMenuProps = {
  /** Qué se exporta: la lista de reservas, la operación del día o un catálogo. */
  kind: "reservas" | "hoy" | "catalogo"
  /** Solo para catálogos: cuál de los seis. */
  entity?: string
}

const options = [
  { format: "xlsx", label: "Excel", icon: IconFileSpreadsheet },
  { format: "csv", label: "CSV", icon: IconFileTypeCsv },
]

/**
 * Exporta lo que el filtro deja ver, no solo la página en pantalla: los mismos
 * parámetros de la URL viajan a la ruta de descarga, así que lo que baja es
 * exactamente lo que se está mirando.
 */
export function ExportMenu({ kind, entity }: ExportMenuProps) {
  const params = useSearchParams()
  const router = useRouter()
  const [refreshing, startRefresh] = useTransition()

  const href = (format: string) => {
    const query = new URLSearchParams(params.toString())
    query.set("tipo", kind)
    query.set("formato", format)
    if (entity) query.set("entidad", entity)
    return `/api/export?${query.toString()}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="icon-lg" aria-label="Más acciones">
            <IconDots />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-52!">
        {/* Base UI exige que la etiqueta viva dentro de un grupo. */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>Exportar</DropdownMenuLabel>
          {options.map((option) => {
            const Icon = option.icon
            return (
              <DropdownMenuItem
                key={option.format}
                // `download` en un enlace normal: el navegador guarda el
                // archivo sin sacar al operador de la pantalla.
                render={<a href={href(option.format)} download />}
              >
                <Icon />
                {option.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* Vuelve a pedir los datos al servidor sin recargar la pantalla. */}
          <DropdownMenuItem onClick={() => startRefresh(() => router.refresh())}>
            <IconRefresh className={refreshing ? "animate-spin" : undefined} />
            {refreshing ? "Actualizando" : "Actualizar"}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
