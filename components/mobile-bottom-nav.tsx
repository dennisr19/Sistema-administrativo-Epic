"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { isActive, mobileNavigation } from "@/lib/navigation"

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid h-[80px] grid-cols-4 border-t bg-white px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navegación principal"
    >
      {mobileNavigation.map((item) => {
        const Icon = item.icon
        const active = isActive(pathname, item.href)
        return (
          <Button
            key={item.label}
            variant="ghost"
            nativeButton={false}
            render={<Link href={item.href} />}
            className={
              active
                ? "h-full flex-col gap-1.5 rounded-none text-[13px] font-semibold text-primary hover:bg-transparent hover:text-primary"
                : "h-full flex-col gap-1.5 rounded-none text-[13px] font-medium text-slate-600 hover:bg-transparent hover:text-slate-800"
            }
            aria-current={active ? "page" : undefined}
          >
            <span
              className={
                active
                  ? "flex h-8 min-w-11 items-center justify-center rounded-lg bg-primary text-white"
                  : "flex h-8 min-w-11 items-center justify-center"
              }
            >
              <Icon className="size-6" stroke={active ? 2.2 : 1.9} />
            </span>
            {item.label}
          </Button>
        )
      })}
    </nav>
  )
}
