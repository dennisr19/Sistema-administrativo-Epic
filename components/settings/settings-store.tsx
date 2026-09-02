"use client"

import { createContext, type ReactNode, useContext, useRef } from "react"
import { createStore, useStore } from "zustand"

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

const createSettingsStore = () =>
  createStore<SettingsUiState>((set) => ({
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

type SettingsStoreApi = ReturnType<typeof createSettingsStore>

const SettingsStoreContext = createContext<SettingsStoreApi | null>(null)

/**
 * Una instancia del store por montaje del árbol, no un singleton de módulo.
 * En Cloudflare Workers un mismo isolate atiende requests de usuarios
 * distintos; un `create()` a nivel de módulo compartiría su estado entre
 * ellos en cuanto algo lo mutara desde código de servidor. Con el store
 * creado dentro del Provider, cada request (cada montaje de
 * `SettingsWorkspace`) tiene el suyo, aislado por diseño y no por cuidado.
 */
export function SettingsStoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<SettingsStoreApi>(null)
  storeRef.current ??= createSettingsStore()

  return (
    <SettingsStoreContext.Provider value={storeRef.current}>
      {children}
    </SettingsStoreContext.Provider>
  )
}

export function useSettingsStore<T>(selector: (state: SettingsUiState) => T): T {
  const store = useContext(SettingsStoreContext)
  if (!store) {
    throw new Error("useSettingsStore se usó fuera de <SettingsStoreProvider>.")
  }
  return useStore(store, selector)
}
