import { eq } from "drizzle-orm"
import type { Metadata } from "next"

import { PageHeader } from "@/components/page-header"
import { ProfileForm } from "@/components/profile/profile-form"
import { SignOutButton } from "@/components/profile/sign-out-button"
import { Card } from "@/components/ui/card"
import { db } from "@/db"
import { organizations } from "@/db/schema"
import { requireSession } from "@/lib/auth/server"

export const metadata: Metadata = {
  title: "Perfil | Sistema Administrativo Epic",
}

export default async function ProfilePage() {
  const session = await requireSession()
  const client = await db()
  const [organization] = await client
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, session.organizationId))

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_minmax(0,1fr)] md:gap-5">
      <PageHeader title="Perfil" subtitle="Tu cuenta y tu organización" action={null} />

      <Card className="min-h-0 gap-0 overflow-y-auto rounded-xl border-0 px-5 py-6 md:mx-auto md:w-full md:max-w-[560px] md:self-start md:px-7 md:py-7">
        <ProfileForm
          name={session.name}
          email={session.email}
          organizationName={organization?.name ?? ""}
        />

        <div className="mt-7 border-t pt-6">
          <h2 className="text-[13px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
            Sesión
          </h2>
          <p className="mt-2 mb-4 text-[15px] text-muted-foreground">
            Para volver a entrar te enviamos un código nuevo a tu correo.
          </p>
          <SignOutButton />
        </div>
      </Card>
    </div>
  )
}
