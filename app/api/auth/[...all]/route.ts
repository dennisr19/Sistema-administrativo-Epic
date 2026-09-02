import { getAuth } from "@/lib/auth/server"

/** Better Auth resuelve sus propias rutas: enviar código, verificarlo, cerrar sesión. */
const handler = async (request: Request) => {
  const auth = await getAuth()
  return auth.handler(request)
}

export { handler as GET, handler as POST }
