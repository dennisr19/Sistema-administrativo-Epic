"use client"

import { IconSelector } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { AppMark } from "@/components/app-logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { initials } from "@/lib/initials"
import { isActive, navigationGroups } from "@/lib/navigation"
import { cn } from "@/lib/utils"

type DesktopSidebarProps = { name: string; email: string; organization: string }

export function DesktopSidebar({ name, email, organization }: DesktopSidebarProps) {
  const pathname = usePathname()
  const onProfile = isActive(pathname, "/perfil")

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[76px] flex-col border-r border-sidebar-border bg-sidebar md:flex xl:w-[264px]">
      {/* El espacio de trabajo: quién es la organización antes que a dónde ir. */}
      <div className="flex h-[68px] shrink-0 items-center gap-2.5 px-4 xl:px-4">
        <AppMark />
        {/* Manda el nombre de la organización: al renombrarla en Perfil, esto
            sigue. Debajo va qué es, como en cualquier espacio de trabajo. */}
        <span className="hidden min-w-0 xl:block">
          <span className="block truncate text-[15px] font-semibold tracking-[-0.01em]">
            {organization}
          </span>
          <span className="block truncate text-[13px] text-muted-foreground">
            Operación de tours
          </span>
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-5 px-3 pt-2" aria-label="Navegación principal">
        {navigationGroups.map((group) => (
          <div key={group.label} className="grid gap-1">
            <p className="hidden px-2 pb-1 text-[12px] font-medium text-muted-foreground xl:block">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActive(pathname, item.href)
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  nativeButton={false}
                  // `prefetch` completo y no el de por defecto: estas rutas
                  // son dinámicas, así que sin esto solo se adelanta el
                  // loading.tsx. Con el payload entero ya traído, volver a una
                  // pantalla del menú es instantáneo y ni siquiera parpadea el
                  // esqueleto. Son cuatro rutas y el shell va cacheado, así
                  // que el costo es bajo.
                  render={<Link href={item.href} prefetch />}
                  className={cn(
                    "h-11 justify-center gap-2.5 px-0 text-[15px] xl:justify-start xl:px-2.5",
                    active
                      ? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground hover:bg-sidebar-accent"
                      : "font-normal text-slate-600 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                  aria-label={item.label}
                >
                  <Icon className="size-5" stroke={1.9} />
                  <span className="hidden xl:inline">{item.label}</span>
                </Button>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/perfil" />}
          className={cn(
            "h-auto w-full justify-center gap-2.5 px-0 py-2 xl:justify-start xl:px-2",
            onProfile && "bg-sidebar-accent",
          )}
          aria-current={onProfile ? "page" : undefined}
          aria-label={`Perfil de ${name}`}
        >
          <Avatar>
            <AvatarFallback className="bg-secondary text-[13px] font-semibold text-secondary-foreground">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden min-w-0 flex-1 text-left xl:block">
            <span className="block truncate text-[14px] font-medium text-foreground">{name}</span>
            <span className="block truncate text-[12px] font-normal text-muted-foreground">
              {email}
            </span>
          </span>
          <IconSelector className="hidden size-4 shrink-0 text-muted-foreground xl:block" />
        </Button>
      </div>
    </aside>
  )
}
