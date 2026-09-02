import type { ReactNode } from "react"

import { AlertsProvider } from "@/components/alerts-provider"
import { CommandPaletteProvider } from "@/components/command-palette-provider"
import { DesktopSidebar } from "@/components/desktop-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { MobileHeader } from "@/components/mobile-header"
import { EntitiesProvider } from "@/components/settings/entities-provider"
import { getCatalogs } from "@/db/queries/catalogs"
import { organizationName } from "@/db/queries/organization"
import { upcomingReservations } from "@/db/queries/reservations"
import { requireSession } from "@/lib/auth/server"

export async function AppShell({ children }: { children: ReactNode }) {
  // `requireSession` viene cacheada por request: no cuesta una consulta extra.
  const { name, email, organizationId } = await requireSession()
  const [entities, alerts, organization] = await Promise.all([
    getCatalogs(organizationId),
    upcomingReservations(organizationId),
    organizationName(organizationId),
  ])

  return (
    <EntitiesProvider entities={entities}>
      <AlertsProvider upcoming={alerts.reservations} today={alerts.today}>
        <CommandPaletteProvider>
          <div className="h-svh overflow-hidden bg-background">
            <DesktopSidebar name={name} email={email} organization={organization} />
            <MobileHeader name={name} />
            <main className="h-[calc(100svh-4rem)] overflow-hidden pb-20 md:ml-[76px] md:h-svh md:pb-0 xl:ml-[264px]">
              <div className="mx-auto h-full w-full max-w-[1480px] px-4 py-4 sm:px-6 md:px-8 md:py-6 xl:px-10">
                {children}
              </div>
            </main>
            <MobileBottomNav />
          </div>
        </CommandPaletteProvider>
      </AlertsProvider>
    </EntitiesProvider>
  )
}
