import { z } from "zod"

/** El formulario habla de nombres; el servidor los resuelve a llaves foráneas. */
export const reservationInputSchema = z.object({
  id: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(120).optional(),
  ),
  tour: z.string().trim().min(1, "Elige el tour."),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Indica la fecha de salida."),
  time: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, "Indica la hora de salida."),
  pax: z.coerce.number().int().min(1, "Indica cuántos pasajeros van.").max(200),
  client: z.string().trim().min(1, "Escribe el nombre del cliente.").max(160),
  hotel: z.string().trim().max(160).default(""),
  pickup: z.string().trim().max(300).default(""),
  agent: z.string().trim().max(160).default(""),
  guide: z.string().trim().max(160).default(""),
  driver: z.string().trim().max(160).default(""),
  rate: z.coerce.number().min(0, "Usa solo números.").max(1_000_000).default(0),
  deposit: z.coerce.number().min(0, "Usa solo números.").max(1_000_000).default(0),
  /** Viajan como JSON en un campo oculto: `FormData` no lleva arreglos. */
  meals: z
    .string()
    .default("[]")
    .transform((value) => JSON.parse(value))
    .pipe(
      z.array(z.object({ option: z.string().trim().min(1), quantity: z.number().int().min(1) })),
    ),
  tickets: z
    .string()
    .default("[]")
    .transform((value) => JSON.parse(value))
    .pipe(
      z.array(
        z.object({
          passport: z.string().trim().max(60),
          name: z.string().trim().max(160),
          kind: z.enum(["adulto", "niño"]),
        }),
      ),
    ),
  paymentPending: z.boolean().default(false),
  status: z.enum(["confirmed", "completed", "cancelled"]).default("confirmed"),
  notes: z.string().trim().max(2000).default(""),
})

export type ReservationInput = z.infer<typeof reservationInputSchema>

export type ReservationFormState = {
  status: "idle" | "success" | "error"
  message?: string
  errors?: Record<string, string>
}

export const initialReservationFormState: ReservationFormState = { status: "idle" }
