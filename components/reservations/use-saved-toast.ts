"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"

import { useToast } from "@/components/ui/toast"

const messages: Record<string, string> = {
  creada: "Reserva creada",
  actualizada: "Reserva actualizada",
}

/**
 * `saveReservationAction` termina en un `redirect()` del lado del servidor:
 * el formulario nunca ve un estado de éxito que mostrar. La bandera llega
 * en la URL en su lugar. Sí amerita un Effect — es una entrada puntual a la
 * ruta, no algo derivable del render, y limpia la URL después para que un
 * refresh no repita el toast.
 */
export function useSavedToast() {
  const params = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const toast = useToast()
  const flag = params.get("creada") ? "creada" : params.get("actualizada") ? "actualizada" : null

  // Solo debe correr cuando cambia la bandera misma: `params`/`router`/
  // `pathname`/`toast` son nuevas instancias en cada render pero describen
  // la misma navegación, incluirlas dispararía esto de nuevo sin motivo.
  // biome-ignore lint/correctness/useExhaustiveDependencies: ver comentario arriba
  useEffect(() => {
    if (!flag) return
    toast.add({ type: "success", title: messages[flag] })

    const next = new URLSearchParams(params)
    next.delete(flag)
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false })
  }, [flag])
}
