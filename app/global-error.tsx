"use client"

import "./globals.css"

/**
 * Único boundary que reemplaza `<html>`/`<body>` enteros: solo se monta si el
 * layout raíz mismo falla, algo que no debería pasar en producción pero que
 * de pasar no puede caer en la pantalla en blanco de Next.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="es" className="scheme-light">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center font-sans antialiased">
        <div className="grid gap-1">
          <p className="font-semibold">Algo salió mal</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            No pudimos cargar Sistema Administrativo Epic. Intenta de nuevo en un momento.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Reintentar
        </button>
      </body>
    </html>
  )
}
