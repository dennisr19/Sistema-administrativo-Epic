import { IconCompass } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

/** La marca sola. En la entrada carga el nombre el titular, no el logotipo. */
export function AppMark({ large = false }: { large?: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-primary text-primary-foreground",
        large ? "size-14" : "size-9",
      )}
    >
      <IconCompass className={large ? "size-7" : "size-5"} stroke={2.2} />
    </span>
  )
}

export function AppLogo() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <AppMark />
      <span className="truncate text-[19px] font-semibold tracking-[-0.03em]">Epic Adventures</span>
    </div>
  )
}
