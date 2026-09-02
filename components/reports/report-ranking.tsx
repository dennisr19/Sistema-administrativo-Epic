"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import type { Ranking } from "@/lib/report-metrics"

type ReportRankingProps = {
  title: string
  question: string
  rows: Ranking[]
  format: (value: number) => string
}

/**
 * Tarjeta propia por ranking. La posición va numerada y la barra codifica la
 * proporción real contra el primero, así que no es decoración.
 */
export function ReportRanking({ title, question, rows, format }: ReportRankingProps) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? rows : rows.slice(0, 3)

  return (
    <section className="flex min-w-0 flex-col rounded-xl bg-card px-5 py-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h3>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{question}</p>
        </div>
        {rows.length > 3 ? (
          <Button
            variant="ghost"
            className="-mt-2 -mr-2 h-11 shrink-0 px-3 text-[13px] font-medium text-secondary-foreground hover:text-secondary-foreground"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? "Ver menos" : "Ver todos"}
          </Button>
        ) : null}
      </div>

      <ol className="mt-4 grid gap-3.5">
        {visible.length ? (
          visible.map((row, index) => (
            // `min-w-0`: sin esto el ítem de grid no baja de su ancho
            // intrínseco y la cifra se sale de la tarjeta.
            <li key={row.label} className="grid min-w-0 gap-1.5">
              <div className="flex min-w-0 items-baseline gap-2.5">
                <span className="w-4 shrink-0 text-[13px] text-muted-foreground tabular-nums">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{row.label}</span>
                <span className="shrink-0 text-[15px] font-semibold tabular-nums">
                  {format(row.value)}
                </span>
              </div>
              <div className="flex items-center gap-3 pl-[26px]">
                <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(6, Math.round(row.share * 100))}%` }}
                  />
                </div>
                <span className="shrink-0 text-[13px] text-muted-foreground tabular-nums">
                  {row.detail}
                </span>
              </div>
            </li>
          ))
        ) : (
          <li className="text-[13px] text-muted-foreground">Sin datos en este periodo.</li>
        )}
      </ol>
    </section>
  )
}
