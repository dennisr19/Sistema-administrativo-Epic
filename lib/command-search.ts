import type { EntityKind, EntityRecord } from "@/lib/entities"
import { entityDefinitions } from "@/lib/entities"

export type CommandItem = {
  id: string
  group: "Reservas" | "Configuración" | "Ir a"
  label: string
  detail: string
  href: string
}

const normalize = (value: string) =>
  value
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

const routes: CommandItem[] = [
  { id: "go-hoy", group: "Ir a", label: "Hoy", detail: "Operación del día", href: "/" },
  {
    id: "go-reservas",
    group: "Ir a",
    label: "Reservas",
    detail: "Historial completo",
    href: "/reservas",
  },
  {
    id: "go-reportes",
    group: "Ir a",
    label: "Reportes",
    detail: "Rendimiento del negocio",
    href: "/reportes",
  },
  {
    id: "go-config",
    group: "Ir a",
    label: "Configuración",
    detail: "Tours, guías, hoteles y agentes",
    href: "/configuracion",
  },
]

/** Busca en entidades y navegación. Las reservas las trae una Server Action. */
export function searchCommands(
  query: string,
  entities: Record<EntityKind, EntityRecord[]>,
): CommandItem[] {
  const term = normalize(query.trim())
  if (!term) return routes

  const fromEntities: CommandItem[] = entityDefinitions
    .flatMap((definition) =>
      entities[definition.kind]
        .filter((record) => normalize(record.name).includes(term))
        .map((record) => ({
          id: `${definition.kind}-${record.id}`,
          group: "Configuración" as const,
          label: record.name,
          detail: definition.label,
          href: `/configuracion?tipo=${definition.kind}`,
        })),
    )
    .slice(0, 5)

  const fromRoutes = routes.filter((route) => normalize(route.label).includes(term))

  return [...fromEntities, ...fromRoutes]
}
