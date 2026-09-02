import { inflateRawSync } from "node:zlib"

/** Lector mínimo de .xlsx (un zip con XML). Evita una dependencia para un import de una vez. */
function entries(buffer) {
  const files = new Map()
  // El End of Central Directory está al final del archivo; se busca su firma hacia atrás.
  let end = buffer.length - 22
  while (end >= 0 && buffer.readUInt32LE(end) !== 0x06054b50) end--
  if (end < 0) throw new Error("No parece un archivo xlsx")

  let offset = buffer.readUInt32LE(end + 16)
  const count = buffer.readUInt16LE(end + 10)

  for (let index = 0; index < count; index++) {
    const nameLength = buffer.readUInt16LE(offset + 28)
    const extraLength = buffer.readUInt16LE(offset + 30)
    const commentLength = buffer.readUInt16LE(offset + 32)
    const localOffset = buffer.readUInt32LE(offset + 42)
    const compressedSize = buffer.readUInt32LE(offset + 20)
    const method = buffer.readUInt16LE(offset + 10)
    const name = buffer.toString("utf8", offset + 46, offset + 46 + nameLength)

    const localNameLength = buffer.readUInt16LE(localOffset + 26)
    const localExtraLength = buffer.readUInt16LE(localOffset + 28)
    const start = localOffset + 30 + localNameLength + localExtraLength
    const raw = buffer.subarray(start, start + compressedSize)

    files.set(name, method === 0 ? raw : inflateRawSync(raw))
    offset += 46 + nameLength + extraLength + commentLength
  }

  return files
}

const decode = (value) =>
  value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")

/** Color de relleno por índice de estilo: en estos exports el estado activo viaja en el color. */
function fillsByStyle(stylesXml) {
  const fills = [...stylesXml.matchAll(/<fill>([\s\S]*?)<\/fill>/g)].map(
    (fill) => /<fgColor[^>]*rgb="([0-9A-Fa-f]{6,8})"/.exec(fill[1])?.[1] ?? "",
  )
  const cellXfs = /<cellXfs[^>]*>([\s\S]*?)<\/cellXfs>/.exec(stylesXml)?.[1] ?? ""
  return [...cellXfs.matchAll(/<xf\b[^>]*>/g)].map((xf) => {
    const fillId = Number(/fillId="(\d+)"/.exec(xf[0])?.[1] ?? 0)
    return fills[fillId] ?? ""
  })
}

/**
 * Devuelve `{ header, rows }` donde cada fila es `{ values, fills }` por letra de columna.
 * Se conserva el color porque el export usa verde para marcar los registros activos.
 */
export function readSheet(path, readFile) {
  const files = entries(readFile(path))
  const sharedXml = files.get("xl/sharedStrings.xml")?.toString("utf8") ?? ""
  const shared = [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) =>
    decode([...match[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((text) => text[1]).join("")),
  )
  const styles = fillsByStyle(files.get("xl/styles.xml")?.toString("utf8") ?? "")
  const sheet = files.get("xl/worksheets/sheet1.xml").toString("utf8")

  const parsed = []
  for (const row of sheet.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>/g)) {
    const values = {}
    const fills = {}
    for (const cell of row[1].matchAll(/<c\b([^>]*?)(\/>|>([\s\S]*?)<\/c>)/g)) {
      const attributes = cell[1]
      const content = cell[3] ?? ""
      const column = /r="([A-Z]+)\d+"/.exec(attributes)?.[1]
      if (!column) continue

      const value = /<v>([\s\S]*?)<\/v>/.exec(content)?.[1] ?? ""
      const inline = /<is>[\s\S]*?<t[^>]*>([\s\S]*?)<\/t>/.exec(content)?.[1]
      values[column] = attributes.includes('t="s"')
        ? (shared[Number(value)] ?? "")
        : decode(inline ?? value)
      fills[column] = styles[Number(/s="(\d+)"/.exec(attributes)?.[1] ?? -1)] ?? ""
    }
    parsed.push({ values, fills })
  }

  const header = Object.fromEntries(
    Object.entries(parsed[0]?.values ?? {}).map(([column, label]) => [column, label.trim()]),
  )
  return { header, rows: parsed.slice(1) }
}
