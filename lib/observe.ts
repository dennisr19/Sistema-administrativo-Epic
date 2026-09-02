import "server-only"

/**
 * Medición estructurada. `observability` ya está activo en wrangler.jsonc, así
 * que todo lo que salga por consola queda consultable en Workers Logs (y en
 * local por el explorer de wrangler), pero solo sirve si sale con una forma
 * fija: una línea JSON por operación, no texto suelto.
 *
 * Se emite una sola línea por operación para poder agrupar después por `op`
 * y comparar promedios entre despliegues.
 */
export type Medicion = {
  /** Qué se midió: el nombre de la consulta o del bloque. */
  op: string
  ms: number
  /** Filas que devolvió, cuando aplica. Es el proxy del tamaño de la respuesta. */
  filas?: number
  /** Si pasó por el Data Cache y si estaba caliente. */
  cache?: "hit" | "miss"
  organizacion?: string
}

const EVENTO = "medicion"

export function reportar({ ms, ...resto }: Medicion) {
  // `JSON.stringify` y no varios argumentos: Workers Logs indexa el objeto y
  // permite filtrar por campo en vez de hacer búsqueda de texto.
  console.log(JSON.stringify({ evento: EVENTO, ms: Math.round(ms), ...resto }))
}

/** Envuelve una operación asíncrona y reporta cuánto tardó. */
export async function medir<T>(
  op: string,
  ejecutar: () => Promise<T>,
  extra?: { organizacion?: string; filas?: (resultado: T) => number },
): Promise<T> {
  const inicio = performance.now()
  try {
    const resultado = await ejecutar()
    reportar({
      op,
      ms: performance.now() - inicio,
      organizacion: extra?.organizacion,
      filas: extra?.filas?.(resultado),
    })
    return resultado
  } catch (error) {
    // Una consulta que falla también es un dato de rendimiento: si algo se
    // cae por timeout, sin esto solo se vería el error, no cuánto aguantó.
    reportar({
      op: `${op}:error`,
      ms: performance.now() - inicio,
      organizacion: extra?.organizacion,
    })
    throw error
  }
}
