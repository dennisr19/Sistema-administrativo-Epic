export type EntityActionState = {
  status: "idle" | "success" | "error"
  message?: string
  errors?: Record<string, string>
}

export const initialEntityActionState: EntityActionState = { status: "idle" }
