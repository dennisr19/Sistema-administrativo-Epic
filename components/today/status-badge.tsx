import {
  IconCar,
  IconChecks,
  IconCircleX,
  IconClockDollar,
  IconFlag,
  IconUserQuestion,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import type { OperationalIssue, ReservationStatus } from "@/lib/reservation"

/**
 * Relleno pastel, texto del mismo tono y un icono que dice de qué va sin leer.
 *
 * Los rellenos son más profundos que un pastel de catálogo por una razón
 * concreta: estos badges viven sobre filas rayadas, y un tono más claro se
 * confundía con la fila. Cada relleno queda al menos en 1.25 contra la fila
 * alterna, y cada texto sobre 5.5 contra su relleno.
 */
const states = {
  confirmed: {
    label: "Confirmada",
    icon: IconChecks,
    className: "bg-[#bce6cd] text-[#14532d]",
  },
  completed: { label: "Completada", icon: IconFlag, className: "bg-[#d3ddec] text-[#1e293b]" },
  cancelled: { label: "Cancelada", icon: IconCircleX, className: "bg-[#f9c9c9] text-[#991b1b]" },
  guide: { label: "Sin guía", icon: IconUserQuestion, className: "bg-[#fad297] text-[#7c2d12]" },
  driver: { label: "Sin chofer", icon: IconCar, className: "bg-[#c2d9fc] text-[#1e40af]" },
  payment: { label: "Por cobrar", icon: IconClockDollar, className: "bg-[#d8d0fa] text-[#5b21b6]" },
} satisfies Record<OperationalIssue | ReservationStatus, unknown>

type StatusBadgeProps = {
  issue?: OperationalIssue
  status?: ReservationStatus
}

// Una reserva viva muestra lo accionable; una cerrada muestra en qué terminó.
export function StatusBadge({ issue, status = "confirmed" }: StatusBadgeProps) {
  const key = status === "confirmed" ? (issue ?? "confirmed") : status
  const state = states[key]
  const Icon = state.icon

  return (
    <Badge
      className={`h-7 gap-1.5 border-0 px-2.5 text-[13px] font-medium [&>svg]:size-4! ${state.className}`}
    >
      {/* El icono hereda el color del texto, que ya está medido sobre el relleno. */}
      <Icon stroke={2.2} />
      {state.label}
    </Badge>
  )
}
