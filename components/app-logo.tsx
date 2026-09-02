import { cn } from "@/lib/utils"

/** La marca sola. En la entrada carga el nombre el titular, no el logotipo. */
export function AppMark({ large = false }: { large?: boolean }) {
  return (
    <span
      role="img"
      aria-label="Epic Adventures"
      className={cn(
        "flex items-center justify-center rounded-full bg-primary leading-none",
        large ? "size-14 text-[26px]" : "size-9 text-base",
      )}
    >
      🧭
    </span>
  )
}

export function AppLogo() {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <AppMark />
      <span className="truncate text-[19px] font-semibold tracking-[-0.03em]">
        Epic Adventures
      </span>
    </div>
  )
}
