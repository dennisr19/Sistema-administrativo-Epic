"use client"

import { usePathname, useRouter } from "next/navigation"

import { SegmentedTabs } from "@/components/segmented-tabs"

type Section = "/reportes" | "/reportes/comisiones"

const sections: { value: Section; label: string }[] = [
  { value: "/reportes", label: "Resumen" },
  { value: "/reportes/comisiones", label: "Comisiones" },
]

/** Las dos vistas de Reportes: el resumen del negocio y lo que se debe pagar. */
export function ReportsNav() {
  const router = useRouter()
  const pathname = usePathname()
  const current: Section = pathname.startsWith("/reportes/comisiones")
    ? "/reportes/comisiones"
    : "/reportes"

  return (
    <SegmentedTabs
      value={current}
      options={sections}
      ariaLabel="Secciones de reportes"
      onValueChange={(section) => router.push(section)}
    />
  )
}
