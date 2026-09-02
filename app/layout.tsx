import type { Metadata, Viewport } from "next"
import { Geist } from "next/font/google"

import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

export const metadata: Metadata = {
  title: "Hoy | epic-ops",
  description: "Operación diaria de tours, clara y accionable.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ecf0f7",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geist.variable} scheme-light`}>
      {/* Los proveedores viven en `AppShell`: dependen de la sesión, y la
          pantalla de entrada no la tiene. */}
      <body className="h-svh overflow-hidden font-sans antialiased">{children}</body>
    </html>
  )
}
