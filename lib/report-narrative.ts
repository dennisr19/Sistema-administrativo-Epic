import type { ReportMetrics } from "@/lib/report-metrics"

export type NarrativePart = { text: string; emphasis?: "up" | "down" | "neutral" }

export type Narrative = {
  trend: "up" | "down" | "flat"
  parts: NarrativePart[]
}

type Shape = "up" | "down" | "flat"

const shape = (value: number): Shape => (Math.abs(value) < 2 ? "flat" : value > 0 ? "up" : "down")

/**
 * Resumen por reglas, no por modelo: qué pasó con el dinero, con el volumen y quién lideró.
 * Devuelve piezas para poder destacar las cifras en vez de entregar un párrafo plano.
 */
export function summarize(report: ReportMetrics): Narrative {
  const lead = report.topTours[0]

  if (!report.reservations && !report.cancelled.count) {
    return { trend: "flat", parts: [{ text: "No hubo operación en este periodo." }] }
  }

  if (report.deltas.income === null || report.deltas.reservations === null) {
    return {
      trend: "flat",
      parts: [
        { text: "Sin periodo anterior comparable. Se facturaron " },
        { text: `$${report.income.toLocaleString("en-US")}`, emphasis: "neutral" },
        { text: ` en ${report.reservations} reservas` },
        ...(lead ? [{ text: `, y ${lead.label} fue el tour con mayor facturación` }] : []),
        { text: "." },
      ],
    }
  }

  const income: Shape = shape(report.deltas.income)
  const volume: Shape = shape(report.deltas.reservations)
  const verb: Record<Shape, string> = { up: "subieron", down: "bajaron", flat: "se mantuvieron" }
  const volumeVerb: Record<Shape, string> = {
    up: "aumentaron",
    down: "cayeron",
    flat: "se mantuvieron",
  }
  // El verbo ya lleva el signo: "bajaron -5%" sería un doble negativo.
  const pct = (value: number) => `${Math.abs(value)}%`

  return {
    trend: income,
    parts: [
      { text: `Los ingresos ${verb[income]}` },
      ...(income === "flat"
        ? []
        : ([
            { text: " " },
            { text: pct(report.deltas.income), emphasis: income },
          ] as NarrativePart[])),
      { text: ` mientras las reservas ${volumeVerb[volume]}` },
      ...(volume === "flat"
        ? []
        : ([
            { text: " " },
            { text: pct(report.deltas.reservations), emphasis: volume },
          ] as NarrativePart[])),
      { text: "." },
      ...(lead
        ? [
            { text: " " },
            { text: lead.label, emphasis: "neutral" as const },
            { text: " fue el tour con mayor facturación." },
          ]
        : []),
    ],
  }
}
