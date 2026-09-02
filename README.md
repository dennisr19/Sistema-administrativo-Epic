# Sistema Administrativo Epic

Herramienta ligera para operar tours. Cinco pantallas, `Hoy`, `Reservas`, `Reportes`,
`Configuración` y `Perfil`, sobre Next.js (App Router, Server Actions), React 19, Drizzle + D1,
shadcn con Base UI, Tailwind CSS y Tabler Icons. Corre en Cloudflare Workers vía OpenNext.

La definición funcional, las decisiones visuales y el alcance están en [`PRODUCT.md`](./PRODUCT.md).
Lo que falta por construir está listado abajo, en [Estado actual](#estado-actual).

## Desarrollo local

```bash
npm install
npm run db:reset
npm run dev
```

`db:reset` crea la base D1 local, aplica las migraciones y carga los datos reales importados de la
app anterior. `next dev` accede a esa base a través del binding `DB` — no hay mocks, todas las
pantallas leen y escriben contra D1 desde `db/queries` y `db/mutations`.

Para entrar: el login es sin contraseña, por código a un correo (`lib/auth/email.ts`). Sin
`RESEND_API_KEY` en `.dev.vars`, el código no se envía — se imprime en la consola del servidor
(`next dev`), así que el login funciona en local sin depender de Resend. Necesitas un usuario ya
creado (ver `npm run db:user` más abajo); no hay alta pública.

## Datos

Los seis exports de la app actual se normalizan con:

```bash
npm run import:seed ~/Downloads
```

El script escribe `data/seed/`, una JSON por tabla más un `seed.sql` para D1, y deja en
`data/seed/REPORT.md` cada decisión que tomó. Es idempotente.

## Base de datos

| Comando | Qué hace |
| --- | --- |
| `npm run db:generate` | Genera una migración desde `db/schema.ts` |
| `npm run db:migrate` | Aplica migraciones a la base local |
| `npm run db:seed` | Carga `data/seed/seed.sql` |
| `npm run db:reset` | Borra la base local y la reconstruye |
| `npm run db:sql "select ..."` | Consulta suelta contra la base local |

## Verificación

```bash
npm run check:full
```

Corre guardrails (nada de CSS a mano, componentes chicos, contenedores consistentes), Biome,
`tsc` y el build de Next, en ese orden — el mismo camino que [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
corre en cada push a `main` y cada PR. `main` despliega directo a Cloudflare sin ambiente de
staging de por medio, así que ese workflow es el único gate antes de producción.

## Medición

Cada consulta a D1 y cada lectura del Data Cache emite una línea JSON con
`evento: "medicion"`. Como `observability` está activo en `wrangler.jsonc`,
quedan consultables en Workers Logs sin configurar nada más.

Los campos: `op` (qué se midió), `ms`, `filas` (el proxy del tamaño de la
respuesta) y `cache` (`hit` o `miss`).

En local, contra el worker real:

```bash
npm run cf:build && npx wrangler dev
```

Y en otra terminal, después de navegar:

```bash
grep -o '{"evento":"medicion".*}' <(npx wrangler tail --format json)
```

Sirve para responder tres preguntas concretas: si una consulta se está
trayendo más filas de las que pinta, si el cache está pegando o fallando
siempre, y qué operación domina el tiempo de una pantalla.

## Estado actual

Construido y en uso: las cinco pantallas, autenticación por código, exportar a Excel/CSV, todo el
CRUD de reservas y catálogos, reportes con comparación de periodo.

Documentado como pendiente en [`PRODUCT.md`](./PRODUCT.md#exportación-pendiente) y sin construir
todavía:

- Exportar a Word, XML e imprimir en PDF (hoy solo Excel y CSV).
- Alta de usuarios: no hay pantalla para invitar o crear un usuario nuevo en una organización
  existente — la única forma es `npm run db:user` desde la terminal. Antes de sumar a alguien más
  al equipo, esto es lo primero que hace falta.
- Zona horaria, moneda e idioma por organización (hoy fijos a Costa Rica / USD / español).
- Auditoría de cambios, políticas finales de sesión y necesidades offline: sin definir.

## Primera vez en una cuenta de Cloudflare nueva

`wrangler.jsonc` ya trae el `account_id` y el `database_id` de la cuenta donde vive esto hoy. Para
moverlo a una cuenta de Cloudflare distinta, con `npx wrangler login` ya autenticado contra la
cuenta destino:

```bash
npx wrangler whoami                    # copiar el Account ID que muestra
npx wrangler d1 create sistema-administrativo-epic # copiar el database_id que devuelve
```

Pegar ambos en `wrangler.jsonc`, en `account_id` y en `d1_databases[0].database_id`.

Después, migrar y cargar los datos reales en la base remota:

```bash
npx wrangler d1 migrations apply sistema-administrativo-epic --remote
npx wrangler d1 execute sistema-administrativo-epic --remote --file data/seed/seed.sql
```

No hay alta pública: la primera cuenta se crea a mano.

```bash
npm run db:user -- correo@ejemplo.com "Nombre Apellido" --remote
```

Los valores sensibles se guardan como secretos del Worker y nunca viven en el repo:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))" | npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put RESEND_API_KEY
```

`BETTER_AUTH_URL` y `RESEND_FROM` son configuración pública y viven en `wrangler.jsonc`.
Better Auth usa el dominio `workers.dev` de producción como origen canónico. `RESEND_FROM` usa
el dominio verificado `epicadventurescr.com`, por lo que puede enviar códigos a todos los
administradores.

Por último, conectar el repo a **Workers Builds** en el dashboard de Cloudflare (Workers &
Pages → el Worker → Settings → Build), con:

| Campo | Valor |
| --- | --- |
| Build command | `npm run cf:build` |
| Deploy command | `npx wrangler deploy` |

Un push a `main` despliega solo a partir de ahí. Para desplegar a mano:

```bash
npm run cf:build && npm run cf:deploy
```

`npm run cf:preview` levanta el worker ya construido en local, que es la forma más fiel de
probar antes de publicar. Para desarrollo local, copiar `.dev.vars.example` a `.dev.vars` y
llenarlo; ahí sí puede quedar vacío casi todo, como explica el propio archivo.
