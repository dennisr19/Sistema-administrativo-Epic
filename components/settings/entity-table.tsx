import { IconPencil } from "@tabler/icons-react"

import { EntityStateBadge } from "@/components/settings/entity-state-badge"
import { EntityToggleButton } from "@/components/settings/entity-toggle-button"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  displayValue,
  type EntityDefinition,
  type EntityKind,
  type EntityRecord,
} from "@/lib/entities"
import { cn } from "@/lib/utils"

type EntityTableProps = {
  definition: EntityDefinition
  kind: EntityKind
  records: EntityRecord[]
  usage: (record: EntityRecord) => number
  onEdit: (record: EntityRecord) => void
}

export function EntityTable({ definition, kind, records, usage, onEdit }: EntityTableProps) {
  return (
    <TooltipProvider>
      <div className="hidden min-[1400px]:block">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow className="hover:bg-muted">
              {definition.fields.map((field) => (
                <TableHead
                  key={field.key}
                  className={cn(
                    "px-3 text-[13px] text-muted-foreground first:pl-5",
                    field.width,
                    field.align === "right" && "text-right",
                    // Columna secundaria: desaparece cuando el ancho no alcanza.
                    field.secondary && "hidden 2xl:table-cell",
                  )}
                >
                  {field.label}
                </TableHead>
              ))}
              {definition.usageKey ? (
                <TableHead className="w-[90px] px-3 text-right text-[13px] text-muted-foreground">
                  Reservas
                </TableHead>
              ) : null}
              <TableHead className="w-[112px] px-3 text-[13px] text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="w-[100px]" aria-label="Acciones" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow key={record.id} className="h-[60px] border-b-0 bg-card even:bg-row-alt">
                {definition.fields.map((field, index) => (
                  <TableCell
                    key={field.key}
                    className={cn(
                      // `max-w-0` con ancho en porcentaje: sin esto la celda se
                      // estira con el contenido y la tabla se desborda.
                      "truncate px-3 text-[15px] first:pl-5",
                      field.width?.startsWith("w-[") && field.width.includes("%") && "max-w-0",
                      index === 0 ? "font-medium" : "text-muted-foreground",
                      field.align === "right" && "text-right tabular-nums",
                      field.secondary && "hidden 2xl:table-cell",
                    )}
                  >
                    {displayValue(record, field)}
                  </TableCell>
                ))}
                {definition.usageKey ? (
                  <TableCell className="px-3 text-right text-[15px] text-muted-foreground tabular-nums">
                    {usage(record)}
                  </TableCell>
                ) : null}
                <TableCell>
                  <EntityStateBadge active={record.active} />
                </TableCell>
                <TableCell className="pr-5">
                  <div className="flex items-center justify-end gap-1">
                    <EntityToggleButton
                      compact
                      kind={kind}
                      id={record.id}
                      name={record.name}
                      active={record.active}
                    />
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-lg"
                            aria-label={`Editar ${record.name}`}
                            onClick={() => onEdit(record)}
                          >
                            <IconPencil />
                          </Button>
                        }
                      />
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  )
}
