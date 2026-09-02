"use client"

import { PageHeader } from "@/components/page-header"

export function SettingsSkeleton() {
  const pulse = "animate-pulse rounded-lg bg-muted"
  const navigationRows = ["tours", "guides", "drivers", "hotels", "agents", "meals"]
  const tableRows = ["one", "two", "three", "four", "five", "six", "seven"]

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-5">
      <PageHeader
        title="Configuración"
        subtitle="Lo que alimenta las reservas"
        action={<div className={`${pulse} h-11 w-40 rounded-lg`} />}
      />
      <div className="grid min-h-0 grid-cols-[228px_1fr] overflow-hidden rounded-xl bg-card">
        <div className="space-y-3 border-r p-4">
          {navigationRows.map((row) => (
            <div key={row} className={`${pulse} h-11 w-full rounded-full`} />
          ))}
        </div>
        <div className="space-y-3 p-6">
          {tableRows.map((row) => (
            <div key={row} className={`${pulse} h-12 w-full`} />
          ))}
        </div>
      </div>
    </div>
  )
}
