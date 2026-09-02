# epic-ops

Herramienta ligera para operar tours. Cuatro pantallas, `Hoy`, `Reservas`, `Reportes` y
`Configuración`, sobre Next.js, React, shadcn con Base UI, Tailwind CSS y Tabler Icons.

La definición funcional, las decisiones visuales y el alcance están en [`PRODUCT.md`](./PRODUCT.md).

## Desarrollo local

```bash
npm install
npm run db:reset
npm run dev
```

`db:reset` crea la base D1 local, aplica las migraciones y carga los datos reales importados de la
app actual. `next dev` accede a esa base a través del binding `DB`.

Las pantallas todavía leen de los mocks en `lib/`. La capa de datos vive en `db/`.

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

## Primera vez en una cuenta de Cloudflare nueva

`wrangler.jsonc` trae `PENDIENTE_ACCOUNT_ID` y `PENDIENTE_DATABASE_ID` de marcador. Con
`npx wrangler login` ya autenticado contra la cuenta que va a alojar esto:

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
