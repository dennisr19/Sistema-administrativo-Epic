import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { SignInForm } from "@/components/auth/sign-in-form"
import { getSession } from "@/lib/auth/server"

export const metadata: Metadata = {
  title: "Entra a Sistema Administrativo Epic",
}

const notices: Record<string, string> = {
  "sin-organizacion":
    "Tu cuenta existe pero todavía no pertenece a ninguna organización. Pídele acceso a quien administra Sistema Administrativo Epic.",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const [session, params] = await Promise.all([getSession(), searchParams])
  // Con sesión válida esta pantalla no tiene nada que hacer.
  if (session?.user.organizationId) redirect("/")

  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-10">
      <SignInForm notice={params.error ? notices[params.error] : undefined} />
    </main>
  )
}
