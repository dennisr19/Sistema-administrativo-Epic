import { escapeXml, zip } from "@/lib/export/zip"

export type ExportFormat = "csv" | "xlsx"

/** Lo que cualquier pantalla entrega para exportar: encabezados y filas de texto. */
export type ExportTable = {
  /** Nombre del archivo sin extensión. */
  name: string
  title: string
  headers: string[]
  rows: string[][]
}

export const extensions: Record<ExportFormat, string> = { csv: "csv", xlsx: "xlsx" }

export const mimeTypes: Record<ExportFormat, string> = {
  csv: "text/csv;charset=utf-8",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}

/** Comillas dobles y BOM: es lo que hace que Excel abra bien los acentos. */
function toCsv(table: ExportTable) {
  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`
  const lines = [table.headers, ...table.rows].map((row) => row.map(cell).join(","))
  return new TextEncoder().encode(`﻿${lines.join("\r\n")}\r\n`)
}

/** Letra de columna de Excel: 0 es A, 26 es AA. */
function columnName(index: number) {
  let name = ""
  let value = index
  do {
    name = String.fromCharCode(65 + (value % 26)) + name
    value = Math.floor(value / 26) - 1
  } while (value >= 0)
  return name
}

const numeric = (value: string) => value !== "" && !Number.isNaN(Number(value))

function sheetXml(table: ExportTable) {
  const row = (cells: string[], index: number, header: boolean) => {
    const parts = cells.map((value, column) => {
      const reference = `${columnName(column)}${index + 1}`
      // Los números entran como número para que Excel pueda sumarlos.
      if (!header && numeric(value)) return `<c r="${reference}"><v>${value}</v></c>`
      return `<c r="${reference}" t="inlineStr"${header ? ' s="1"' : ""}><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`
    })
    return `<row r="${index + 1}">${parts.join("")}</row>`
  }

  const rows = [row(table.headers, 0, true), ...table.rows.map((r, i) => row(r, i + 1, false))]
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.join("")}</sheetData></worksheet>`
}

function toXlsx(table: ExportTable) {
  return zip([
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(table.title).slice(0, 31)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    },
    {
      // Un solo estilo: encabezado en negrita. Lo demás lo pone Excel.
      name: "xl/styles.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf xfId="0"/><xf xfId="0" fontId="1" applyFont="1"/></cellXfs></styleSheet>`,
    },
    { name: "xl/worksheets/sheet1.xml", content: sheetXml(table) },
  ])
}

export function buildExport(table: ExportTable, format: ExportFormat) {
  return format === "csv" ? toCsv(table) : toXlsx(table)
}
