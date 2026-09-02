import { relations, sql } from "drizzle-orm"
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

/** Todas las tablas cuelgan de una organización: un operador no ve datos de otro. */
export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
})

/** Columnas que repite todo catálogo: pertenencia, estado y rastro temporal. */
const catalogColumns = {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // Los registros se desactivan, nunca se borran: las reservas viejas los siguen citando.
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
}

export const tours = sqliteTable(
  "tours",
  {
    ...catalogColumns,
    description: text("description"),
    priceCents: integer("price_cents").notNull().default(0),
    /** Define el color del icono en las listas. Sin dato en el histórico. */
    kind: text("kind", { enum: ["nature", "mountain", "water", "city"] }),
    /** Si el tour no la incluye, la reserva no pregunta por alimentación. */
    includesMeals: integer("includes_meals", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [
    index("tours_by_organization").on(table.organizationId),
    uniqueIndex("tours_by_name").on(table.organizationId, table.name),
  ],
)

export const guides = sqliteTable(
  "guides",
  { ...catalogColumns, phone: text("phone"), email: text("email") },
  (table) => [
    index("guides_by_organization").on(table.organizationId),
    uniqueIndex("guides_by_name").on(table.organizationId, table.name),
  ],
)

export const drivers = sqliteTable(
  "drivers",
  { ...catalogColumns, phone: text("phone"), license: text("license") },
  (table) => [
    index("drivers_by_organization").on(table.organizationId),
    uniqueIndex("drivers_by_name").on(table.organizationId, table.name),
  ],
)

export const hotels = sqliteTable(
  "hotels",
  { ...catalogColumns, phone: text("phone"), address: text("address"), email: text("email") },
  (table) => [
    index("hotels_by_organization").on(table.organizationId),
    uniqueIndex("hotels_by_name").on(table.organizationId, table.name),
  ],
)

export const agents = sqliteTable(
  "agents",
  { ...catalogColumns, phone: text("phone"), company: text("company"), email: text("email") },
  (table) => [
    index("agents_by_organization").on(table.organizationId),
    uniqueIndex("agents_by_name").on(table.organizationId, table.name),
  ],
)

export const mealOptions = sqliteTable(
  "meal_options",
  { ...catalogColumns, priceCents: integer("price_cents").notNull().default(0) },
  (table) => [
    index("meal_options_by_organization").on(table.organizationId),
    uniqueIndex("meal_options_by_name").on(table.organizationId, table.name),
  ],
)

export const reservationStatuses = ["confirmed", "completed", "cancelled"] as const

export const reservations = sqliteTable(
  "reservations",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    /** Consecutivo visible para el operador, `T113` en la app actual. */
    code: text("code").notNull(),
    /** Fecha y hora de salida por separado: se filtra por día y se ordena por hora. */
    date: text("date").notNull(),
    time: text("time"),
    customerName: text("customer_name").notNull(),
    people: integer("people").notNull().default(1),
    /**
     * Entradas vendidas. `reservation_tickets` guarda el detalle por persona
     * cuando el tour exige registrar pasaportes; este número es la cantidad.
     */
    ticketCount: integer("ticket_count").notNull().default(0),
    tourId: text("tour_id").references(() => tours.id),
    hotelId: text("hotel_id").references(() => hotels.id),
    /** Texto libre: no todas las recogidas son un hotel del catálogo. */
    pickupPoint: text("pickup_point"),
    driverId: text("driver_id").references(() => drivers.id),
    guideId: text("guide_id").references(() => guides.id),
    agentId: text("agent_id").references(() => agents.id),
    netRateCents: integer("net_rate_cents").notNull().default(0),
    depositCents: integer("deposit_cents").notNull().default(0),
    /**
     * Lo marca el operador, no se deduce del depósito: una reserva puede estar
     * sin depósito y cobrada a cuenta del agente.
     */
    paymentPending: integer("payment_pending", { mode: "boolean" }).notNull().default(false),
    note: text("note"),
    status: text("status", { enum: reservationStatuses }).notNull().default("confirmed"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => [
    // La pantalla de Hoy y los rangos de Reservas leen siempre por organización y fecha.
    index("reservations_by_date").on(table.organizationId, table.date),
    uniqueIndex("reservations_by_code").on(table.organizationId, table.code),
    index("reservations_by_tour").on(table.tourId),
    index("reservations_by_guide").on(table.guideId),
    index("reservations_by_driver").on(table.driverId),
    index("reservations_by_agent").on(table.agentId),
  ],
)

export const reservationMeals = sqliteTable(
  "reservation_meals",
  {
    id: text("id").primaryKey(),
    reservationId: text("reservation_id")
      .notNull()
      .references(() => reservations.id, { onDelete: "cascade" }),
    mealOptionId: text("meal_option_id")
      .notNull()
      .references(() => mealOptions.id),
    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [index("reservation_meals_by_reservation").on(table.reservationId)],
)

export const reservationTickets = sqliteTable(
  "reservation_tickets",
  {
    id: text("id").primaryKey(),
    reservationId: text("reservation_id")
      .notNull()
      .references(() => reservations.id, { onDelete: "cascade" }),
    passport: text("passport"),
    name: text("name"),
    kind: text("kind"),
  },
  (table) => [index("reservation_tickets_by_reservation").on(table.reservationId)],
)

export const reservationRelations = relations(reservations, ({ one, many }) => ({
  tour: one(tours, { fields: [reservations.tourId], references: [tours.id] }),
  hotel: one(hotels, { fields: [reservations.hotelId], references: [hotels.id] }),
  driver: one(drivers, { fields: [reservations.driverId], references: [drivers.id] }),
  guide: one(guides, { fields: [reservations.guideId], references: [guides.id] }),
  agent: one(agents, { fields: [reservations.agentId], references: [agents.id] }),
  meals: many(reservationMeals),
  tickets: many(reservationTickets),
}))

export const reservationMealRelations = relations(reservationMeals, ({ one }) => ({
  reservation: one(reservations, {
    fields: [reservationMeals.reservationId],
    references: [reservations.id],
  }),
  option: one(mealOptions, {
    fields: [reservationMeals.mealOptionId],
    references: [mealOptions.id],
  }),
}))

export const reservationTicketRelations = relations(reservationTickets, ({ one }) => ({
  reservation: one(reservations, {
    fields: [reservationTickets.reservationId],
    references: [reservations.id],
  }),
}))

export type Reservation = typeof reservations.$inferSelect
export type NewReservation = typeof reservations.$inferInsert
