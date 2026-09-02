import type { Icon } from "@tabler/icons-react"

import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { Card } from "@/components/ui/card"

type ComingSoonProps = {
  title: string
  subtitle: string
  icon: Icon
  description: string
}

/** Ruta declarada en la navegación pero todavía sin construir. No es un 404. */
export function ComingSoon({ title, subtitle, icon: Icon, description }: ComingSoonProps) {
  return (
    <AppShell>
      <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)] gap-0 md:grid-rows-[auto_minmax(0,1fr)] md:gap-5">
        <PageHeader title={title} subtitle={subtitle} />
        <Card className="grid min-h-0 place-items-center rounded-xl border-0 px-6 py-16 text-center">
          <div className="max-w-sm">
            <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Icon className="size-6" />
            </span>
            <h2 className="text-xl font-semibold tracking-[-0.025em] md:hidden">{title}</h2>
            <p className="mt-1 text-[15px] text-muted-foreground">{description}</p>
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
