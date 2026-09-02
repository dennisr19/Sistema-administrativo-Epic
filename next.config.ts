import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    /**
     * Router Cache del cliente. Por defecto las rutas dinámicas —y aquí lo son
     * todas, porque cada una lee la sesión de la cookie— tienen `dynamic: 0`:
     * volver a una pantalla ya visitada la vuelve a pedir entera. Con esto,
     * Reservas → Hoy → Reportes → Reservas reusa la carga anterior en vez de
     * reconstruirla.
     *
     * No sirve datos viejos después de un cambio: las Server Actions llaman a
     * `revalidatePath`, que además de la caché del servidor limpia esta.
     */
    staleTimes: { dynamic: 30, static: 180 },
  },
}

// Da acceso a los bindings de Cloudflare (D1) durante `next dev`.
initOpenNextCloudflareForDev()

export default nextConfig
