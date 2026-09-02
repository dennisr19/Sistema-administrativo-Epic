export type ProfileState = {
  status: "idle" | "success" | "error"
  message?: string
  errors?: Record<string, string>
}

export const initialProfileState: ProfileState = { status: "idle" }
