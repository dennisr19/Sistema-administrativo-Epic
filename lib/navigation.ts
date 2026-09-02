import {
  IconCalendarEvent,
  IconChartBar,
  IconDots,
  IconHome,
  IconSettings,
} from "@tabler/icons-react"

export const navigation = [
  { label: "Hoy", href: "/", icon: IconHome },
  { label: "Reservas", href: "/reservas", icon: IconCalendarEvent },
  { label: "Reportes", href: "/reportes", icon: IconChartBar },
  { label: "Configuración", href: "/configuracion", icon: IconSettings },
]

/** La navegación agrupada: lo que se opera a diario, y lo que se consulta. */
export const navigationGroups = [
  { label: "Operación", items: [navigation[0], navigation[1]] },
  { label: "Gestión", items: [navigation[2], navigation[3]] },
]

export const mobileNavigation = [
  navigation[0],
  navigation[1],
  navigation[2],
  { label: "Más", href: "/configuracion", icon: IconDots },
]

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}
