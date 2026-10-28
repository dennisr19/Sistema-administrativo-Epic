"use client"

import { IconCircleCheck, IconClockHour4, IconUsers } from "@tabler/icons-react"
import { useTransition } from "react"

import { setSettlementPaidAction } from "@/app/(app)/reportes/comisiones/actions"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/format-date"
import type { SettlementKind, SettlementRow } from "@/lib/settlement"
import { cn } from "@/lib/utils"

type SettlementListProps = {
  kind: SettlementKind
  rows: SettlementRow[]
}

const money = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`

export function SettlementList({ kind, rows }: SettlementListProps) {
  const toast = useToast()
  const [pending, startTransition] = useTransition()
  const unpaid = rows.filter((row) => !row.paid)

  const mark = (ids: string[], paid: boolean) => {
    startTransition(async () => {
      const result = await setSettlementPaidAction({ kind, ids, paid })
      if (!result.ok) {
        toast.add({ type: "error", title: "No pudimos guardar el cambio. Intenta nuevamente." })
      }
    })
  }

  if (!rows.length) {
    return (
      <p className="px-5 py-12 text-center text-sm text-muted-foreground">
        No hay reservas en este estado para el periodo elegido.
      </p>
    )
  }

  return (
    <div aria-busy={pending}>
      <ul className={cn("divide-y", pending && "opacity-60")}>
        {rows.map((row) => {
          const date = formatDate(row.date)
          return (
            <li
              key={row.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 md:grid-cols-[110px_minmax(0,1fr)_72px_90px_150px] md:px-5"
            >
              <span className="text-[15px] font-semibold tabular-nums md:block">
                {date.day} {date.month}
                <span className="ml-2 text-[13px] font-normal text-muted-foreground md:ml-0 md:block">
                  {row.time}
                </span>
              </span>
              <span className="col-span-2 min-w-0 md:col-span-1 md:row-start-1 md:col-start-2">
                <span className="block truncate text-[15px] font-semibold">{row.tour}</span>
                <span className="block truncate text-[13px] text-muted-foreground">
                  {row.client} <span className="tabular-nums">{row.code}</span>
                  {row.hotel ? `, ${row.hotel}` : ""}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[15px] font-medium md:row-start-1 md:col-start-3">
                <IconUsers className="size-[18px] text-muted-foreground" />
                {row.pax}
              </span>
              <span className="text-right text-[15px] font-semibold tabular-nums md:row-start-1 md:col-start-4">
                {money(row.total)}
              </span>
              <Button
                variant={row.paid ? "secondary" : "outline"}
                className="col-span-2 h-10 justify-center gap-1.5 md:col-span-1 md:row-start-1 md:col-start-5"
                disabled={pending}
                aria-label={`${row.paid ? "Marcar pendiente" : "Marcar pagada"} ${row.code}`}
                onClick={() => mark([row.id], !row.paid)}
              >
                {row.paid ? <IconCircleCheck /> : <IconClockHour4 />}
                {row.paid ? "Pagada" : "Pendiente"}
              </Button>
            </li>
          )
        })}
      </ul>

      {unpaid.length ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 md:px-5">
          <span className="text-[13px] text-muted-foreground">
            {money(unpaid.reduce((sum, row) => sum + row.total, 0))} facturado sin liquidar
          </span>
          <Button
            disabled={pending}
            onClick={() =>
              mark(
                unpaid.map((row) => row.id),
                true,
              )
            }
          >
            <IconCircleCheck />
            {unpaid.length === 1
              ? "Marcar la pendiente como pagada"
              : `Marcar las ${unpaid.length} pendientes como pagadas`}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
