import { IconCircleCheckFilled, IconCircleDotFilled } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"

const base = "h-7 gap-1.5 border-0 px-3 text-[13px] font-medium [&>svg]:size-4!"

export function EntityStateBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge className={`${base} bg-[#d3edde] text-[#0f4d2c] [&>svg]:text-[#1f7d51]`}>
      <IconCircleCheckFilled />
      Activo
    </Badge>
  ) : (
    <Badge className={`${base} bg-muted text-muted-foreground`}>
      <IconCircleDotFilled />
      Inactivo
    </Badge>
  )
}
