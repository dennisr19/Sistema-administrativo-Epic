"use client"

import { IconArrowRight, IconLoader2 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

/**
 * La acción vive dentro del campo: un solo objeto en pantalla en vez de un
 * campo y un botón compitiendo. Mide 44px, el mínimo táctil, dentro de un
 * campo de 56 que le deja aire.
 *
 * Se centra con `bottom`, no con `-translate-y-1/2`: el botón base usa
 * `active:translate-y-px` al presionar, que pisaba ese transform y hacía caer
 * el botón media altura, tan lejos que el clic ni siquiera completaba.
 */
export function InlineSubmit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <Button
      type="submit"
      size="icon-lg"
      className="absolute right-1.5 bottom-1.5"
      disabled={pending}
      aria-label={label}
    >
      {pending ? <IconLoader2 className="animate-spin" /> : <IconArrowRight />}
    </Button>
  )
}
