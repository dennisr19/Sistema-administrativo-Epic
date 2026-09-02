import { type NextRequest, NextResponse } from "next/server"

/**
 * Nombre de la cookie de sesión de Better Auth. En HTTPS lleva el prefijo
 * `__Secure-`. Se lee a mano para no importar la librería aquí: eso arrastraba
 * el runtime de Node, que en Cloudflare es experimental.
 */
const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"]

/**
 * Comprobación optimista: aquí solo se mira si existe la cookie, sin tocar la
 * base ni validar la firma. La verificación real la hace `requireSession()` en
 * cada página y en cada Server Action, que es donde de verdad importa.
 */
export function proxy(request: NextRequest) {
  const signedIn = SESSION_COOKIES.some((name) => request.cookies.has(name))
  if (signedIn) return NextResponse.next()

  return NextResponse.redirect(new URL("/sign-in", request.url))
}

export const config = {
  // Todo lo de la app, menos la pantalla de entrada, la API de auth y los estáticos.
  matcher: [
    "/((?!sign-in|sign-up|api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)",
  ],
}
