"use client"

import { create } from "zustand"

type SettingsUiState = {
  page: number
  /** Búsqueda dentro del catálogo abierto. */
  query: string
  openOnMobile: boolean
  creating: boolean
  editingId: string | null
  setPage: (page: number) => void
  setQuery: (query: string) => void
  selectKind: () => void
  startCreating: () => void
  startEditing: (id: string) => void
  closeForm: () => void
  closeMobile: () => void
}

export const useSettingsStore = create<SettingsUiState>((set) => ({
  page: 1,
  query: "",
  openOnMobile: false,
  creating: false,
  editingId: null,
  setPage: (page) => set({ page }),
  // Al buscar se vuelve a la primera página: si no, la lista sale vacía.
  setQuery: (query) => set({ query, page: 1 }),
  selectKind: () =>
    set({ page: 1, query: "", openOnMobile: true, creating: false, editingId: null }),
  startCreating: () => set({ creating: true, editingId: null }),
  startEditing: (editingId) => set({ creating: false, editingId }),
  closeForm: () => set({ creating: false, editingId: null }),
  closeMobile: () => set({ openOnMobile: false }),
}))
