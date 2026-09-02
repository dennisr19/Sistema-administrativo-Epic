import Link from "next/link"

import { AppLogo } from "@/components/app-logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { initials } from "@/lib/initials"

export function MobileHeader({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
      <AppLogo />
      <Button
        variant="ghost"
        size="icon-lg"
        nativeButton={false}
        render={<Link href="/perfil" />}
        aria-label={`Perfil de ${name}`}
      >
        <Avatar>
          <AvatarFallback className="bg-secondary font-semibold text-secondary-foreground">
            {initials(name)}
          </AvatarFallback>
        </Avatar>
      </Button>
    </header>
  )
}
