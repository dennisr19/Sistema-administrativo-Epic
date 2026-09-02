"use client"

import { IconLogout } from "@tabler/icons-react"
import { useActionState } from "react"

import { signOutAction } from "@/app/(app)/perfil/actions"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const [, action, pending] = useActionState(async () => {
    await signOutAction()
  }, null)

  return (
    <form action={action}>
      <Button type="submit" variant="outline" size="lg" className="gap-2" disabled={pending}>
        <IconLogout className="size-[18px]" />
        {pending ? "Cerrando" : "Cerrar sesión"}
      </Button>
    </form>
  )
}
