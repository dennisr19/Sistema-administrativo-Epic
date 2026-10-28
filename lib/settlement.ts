/**
 * Liquidaciones: lo que se le debe a un agente por comisión o a un guía por
 * las salidas que hizo en un rango de fechas, y qué parte ya se pagó.
 */
export type SettlementKind = "agent" | "guide"
export type SettlementStatus = "pending" | "paid" | "all"

export type SettlementFilters = {
  kind: SettlementKind
  /** Nombre del agente o guía, como en el catálogo. Vacío es "sin elegir". */
  name: string
  from: string
  to: string
  status: SettlementStatus
}

export type SettlementRow = {
  id: string
  code: string
  date: string
  time: string
  tour: string
  client: string
  hotel: string
  pax: number
  /** Tarifa por persona por pasajeros, en dólares. */
  total: number
  paid: boolean
}

export type Settlement = {
  rows: SettlementRow[]
  /** Los totales cubren todo el rango, sin importar qué estado se esté viendo. */
  summary: {
    reservations: number
    /** Salidas distintas (fecha, hora y tour): un guía cobra por salida, no por reserva. */
    departures: number
    pax: number
    income: number
    pending: number
    paid: number
  }
}

export const settlementKindLabels: Record<SettlementKind, string> = {
  agent: "Agente",
  guide: "Guía",
}

export const settlementStatusOptions: { value: SettlementStatus; label: string }[] = [
  { value: "pending", label: "Pendientes" },
  { value: "paid", label: "Pagadas" },
  { value: "all", label: "Todas" },
]

/** En la URL va en español, como el resto de los filtros de la app. */
const kindParam: Record<SettlementKind, string> = { agent: "agente", guide: "guia" }
const statusParam: Record<SettlementStatus, string> = {
  pending: "pendiente",
  paid: "pagado",
  all: "todo",
}

export type SettlementParams = {
  por?: string
  nombre?: string
  desde?: string
  hasta?: string
  estado?: string
}

const isDate = (value?: string) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))

const keyOf = <T extends string>(map: Record<T, string>, value?: string) =>
  (Object.keys(map) as T[]).find((key) => map[key] === value)

export function parseSettlementParams(
  params: SettlementParams,
  fallback: { from: string; to: string },
): SettlementFilters {
  const datesOk = isDate(params.desde) && isDate(params.hasta)
  return {
    kind: keyOf(kindParam, params.por) ?? "agent",
    name: params.nombre?.trim() ?? "",
    from: datesOk ? (params.desde as string) : fallback.from,
    to: datesOk ? (params.hasta as string) : fallback.to,
    status: keyOf(statusParam, params.estado) ?? "pending",
  }
}

export function settlementSearch(filters: SettlementFilters) {
  const search = new URLSearchParams({
    por: kindParam[filters.kind],
    desde: filters.from,
    hasta: filters.to,
    estado: statusParam[filters.status],
  })
  if (filters.name) search.set("nombre", filters.name)
  return `?${search}`
}
