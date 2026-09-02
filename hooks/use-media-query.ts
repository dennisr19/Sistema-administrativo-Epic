"use client"

import { useSyncExternalStore } from "react"

/**
 * Los formularios de crear y editar no pueden montar dos copias de los mismos campos:
 * duplicaría los `id` y rompería las etiquetas. Aquí se decide cuál se renderiza.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", onChange)
      return () => list.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
