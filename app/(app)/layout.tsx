import type { ReactNode } from "react"

import { AppShell } from "@/components/app-shell"

/**
 * El shell vive aquí y no dentro de cada página a propósito: Next mantiene el
 * layout montado al navegar entre estas rutas, así que sus consultas (sesión,
 * catálogos, avisos) corren una vez y no en cada clic del menú.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
