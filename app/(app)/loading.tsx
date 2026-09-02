import { TodaySkeleton } from "@/components/today/today-skeleton"

/**
 * Se activa al instante al hacer clic en un ítem del sidebar, antes de que
 * el servidor responda nada — es lo que le falta a un <Suspense> dentro de
 * la página misma: ese solo pinta una vez que la respuesta ya empezó a
 * llegar. Sin este archivo, el clic se sentía "atorado": la pantalla
 * anterior se quedaba congelada hasta que la nueva llegaba completa.
 */
export default function Loading() {
  return <TodaySkeleton />
}
