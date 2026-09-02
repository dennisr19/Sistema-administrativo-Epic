import "server-only"

import { unstable_cache } from "next/cache"

import { medir, reportar } from "@/lib/observe"

/**
 * `unstable_cache` con la organización dentro de la llave y de las etiquetas.
 *
 * Las etiquetas no pueden ser dinámicas si se declara el cache una sola vez a
 * nivel de módulo, así que se construye por llamada: Next lo identifica por
 * `keyParts`, de modo que dos llamadas con la misma organización comparten
 * entrada y dos organizaciones distintas nunca se cruzan.
 *
 * `revalidate` es un techo de seguridad, no el mecanismo principal: lo normal
 * es que la entrada muera por `revalidateTag` cuando algo cambia de verdad.
 */
export function cachedPerOrganization<T>(
  name: string,
  organizationId: string,
  load: () => Promise<T>,
  options: {
    tags: string[]
    revalidate: number
    /**
     * Todo lo demás de lo que dependa el resultado. Va en la llave, no en la
     * etiqueta: una consulta que calcula "hoy" por dentro tiene que llevar la
     * fecha aquí, o al pasar la medianoche seguiría sirviendo lo de ayer.
     */
    key?: string[]
  },
): Promise<T> {
  const { key = [], ...cacheOptions } = options

  // El loader corre solo cuando la entrada no estaba: si al terminar esta
  // bandera sigue en falso, la respuesta salió del cache. Es la única forma
  // de distinguir hit de miss, porque `unstable_cache` no lo informa.
  let ejecutado = false
  const inicio = performance.now()

  const envuelto = unstable_cache(
    async () => {
      ejecutado = true
      return load()
    },
    [name, organizationId, ...key],
    cacheOptions,
  )

  return envuelto().then((resultado) => {
    reportar({
      op: `cache:${name}`,
      ms: performance.now() - inicio,
      cache: ejecutado ? "miss" : "hit",
      organizacion: organizationId,
    })
    return resultado
  })
}

export { medir }
