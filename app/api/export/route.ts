import { requireSession } from "@/lib/auth/server"
import { type EntityKind, entityKinds } from "@/lib/entities"
import { buildExport, type ExportFormat, extensions, mimeTypes } from "@/lib/export/formats"
import {
  catalogTable,
  exportFileName,
  operationTable,
  reservationsTable,
} from "@/lib/export/tables"
import { parseReservationParams } from "@/lib/reservation-search-params"
import { presetRange } from "@/lib/today"

const formats: ExportFormat[] = ["csv", "xlsx"]

/**
 * La descarga es una ruta y no una Server Action porque el navegador tiene que
 * recibir un archivo con su nombre, no una respuesta que haya que armar.
 */
export async function GET(request: Request) {
  const { organizationId } = await requireSession()
  const params = new URL(request.url).searchParams

  const format = params.get("formato") as ExportFormat
  if (!formats.includes(format)) return new Response("Formato no válido", { status: 400 })

  const table = await tableFor(organizationId, params)
  if (!table) return new Response("No hay nada que exportar aquí", { status: 400 })

  const bytes = buildExport(table, format)
  return new Response(bytes as BodyInit, {
    headers: {
      "content-type": mimeTypes[format],
      "content-disposition": `attachment; filename="${exportFileName(table, extensions[format])}"`,
      // Un export siempre se arma con lo que hay ahora.
      "cache-control": "no-store",
    },
  })
}

function tableFor(organizationId: string, params: URLSearchParams) {
  const kind = params.get("tipo")

  if (kind === "reservas") {
    const { filters } = parseReservationParams(Object.fromEntries(params))
    return reservationsTable(organizationId, filters)
  }

  if (kind === "hoy") {
    const from = params.get("desde")
    const to = params.get("hasta")
    const range = from && to ? { from, to } : presetRange("today")
    return operationTable(organizationId, range)
  }

  if (kind === "catalogo") {
    const entity = params.get("entidad") as EntityKind
    if (!entityKinds.includes(entity)) return null
    return catalogTable(organizationId, entity)
  }

  return null
}
