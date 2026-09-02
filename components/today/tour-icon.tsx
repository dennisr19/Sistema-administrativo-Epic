import { IconBuilding, IconMountain, IconSailboat, IconTrees } from "@tabler/icons-react"

import type { TourKind } from "@/lib/reservation"

const iconByKind = {
  mountain: IconMountain,
  water: IconSailboat,
  nature: IconTrees,
  city: IconBuilding,
}

const classByKind = {
  mountain: "bg-[#fff3e2] text-[#b36c12]",
  water: "bg-[#e8f5ff] text-[#2779b7]",
  nature: "bg-[#eaf8ef] text-[#3d8b5c]",
  city: "bg-[#f0edff] text-[#7259bd]",
}

export function TourIcon({ kind }: { kind: TourKind }) {
  const Icon = iconByKind[kind]

  return (
    <span
      className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${classByKind[kind]}`}
    >
      <Icon className="size-6" stroke={1.8} />
    </span>
  )
}
