import "server-only"

import { and, eq, sql } from "drizzle-orm"

import { db } from "@/db"
import { agents, drivers, guides, hotels, mealOptions, tours } from "@/db/schema"
import type { EntityInput } from "@/lib/entity-validation"

const newId = (kind: EntityInput["kind"]) => `${kind}_${crypto.randomUUID()}`

export async function saveCatalogEntity(organizationId: string, input: EntityInput) {
  const client = await db()
  const updatedAt = new Date()

  switch (input.kind) {
    case "tours": {
      const values = {
        name: input.name,
        description: input.description,
        priceCents: Math.round(input.price * 100),
        kind: input.tourKind,
        includesMeals: input.includesMeals,
        updatedAt,
      }
      if (input.id) {
        return client
          .update(tours)
          .set(values)
          .where(and(eq(tours.id, input.id), eq(tours.organizationId, organizationId)))
          .returning({ id: tours.id })
      }
      return client
        .insert(tours)
        .values({ id: newId(input.kind), organizationId, ...values })
        .returning({ id: tours.id })
    }
    case "guides": {
      const values = {
        name: input.name,
        phone: input.phone,
        email: input.email,
        updatedAt,
      }
      if (input.id) {
        return client
          .update(guides)
          .set(values)
          .where(and(eq(guides.id, input.id), eq(guides.organizationId, organizationId)))
          .returning({ id: guides.id })
      }
      return client
        .insert(guides)
        .values({ id: newId(input.kind), organizationId, ...values })
        .returning({ id: guides.id })
    }
    case "drivers": {
      const values = {
        name: input.name,
        phone: input.phone,
        license: input.license,
        updatedAt,
      }
      if (input.id) {
        return client
          .update(drivers)
          .set(values)
          .where(and(eq(drivers.id, input.id), eq(drivers.organizationId, organizationId)))
          .returning({ id: drivers.id })
      }
      return client
        .insert(drivers)
        .values({ id: newId(input.kind), organizationId, ...values })
        .returning({ id: drivers.id })
    }
    case "hotels": {
      const values = {
        name: input.name,
        phone: input.phone,
        address: input.address,
        email: input.email,
        updatedAt,
      }
      if (input.id) {
        return client
          .update(hotels)
          .set(values)
          .where(and(eq(hotels.id, input.id), eq(hotels.organizationId, organizationId)))
          .returning({ id: hotels.id })
      }
      return client
        .insert(hotels)
        .values({ id: newId(input.kind), organizationId, ...values })
        .returning({ id: hotels.id })
    }
    case "agents": {
      const values = {
        name: input.name,
        phone: input.phone,
        company: input.company,
        email: input.email,
        updatedAt,
      }
      if (input.id) {
        return client
          .update(agents)
          .set(values)
          .where(and(eq(agents.id, input.id), eq(agents.organizationId, organizationId)))
          .returning({ id: agents.id })
      }
      return client
        .insert(agents)
        .values({ id: newId(input.kind), organizationId, ...values })
        .returning({ id: agents.id })
    }
    case "meals": {
      const values = { name: input.name, updatedAt }
      if (input.id) {
        return client
          .update(mealOptions)
          .set(values)
          .where(and(eq(mealOptions.id, input.id), eq(mealOptions.organizationId, organizationId)))
          .returning({ id: mealOptions.id })
      }
      return client
        .insert(mealOptions)
        .values({ id: newId(input.kind), organizationId, ...values })
        .returning({ id: mealOptions.id })
    }
  }
}

export async function toggleCatalogEntity(
  organizationId: string,
  kind: EntityInput["kind"],
  id: string,
) {
  const client = await db()
  const updatedAt = new Date()

  switch (kind) {
    case "tours":
      return client
        .update(tours)
        .set({ active: sql`NOT ${tours.active}`, updatedAt })
        .where(and(eq(tours.id, id), eq(tours.organizationId, organizationId)))
        .returning({ id: tours.id })
    case "guides":
      return client
        .update(guides)
        .set({ active: sql`NOT ${guides.active}`, updatedAt })
        .where(and(eq(guides.id, id), eq(guides.organizationId, organizationId)))
        .returning({ id: guides.id })
    case "drivers":
      return client
        .update(drivers)
        .set({ active: sql`NOT ${drivers.active}`, updatedAt })
        .where(and(eq(drivers.id, id), eq(drivers.organizationId, organizationId)))
        .returning({ id: drivers.id })
    case "hotels":
      return client
        .update(hotels)
        .set({ active: sql`NOT ${hotels.active}`, updatedAt })
        .where(and(eq(hotels.id, id), eq(hotels.organizationId, organizationId)))
        .returning({ id: hotels.id })
    case "agents":
      return client
        .update(agents)
        .set({ active: sql`NOT ${agents.active}`, updatedAt })
        .where(and(eq(agents.id, id), eq(agents.organizationId, organizationId)))
        .returning({ id: agents.id })
    case "meals":
      return client
        .update(mealOptions)
        .set({ active: sql`NOT ${mealOptions.active}`, updatedAt })
        .where(and(eq(mealOptions.id, id), eq(mealOptions.organizationId, organizationId)))
        .returning({ id: mealOptions.id })
  }
}
