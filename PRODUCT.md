# Sistema Administrativo Epic

<!-- impeccable:product-schema 1 -->

## Estado del producto

- Fase actual: prototipo.
- Alcance activo: primera pantalla, `Hoy / Operación`.
- Estado del slice: implementado y verificado localmente; pendiente de aprobación visual del usuario.
- Aprobación visual: pendiente.
- Arquitectura de producción: recomendada, pero todavía no aprobada.
- Nombre comercial y técnico confirmado: `Sistema Administrativo Epic`. El repo y el
  workspace de Cloudflare nacieron bajo el nombre de trabajo `epic-ops`; ese nombre quedó
  reemplazado en package.json, wrangler.jsonc y en toda la UI.
- Nombre del usuario de operaciones para el prototipo: `Dennis Reyes`.
- El nombre de carpeta `epicadventures` incluido al final del brief original queda reemplazado por
  la instrucción posterior y más específica: `epic-ops`.

## Plataforma

web

## Stack

La primera pantalla se construirá como prototipo web desechable para validar producto, jerarquía,
densidad, comportamiento responsive y dirección visual.

La recomendación de producción del brief es:

- Next.js con App Router.
- React 19 o superior.
- TypeScript.
- OpenNext sobre Cloudflare Workers.
- Cloudflare D1.
- Drizzle ORM.
- Zod.
- Better Auth.
- Resend.
- Tailwind CSS con primitivas de una librería de componentes como Radix, Base UI o shadcn/ui,
  sin conservar el aspecto visual predeterminado de un starter.

Decisiones confirmadas para el prototipo visual:

- Next.js 16.3.4 con App Router y React 19.
- shadcn/ui como primera opción para primitivas y componentes.
- Base UI como base headless de shadcn.
- Tabler Icons como único sistema de iconos.
- Table y Pagination de shadcn para la lista desktop.
- Datos mock y estado local solamente. No implementar todavía backend, autenticación ni
  infraestructura.

### Implementación actual del prototipo

- Shell responsive con sidebar desktop y bottom navigation mobile.
- Usuario operativo `Dennis Reyes` en saludo, avatar y cuenta lateral.
- Resumen de hoy con 12 reservas y 38 pasajeros.
- Alertas accionables para reservas sin guía, reservas sin conductor y pagos pendientes.
- En desktop las alertas forman una línea tipográfica ligera después de la toolbar. No usan cards,
  bandejas ni pills grandes.
- En mobile solo aparece el total de pendientes. Su desglose y el filtro por tipo viven en un
  bottom Sheet compacto para acercar la primera salida al inicio del viewport.
- Filtros temporales `Hoy`, `Mañana` y `Semana` con estado local.
- Filtro por tipo de pendiente al pulsar una alerta.
- Búsqueda por reserva, cliente, hotel o agente.
- La superficie principal conserva solo búsqueda + botón `Filtros` en todos los tamaños para no
  saturar el encabezado.
- En desktop la búsqueda ocupa el ancho disponible. En mobile el botón de filtros se reduce a su
  icono, conserva un target táctil de 44 px y mantiene un nombre accesible.
- El botón abre un Sheet lateral de shadcn con Select por tour, agente y lugar, además de campos
  `Desde / Hasta` para introducir un rango horario exacto.
- El Sheet anticipa cuántas salidas coinciden, valida rangos invertidos y diferencia claramente
  restablecer el borrador, cancelar y aplicar.
- Los menús Select usan padding interno suficiente para escaneo y touch.
- Tabla editorial desktop construida con Table de shadcn. Las filas alternan tono
  (`--row-alt` en las impares) y no usan separadores; el hover y el foco usan `--row-hover`, un
  tinte frío neutro deliberadamente fuera de la familia de marca.
  El único filete horizontal es el del encabezado de columnas.
- Lista mobile específica, sin tabla horizontal ni iconos decorativos por reserva. Cada fila alinea
  hora, tour, cliente, código, hotel, pasajeros, estado y total con jerarquía tipográfica.
- Pagination de shadcn con seis reservas por página.
- El workspace ocupa `100svh`. Solo la lista de reservas puede desplazarse y la paginación queda
  siempre dentro del viewport.
- El selector `Hoy / Mañana / Semana` usa una bandeja suave con el estado activo más pequeño y
  claramente separado del fondo.
- No se usan sombras. Las superficies principales tampoco usan bordes exteriores.
- Tokens de superficie de lista en `app/globals.css`: `--row-alt`, `--row-hover`, `--surface-muted`
  y `--warning-foreground`. El fondo de página (`--background`) es más profundo que la fila
  alterna para que la tarjeta blanca no se confunda con el fondo.
- Los badges de estado son pastel, sin borde, con icono sólido e identidad de color por estado, en
  la misma familia que los chips de tour: `Confirmada` verde `#d3edde`, `Falta guía` ámbar
  `#fae1b6`, `Falta conductor` azul `#d3e6f9`, `Pago pendiente` morado `#e6dffa`. Cada uno lleva
  texto oscuro de su propio tono (7.4 a 8.7:1) e icono en el tono medio (4.0 a 4.7:1).
- Los cuatro rellenos comparten luminosidad (L* 90 a 91.5) para que ningún estado pese más que
  otro. La legibilidad la cargan el texto y el icono, nunca el relleno.
- El ámbar no debe tirar a oliva ni caqui. Es cálido, del lado del amarillo. Ningún relleno de
  estado debe subir a un tono saturado: el usuario los quiere pastel.
- Detalle de reserva en Sheet de shadcn/Base UI, full width en mobile y panel lateral en desktop.
- Datos sintéticos en `lib/mock-reservations.ts`.
- No se implementaron todavía acciones de crear o editar, backend, base de datos, Better Auth ni
  Resend.
- Verificación E2E local en 1440 x 1000, 834 x 1112 y 390 x 844, incluyendo filtros, paginación,
  ausencia de overflow y apertura del detalle.
- La escala tipográfica del brief se aplica literalmente en listas y tabla: 15 px para el dato
  principal, 13 px para el secundario, 16 px para la hora. Iconos de 18 px en controles, 20 px en
  los botones grandes del encabezado y 24 px en navegación.
- Las variantes `dark:` de shadcn están atadas a una clase `.dark` que no se aplica, y el documento
  declara `scheme-light`. Sin paleta oscura, el modo oscuro del sistema no debe alterar la UI.
- Guardrails activos para impedir CSS artesanal, componentes mayores de 300 líneas y contenedores
  de ancho inconsistentes.

Esta recomendación no se considera aprobada hasta que el prototipo visual sea aceptado y se inicie
explícitamente la fase de desarrollo.

## Usuarios

Usuario principal inferido del brief:

- Dueño, administrador u operador de una empresa pequeña o mediana de tours.
- Trabaja con presión de tiempo, especialmente al preparar la operación del día.
- Necesita detectar faltantes, asignar personal, crear reservas y consultar información sin
  navegar por un ERP.
- Alterna entre mobile durante la operación y desktop para trabajo intensivo.

Roles iniciales propuestos en el brief:

- Owner.
- Admin.
- Operator.

No se construirá un sistema RBAC enterprise en la primera versión.

## Propósito

`Sistema Administrativo Epic` es un workspace operativo de tours. Su entidad central es la reserva y todo lo demás
existe para ayudar a reservar, asignar, operar, consultar y exportar con rapidez.

No es un CRM, un ERP turístico reducido ni un dashboard administrativo. Debe ayudar a:

- Crear reservas.
- Asignar guía y chofer.
- Gestionar hoteles, agentes, tours y opciones operativas.
- Ver lo que ocurre hoy.
- Detectar problemas operativos antes de que afecten un tour.
- Consultar reservas históricas.
- Exportar reportes a Excel, Word, XML y PDF. Ver `Exportación pendiente`.

## Posicionamiento

La pregunta central no es "¿cómo mostramos toda la información?", sino "¿qué necesita hacer
el operador ahora?".

La experiencia debe sentirse como un `Tour Operations Workspace`: una cola operacional clara,
rápida y accionable organizada alrededor de reservas, no una colección de módulos administrativos.

## Modelo mental y entidades

Entidad principal:

- Reserva.

Entidades relacionadas:

- Organizaciones.
- Usuarios.
- Clientes.
- Tours.
- Hoteles.
- Guías.
- Choferes.
- Agentes.
- Opciones de alimentación.
- Pagos.
- Notas.

Tablas aproximadas para una futura implementación relacional:

- `organizations`.
- `users`.
- `reservations`.
- `customers`.
- `tours`.
- `hotels`.
- `guides`.
- `drivers`.
- `agents`.
- `meal_options`.
- `reservation_meals`.
- `payments`.
- `notes`.

Aunque la primera instalación use una sola empresa, todas las entidades relevantes deben incluir
`organization_id` y toda consulta debe estar limitada por organización en el servidor.

## Principios de producto y UX

- Mobile first real, no mobile como desktop encogido.
- Desktop diseñado para velocidad y densidad controlada.
- Permitir componentes diferentes por dispositivo cuando mejore la tarea.
- Server first y muy poco JavaScript cliente.
- Búsqueda primero.
- Acciones frecuentes a uno o dos taps o clics.
- Formularios rápidos con campos grandes.
- Touch targets de al menos 44 px.
- Atajos de teclado opcionales en desktop.
- Información secundaria bajo progressive disclosure.
- Creación inline de entidades cuando mantenga el contexto.
- Optimistic UI solo en operaciones seguras.
- Smart defaults visibles como sugerencias, nunca selecciones silenciosas.
- Lógica condicional que elimine campos irrelevantes.
- Mantener contexto de lista al consultar un detalle.
- Evitar dashboards llenos de cards.
- Evitar tablas gigantes en mobile.
- Evitar modales enormes con tabs.

## Navegación

### Mobile

Bottom navigation:

1. Hoy.
2. Reservas.
3. Reportes.
4. Más.

Dentro de Más:

- Configuración.
- Cuenta.
- Cerrar sesión.

### Desktop

Sidebar compacta:

1. Hoy.
2. Reservas.
3. Reportes.
4. Configuración.

La cuenta del usuario vive al pie de la sidebar. Cerrar sesión no aparece en la navegación
principal.

## Primera pantalla: Hoy / Operación

Es la home real. No es un dashboard tradicional.

Debe responder inmediatamente:

- ¿Qué tours hay hoy?
- ¿A qué hora?
- ¿Cuántas personas viajan?
- ¿Quién va asignado?
- ¿Qué falta?
- ¿Qué requiere atención?

### Header

Contenido de demostración:

- Fecha completa, por ejemplo `Lunes, 31 de agosto`.
- Resumen dentro del bloque `Salidas`, por ejemplo `12 reservas · 38 pax`.
- Solo alertas accionables, por ejemplo `2 sin guía`, `1 sin chofer` y `1 pago pendiente`.

### Filtro temporal

- Hoy.
- Mañana.
- Semana.

### Mobile

- El bloque comienza con `Salidas`, volumen y pasajeros, sin repetir un header de página.
- El selector temporal ocupa todo el ancho.
- La toolbar contiene búsqueda y un único botón de filtros por icono.
- Los pendientes se resumen como `4 pendientes`; el desglose se abre en un bottom Sheet.
- Cada reserva es un bloque editorial completo y pulsable.
- La fila muestra hora, tour, cliente, código, hotel, pasajeros, estado y total.
- Un faltante aparece con lenguaje directo, por ejemplo `Guía pendiente`.
- No hay tabla horizontal.
- El detalle se abre como página completa.
- La bottom navigation permanece accesible.

### Desktop

- Sidebar compacta y contenido operacional amplio.
- El bloque `Salidas` sigue el orden: título y periodo, búsqueda y filtros, pendientes, tabla.
- La búsqueda ocupa la mayor parte de una sola toolbar horizontal.
- Filas editoriales sin cuadrícula ERP ni bordes por cada celda.
- Columnas prioritarias: hora, tour/cliente, pasajeros, hotel, guía, chofer, estado y total.
- Densidad controlada inspirada en listas operativas modernas.
- El detalle se abre en side panel de aproximadamente 520 a 640 px para conservar el contexto.
- Atajos previstos: `N` nueva reserva, `/` buscar, `Esc` cerrar panel y `Cmd/Ctrl + K` command
  palette.

### Interacciones incluidas en el prototipo

- Cambiar entre Hoy, Mañana y Semana.
- Activar una alerta para filtrar las reservas afectadas.
- Buscar por reserva, cliente, hotel o agente.
- Filtrar por tour, agente, lugar y un rango exacto de horas.
- Limpiar los filtros activos.
- Paginar sin perder el encabezado ni salir del viewport.
- Abrir y cerrar el detalle de una reserva.
- Diferenciar la presentación mobile y desktop.

Los datos de la primera pantalla son sintéticos y solo sirven para evaluar la interfaz.

## Reservas

### Implementación actual

- Ruta `/reservas` con historial completo: 14 meses hacia atrás y seis semanas hacia adelante.
- Estados de ciclo de vida `confirmed`, `completed` y `cancelled` en el modelo, además del
  pendiente operativo. Una reserva viva muestra lo accionable; una cerrada muestra en qué terminó.
- Filtro segmentado `Todas / Activas / Completadas / Canceladas`, solo en desktop. En mobile los
  cuatro pills no caben en 390 px y no deben scrollear, así que el estado vive dentro del sheet de
  `Filtros` y se muestra como chip removible cuando está activo.
- Aquí no hay `Hoy / Mañana / Semana`: el tiempo se acota con un rango de fechas, y el rango activo
  queda visible fuera del sheet.
- Búsqueda primero por cliente, código, tour, hotel o agente.
- Los cuatro filtros de entidad (tour, hotel, guía, agente) son los mismos en Hoy y en Reservas, con
  una sola fuente en `lib/filter-options.ts` para que no puedan divergir.
- Crear en `/reservas/nueva` y editar en `/reservas/[id]/editar`, ambos sobre el mismo formulario.
  Se llega desde el botón `Nueva reserva` del encabezado en desktop, y desde el botón `Nueva` de
  la cabecera de la lista en mobile, donde ese encabezado no existe.
- El pendiente operativo se deduce de lo que falta (sin guía, sin conductor, pago pendiente); no se
  elige a mano.
- La paginación muestra primera, última y una ventana alrededor de la actual. Con 25 páginas no
  puede imprimirlas todas.
- El encabezado no lleva controles decorativos. El botón `Buscar` abre la paleta global y la
  campana abre los avisos. El icono de ayuda se quitó porque no existía nada detrás.
- `Buscar` se ve como un campo, no como un icono fantasma: superficie blanca, 240 px y el atajo
  `⌘K` alineado a la derecha. Con solo borde sobre el fondo de página no se distinguía.
- La navegación lateral e inferior son enlaces reales. `Reportes` y `Configuración` existen como
  rutas con estado de "todavía no construido", no como 404.

### Lista mobile

- Header `Reservas` y acción `Nueva reserva`.
- Búsqueda inicial por cliente, tour o reserva.
- Filtros rápidos: Hoy, Mañana, Semana y Fecha.
- Acción `Filtros` abre un bottom sheet con desde, hasta, tour, hotel, guía, chofer, agente y
  estado.
- Lista vertical sin tablas horizontales.

### Lista desktop

- Header con búsqueda, fecha, tour, hotel, guía, estado y más filtros.
- Filas densas pero respirables, aproximadamente 72 a 84 px.
- No mostrar quince columnas simultáneamente.

## Crear reserva

Objetivo de tiempo cuando las entidades relacionadas ya existen: 20 a 40 segundos.

### Mobile

Flujo multi-step discreto:

1. Tour: tour, fecha, hora y personas.
2. Cliente: nombre, hotel y agente.
3. Operación: guía, chofer, alimentación y entradas si aplica.
4. Pago: tarifa, depósito, total y notas.
5. Revisar: resumen corto y crear reserva.

Reglas:

- Tres a cinco campos por paso.
- Indicador ligero, por ejemplo `1 de 5 / Tour`.
- CTA sticky abajo con Atrás y Continuar.
- En el último paso, `Crear reserva`.

### Desktop

- Una sola página rápida, no un wizard obligatorio.
- Contenedor centrado de aproximadamente 720 a 900 px.
- Secciones: Reserva, Cliente, Operación, Pago y Notas.
- Dos columnas solo para relaciones naturales: fecha/hora, guía/chofer y tarifa/depósito.
- El usuario experto puede saltar directamente al campo requerido.

### Modelo tomado de la app actual

Un export de la app actual (`Acciones, N° Doc, Fecha, Hora, Cliente, Personas, Ticket, Tour, Hotel,
Chofer, Guía, Agente, Activo, Tarifa Neta, Nota`) y su modal de reserva fijan el modelo:

- Los campos de cabecera son cinco entidades (tour, hotel, chofer, guía, agente) más fecha, hora
  de salida y cantidad de personas.
- El dinero se lleva por **tarifa neta por persona**, depósito y total. El total se calcula
  `tarifa x pax` pero queda editable, porque hay tarifas negociadas.
- **Entradas**: una línea por pasajero con nombre, pasaporte y tipo (adulto o niño). En el export
  aparece como un conteo por reserva.
- **Alimentación**: cuántas de cada opción lleva la reserva. Solo se pregunta si el tour la
  incluye, según la casilla `Alimentación` del tour en Configuración.
- Lo que no siempre aplica (pago, entradas, alimentación, nota) vive en pestañas, no apilado: así
  el formulario cabe en una pantalla, como el modal actual, en vez de pedir scroll.
- El formulario es un flujo, no una colección de inputs: `Reserva`, `Asignación y operación`,
  `Pago`, `Detalles adicionales`. Superficie blanca continua, sin una card por sección: la
  jerarquía la dan el espacio y rótulos discretos en mayúsculas.
- Una sola columna centrada de 820 px con filas de dos o tres campos. `Fecha`, `Hora` y `Personas`
  van angostos; nada de campos repartidos por todo el ancho.
- `Total` es información calculada (tarifa por personas), no un campo. El texto auxiliar de saldo
  solo aparece cuando hay depósito y queda pendiente.
- `Asignación y operación` y `Detalles adicionales` son secciones plegables con un resumen de su
  contenido en el rótulo. Son bloques secundarios y no deben competir con Pago.
- El plegable es una fila completa sobre `--surface-muted`, con el chevron pegado al borde
  derecho. Un rótulo con un chevron pequeño al lado se lee como título, no como control; la fila
  con superficie propia es lo que lo distingue de los rótulos fijos `RESERVA` y `PAGO`.
- Una sola columna, siempre: el flujo se lee de arriba abajo. La card se limita a 860 px y se
  centra, así no quedan flancos blancos vacíos a los lados.
- **La regla es que entre en una pantalla.** Con las dos secciones secundarias plegadas mide 791 px
  de 791 disponibles en 1440 y en 834. Se verifica midiendo `scrollHeight` contra `clientHeight`,
  no a ojo.
- Los campos dentro de una fila necesitan `min-w-0`: sin eso un input no baja de su ancho
  intrínseco, se sale de su celda y se solapa con el de al lado.
- En mobile el encabezado del formulario vive dentro de la card, con el back alineado al borde de
  los campos. Fuera, el título quedaba indentado respecto al contenido y se leía descuadrado.
- Mobile no apila el desktop: recorre el flujo en seis pasos, `Tour y salida`, `Cliente y
  recogida`, `Asignación`, `Pago`, `Detalles` y `Revisar`, con tres o cuatro campos por paso para
  que ningún paso quede vacío.
- Se eliminó el campo `Zona` de la reserva: el hotel ya la determina y era un dato que el operador
  escribía dos veces.
- Pendiente de alinear: el código de reserva de la app actual es `T524`, aquí todavía es `EP-2048`.

### Creación inline

Hotel, guía, chofer y agente usan combobox con búsqueda y opción de crear sin abandonar la
reserva. **Implementado**: el campo filtra al escribir y, si lo escrito no existe, ofrece
`Crear "..."`. Eso abre el formulario del tipo con el nombre ya puesto; al guardar, la entidad
queda creada en Configuración y seleccionada en la reserva, sin perder nada de lo escrito.
El tour también es combobox pero solo busca: darlo de alta vive en Configuración, como pide el
brief. Solo se ofrecen entidades activas.

- Mobile: bottom sheet.
- Desktop: dialog pequeño o side sheet.
- Al guardar: crear entidad, cerrar el overlay y seleccionarla automáticamente.

Crear un tour requiere más cuidado porque puede incluir precio, descripción, duración,
alimentación y reglas. Puede existir un `Crear tour rápido`, pero la configuración avanzada vive
en Configuración / Tours.

### Defaults, condicionales y borradores

- La app puede sugerir una hora habitual o una relación frecuente, pero no autoseleccionarla.
- No mostrar Alimentación si el tour no la incluye.
- Permitir continuar sin agente cuando no exista.
- No pedir detalles de depósito si no hay depósito.
- Guardar el progreso del formulario, especialmente en mobile.
- Estrategia de draft por decidir: server-side ligero o local con sincronización.

## Detalle de reserva

- Abrir primero en lectura limpia, no directamente en modo editar.
- Mostrar tour, fecha, hora, pasajeros, cliente, hotel, guía, chofer, total, depósito, pendiente
  y notas.
- Mobile: página completa.
- Desktop: side panel de aproximadamente 520 a 640 px.
- Acción principal: `Editar reserva`.

## Reportes

- Filtros principales: Desde y Hasta.
- Acción `Generar`.
- Resumen: reservas, pasajeros e ingresos del periodo.
- Lista de reservas encontradas.

### Implementación actual

Las tres pantallas responden preguntas distintas y esa distinción manda sobre el layout:

- `Hoy`: ¿qué tengo que hacer?
- `Reservas`: ¿qué reservas tengo?
- `Reportes`: ¿cómo se desempeñó el negocio y por qué?

Por eso Reportes no repite la lista de reservas ni levanta alarmas: compara, explica y cierra con
un enlace al detalle. La jerarquía es periodo, KPIs, resumen, rendimiento, incidencias, detalle.

- Ruta `/reportes`. Llega **ya generado** sobre el mes en curso y se recalcula al instante. Atajos
  `Este mes`, `Mes pasado`, `90 días`, `Este año` y `Personalizado`, que abre el sheet de fechas.
  El rango exacto se muestra al lado como texto, no como botón: el único control del periodo son
  los pills, para no tener dos caminos al mismo sheet.
- Los cinco atajos más el rango solo caben desde 1280 px. Por debajo, el periodo se elige en un
  select compacto y el rango exacto viaja al subtítulo. Las cifras pasan a 2x2 en el mismo punto:
  en tablet, cuatro columnas truncan `$9,120`.
- **KPIs con comparación** contra el periodo inmediatamente anterior de la misma duración:
  reservas, pasajeros, ingresos y ticket medio, cada uno con su variación. Sin comparación posible,
  lo dice en vez de inventar un 0%. La cifra domina; la etiqueta la nombra; la tendencia la
  contextualiza. En mobile 2x2 y la frase "comparado con el periodo anterior" se dice una vez
  arriba, porque dentro de la primera cifra no cabe.
- **Resumen del periodo**: una o dos frases generadas por reglas, no por modelo, en
  `lib/report-narrative.ts`. Solo afirma lo que los datos sostienen. Va sobre superficie tintada,
  con el icono de tendencia y las cifras destacadas dentro de la frase; el verbo ya lleva el signo,
  así que el porcentaje va en absoluto y una variación plana no imprime `0%`.
- **Rendimiento**: tours por ingresos (qué se vendió más), agentes por ingresos (quién generó más
  negocio) y hoteles por reservas (dónde se concentró la operación). Las barras codifican la
  proporción real contra el primero. Sin filetes verticales: la separación la hace el aire.
- **Incidencias del periodo**: cancelaciones, sin guía, sin conductor y pendiente de cobro, con
  prioridad visual baja. En `Hoy` esto es crítico; aquí es contexto de lo que ocurrió. Cada fila
  con dato abre esas reservas ya filtradas; una fila en cero se muestra pero no se ofrece como
  enlace, porque no lleva a ninguna parte.
- Cierra con `Ver las N reservas del periodo`, que enlaza a `/reservas` con el periodo aplicado.
- `/reservas` acepta `?desde`, `?hasta`, `?pendiente` y `?estado` por URL, y muestra esos filtros
  como chips removibles para que no queden invisibles.
- La exportación del reporte todavía no está construida. Ver `Exportación pendiente`.

## Avisos

Una notificación es **una salida que se acerca con algo sin resolver**. Nada más: un pendiente de
dentro de tres semanas es una tarea, no una alerta.

- Regla: reserva confirmada, que sale hoy o mañana, y sin guía, sin conductor o con el pago
  pendiente. En `lib/upcoming-alerts.ts`.
- El contador de la campana es ese número, y el punto solo existe cuando hay algo que atender. No
  hay estado de "leído" inventado: si el pendiente se resuelve, el aviso desaparece solo.
- El panel agrupa por `Hoy` y `Mañana`, ordena por hora de salida y cada fila abre esa reserva.
- La fila es hora, salida y motivo: el motivo va como badge alineado a la derecha, con el mismo
  lenguaje de color de las listas. Los motivos forman columna y se escanean de un vistazo; escrito
  como texto corrido dentro de la línea del cliente, el dato que justifica el aviso era el menos
  visible de la fila.
- Las filas alternan tono con `--row-alt`, igual que las tablas de reservas. El rayado es el
  separador de filas de esta app; no se usan líneas.
- Es el mismo dato que la línea de pendientes de `Hoy`, pero acotado por proximidad y disponible
  desde cualquier pantalla, que es lo que justifica que exista aparte.

## Búsqueda global

Paleta de comandos, abierta con `Cmd K` o `Ctrl K` desde cualquier pantalla, o con el botón
`Buscar` del encabezado. Busca en tres grupos y se navega con flechas y Enter:

- **Reservas**: por código, cliente, tour, hotel o agente. Lleva a `/reservas?buscar=` con el
  término aplicado y el cursor en el buscador.
- **Configuración**: cualquier tour, guía, chofer, hotel, agente u opción de alimentación. Lleva a
  `/configuracion?tipo=` con ese tipo abierto.
- **Ir a**: las cuatro pantallas.

Existe porque una búsqueda que solo funciona donde ya hay un buscador no es una búsqueda global:
tiene que servir igual desde Reportes o Configuración, y sin sacar al operador de su contexto.
Todavía es solo desktop; en mobile cada pantalla usa su propio buscador.

## Exportación pendiente

Pendiente acordado el 1 de septiembre de 2026, todavía sin construir. Aplica a **las dos tablas**,
la de `Hoy / Salidas` y la de `Reservas`, además de a los resultados de `Reportes`:

- Exportar a Excel.
- Exportar a Word.
- Exportar a XML.
- Imprimir en PDF.

Va en un menú de acciones de la tabla, no como cuatro botones sueltos. La exportación debe
respetar los filtros activos, no volcar la tabla completa.
- En desktop puede existir una tabla analítica tradicional con columnas prioritarias visibles y
  el resto exportable.
- Posible selector de columnas sin intentar mostrar todo a la vez.

## Configuración

Una sola entrada global contiene:

- Tours.
- Guías.
- Choferes.
- Hoteles.
- Agentes.
- Alimentación.

Cada tipo comparte un patrón CRUD. Entidades con historial se desactivan en lugar de borrarse
permanentemente.

### Implementación actual

- Ruta `/configuracion`, una sola pantalla. En desktop es de dos columnas: los seis tipos con su
  conteo a la izquierda y la lista del tipo elegido a la derecha. En mobile son dos vistas: índice
  y detalle, con back real, porque seis pestañas no caben en 390 px.
- Los seis tipos comparten una sola definición (`lib/entities.ts`) con sus campos, y una tabla,
  una lista mobile y un formulario genéricos los renderizan. Agregar un tipo es agregar una
  definición.
- Los campos siguen los de la app actual de Sistema Administrativo Epic: tours con descripción, tipo y precio; guías
  con teléfono y email; choferes con teléfono y licencia; hoteles con teléfono, dirección y email;
  agentes con teléfono, empresa y email; alimentación solo con nombre.
- La tabla solo aparece desde 1400 px, que es donde realmente cabe. Por debajo, incluido tablet,
  manda la lista apilada: una tabla que scrollea horizontalmente termina escondiendo la columna
  del nombre, que es la que identifica la fila.
- En la lista, cada valor va con su etiqueta (`Licencia B3`, `Teléfono 2777 1414`). Sin encabezado
  de columna, un valor suelto no significa nada.
- Las columnas marcadas `secondary` (email de hoteles y agentes, tipo de tour) desaparecen cuando
  el ancho no alcanza, en vez de empujar la tabla a scroll horizontal.
- Las acciones de fila en desktop son iconos con tooltip y nombre accesible, como en la app
  actual. En mobile son botones con texto, donde sí hay espacio.
- Paginación de 10 por página, la misma de Reservas y Reportes.
- **No hay borrar.** Se desactiva, como pide el brief: lo desactivado deja de ofrecerse al crear o
  filtrar, pero el historial lo conserva. Cada fila muestra cuántas reservas lo usan, que es
  justamente lo que hace irreversible un borrado.
- `EntitiesProvider` en el layout raíz es la fuente única: los selects de crear y editar reserva y
  los cuatro filtros de entidad leen de aquí. Desactivar un guía en Configuración lo saca del
  formulario de reservas sin tocar las reservas existentes.
- El tipo de tour (naturaleza, montaña, agua, ciudad) se administra aquí y es lo que decide el
  icono de color en las listas de reservas.
- Falta por construir: alimentación asociada a cada tour, y que el detalle de reserva permita
  elegir opciones de alimentación.

## Autenticación

Decisión confirmada por el usuario:

- Inicio de sesión passwordless mediante código enviado por email.
- Better Auth como sistema de autenticación.
- Resend como proveedor de email transaccional.

Contrato técnico propuesto para producción:

- Plugin de servidor `emailOTP` de Better Auth.
- Plugin de cliente `emailOTPClient`.
- Envío con tipo `sign-in`.
- Resend implementa `sendVerificationOTP`.
- Código numérico de 6 dígitos.
- Expiración de 5 minutos.
- Máximo de 3 intentos por código.
- Almacenamiento del OTP con hash, nunca en texto plano.
- Estrategia de reenvío `rotate` para invalidar el código anterior.
- Respuesta uniforme al solicitar código para no revelar si una cuenta existe.
- Rate limiting por IP y email.
- En Cloudflare, el envío debe continuar con `waitUntil` sin bloquear la respuesta ni introducir
  diferencias de tiempo evitables.
- Cookies de sesión `HttpOnly`, `Secure` y `SameSite`.
- Autorización y scoping de organización siempre en servidor.
- Nunca confiar en `userId`, `organizationId` o `role` enviados por el navegador.
- Resend usa un dominio y remitente verificados.
- Considerar `Idempotency-Key` para impedir envíos duplicados en reintentos de infraestructura.

Decisiones abiertas:

- Si el alta es solo por invitación. La propuesta inicial es desactivar el signup automático.
- Duración total de la sesión y política de renovación.
- Dominio y dirección remitente definitivos.
- Nombre comercial que aparecerá en el email.
- Recuperación y soporte cuando el correo no llega.

La pantalla de autenticación no forma parte del slice actual.

## Arquitectura de aplicación recomendada

### Server first

- Server Components para páginas y datos normales.
- Client Components solo donde exista interacción real.
- Evitar `useEffect -> fetch -> spinner` para cargar páginas.
- Server Actions para crear o editar reservas, crear entidades y activar o desactivar registros.
- `useActionState` para pending, validación, errores de servidor y resultado de acciones.
- `useOptimistic` o `startTransition` solo donde la operación sea segura.

### Validación

Schemas compartidos sugeridos:

- `reservationSchema`.
- `tourSchema`.
- `hotelSchema`.
- `guideSchema`.
- `driverSchema`.
- `agentSchema`.
- `mealSchema`.

Toda entrada se valida en servidor con Zod. La validación del navegador solo mejora UX.

### Estado cliente

Zustand, si se usa, queda limitado a estado efímero:

- Drawer state.
- Filtros temporales.
- Command palette.
- Draft local complejo.

Reservas, tours, hoteles y demás datos remotos pertenecen al servidor.

### Datos y cache

Cache más agresivo:

- Tours.
- Guías.
- Choferes.
- Hoteles.
- Agentes.
- Alimentación.

Datos dinámicos:

- Reservas.
- Operación de hoy.
- Pagos.
- Estados.

La invalidación debe ser granular, por ejemplo `tours`, `tour:{id}`, `reservation:{id}` y
`reservations:{date}`.

### Cloudflare

- Workers / OpenNext como runtime principal.
- D1 para datos relacionales.
- R2 solo si aparecen vouchers, PDFs, pasaportes, documentos o attachments.
- KV opcional para preferencias, feature flags, configuración pequeña o cache simple.
- Queues para email, documentos, reportes grandes, notificaciones e integraciones que no deben
  bloquear la UI.
- Cron opcional para un resumen operacional diario.

### Routing aproximado

```text
app/
  (auth)/
    login/
  (dashboard)/
    layout.tsx
    page.tsx
    reservas/
      page.tsx
      nueva/
        page.tsx
      [id]/
        page.tsx
        editar/
          page.tsx
    reportes/
      page.tsx
    configuracion/
      page.tsx
      tours/
      hoteles/
      guias/
      choferes/
      agentes/
      alimentacion/
```

## Componentes previstos

```text
components/
  reservation/
    reservation-mobile-card.tsx
    reservation-desktop-row.tsx
    reservation-detail.tsx
    reservation-mobile-wizard.tsx
    reservation-desktop-form.tsx
    reservation-summary.tsx
  operation/
    today-list.tsx
    operational-alerts.tsx
  reports/
    report-filters.tsx
    report-results.tsx
  entities/
    entity-combobox.tsx
    quick-create-sheet.tsx
  ui/
    button.tsx
    input.tsx
    select.tsx
    sheet.tsx
    dialog.tsx
    command.tsx
```

Separar `ReservationMobileWizard` y `ReservationDesktopForm` es una decisión deseable cuando evita
una abstracción compleja y mediocre para ambos contextos.

## Errores y carga

- Cada área importante debe contemplar `loading.tsx` y `error.tsx`.
- La aplicación incluye `not-found.tsx` y `global-error.tsx`.
- 404 propuesto: `Reserva no encontrada. Puede haber sido eliminada o no tienes acceso.`
- 500 propuesto: `No pudimos cargar esta información. Tus datos no se han perdido.`
- Evitar un spinner gigante centrado.
- Mantener UI previa durante transiciones o usar skeleton contextual.
- El feedback de guardado vive dentro del control afectado, por ejemplo `Guardando...`.

## Performance

Objetivo: que la aplicación se sienta instantánea.

Prioridades:

- Server Components.
- Mínimo JavaScript.
- Cache granular.
- Prefetch.
- Streaming selectivo.
- Dependencias pequeñas.
- SVG e iconos ligeros.
- Fonts optimizadas.
- Dynamic imports solo cuando aporten.

Suspense se usa cuando permite streaming útil, no como decoración. Un ejemplo válido es mostrar
el header inmediatamente y resolver después reservas y alertas operativas.

## Dirección visual confirmada por el brief

La interfaz debe sentirse moderna, seria, limpia, rápida, premium, operacional, ligeramente grande
y específica para tours.

Referencia visual aprobada para esta iteración:

- Captura local: `/var/folders/w_/1wkwkxn533b_yysvnrw5kzq80000gn/T/codex-clipboard-86fe6632-1d18-460f-8768-2284054665c1.png`.
- Conservar: fondo frío muy claro, sidebar blanca, superficies amplias, radios suaves, tipografía
  contemporánea, iconos lineales, filas con respiración y estados con tintes suaves.
- Adaptar: la composición debe seguir siendo operativa y centrada en salidas, no un dashboard de
  recursos humanos.
- Evitar: la apariencia rígida y antigua de la dirección anterior `Manifiesto de Ruta`.

Debe evitar:

- Starter dashboard de shadcn.
- Template SaaS genérico.
- ERP clásico.
- Admin panel Bootstrap.
- Pantallas con decenas de cards.
- Rectángulos anidados sin jerarquía.
- Controles diminutos.
- Pills para todo.

Referencias de principio, no de copia:

- Linear: jerarquía, densidad controlada, velocidad y filas operativas.
- Stripe Dashboard: claridad, forms, estados financieros y simplificación.
- Attio: datos densos con sensación moderna.
- Raycast: velocidad, búsqueda y teclado.
- Vercel: tipografía, simplicidad y espacio.
- Notion Calendar: organización temporal.

## Reglas visuales del brief

- Un solo accent de marca: verde selva `#1a7a52` (`--primary`), con `--secondary` / `--accent`
  como tintes claros y `#155f41` para texto verde sobre esos tintes. Confirmado por el usuario el
  31 de agosto de 2026. El tono está en su techo de claridad: más claro no sostiene texto blanco
  encima con 4.5:1.
- Base casi monocromática.
- Pocos bordes. Las filas de una lista se separan por alternancia de tono, no por líneas.
- Sin sombras en navegación, cards, controles, popovers o sheets.
- shadcn/ui primero. Las utilidades Tailwind se reservan para layout, responsive y ajustes visuales
  necesarios sobre las primitivas.
- La bandeja del selector temporal es un gris frío neutro. Un gris con tinte verde junto al pill
  verde se lee sucio.
- En mobile los pills del selector miden 44 px. En desktop 32 basta: los 44 px son una regla
  táctil, no de puntero.
- Controles completamente redondeados (`rounded-full`): inputs, selects, buttons, tabs y
  paginación comparten la misma familia de píldora. Decisión del usuario del 31 de agosto de 2026
  que reemplaza el radio de 8 a 10 px del brief original.
- Sheets con radio de 16 a 20 px.
- Animaciones de 150 a 220 ms con opacity y transform cuando comuniquen estado.
- Muy pocos iconos. No poner un icono delante de cada label.
- Usar Tabler Icons. No mezclar con Lucide ni con glifos Unicode.

Medidas orientativas:

- Título desktop: 28 a 32 px.
- Título mobile: 24 a 28 px.
- Título de sección: 18 a 20 px.
- Body: 15 a 16 px.
- Texto secundario: 13 a 14 px.
- Inputs: 16 px.
- Input mobile: 48 a 52 px de alto.
- Input desktop: 44 a 48 px de alto.
- Padding desktop: 32 a 40 px.
- Padding mobile: 16 a 20 px.
- Separación entre secciones: 32 a 48 px.
- Separación entre campos: 12 a 16 px.

## Accesibilidad e inclusión

- Objetivo mínimo: WCAG 2.2 AA. Umbrales propios, medidos sobre el DOM renderizado:
  - Texto principal: 7:1 o más (AAA). Hoy: 16:1.
  - Texto secundario: 5:1 como piso en toda superficie donde se pinte, no solo sobre blanco.
    Hoy: 5.25 en el peor caso, que es el hover de fila.
  - Blanco sobre el verde de marca y demás texto sobre relleno de color: 5:1 como piso, no 4.5.
    Hoy: 5.32, que es el ratio más bajo de toda la app y el techo de claridad del accent.
  - Iconos, indicadores y anillo de foco: 3:1 mínimo.
  - Texto dentro de un badge: 8:1 o más. Hoy: 8.70 y 9.79.
  - Relleno de un badge contra la fila: WCAG no lo cubre y un pastel no puede pasar de ~1.4. Se
    acepta ese techo porque el peso lo carga el texto oscuro y el icono sólido. Hoy: 1.29 a 1.41.
  - Estados deshabilitados: WCAG los exime; aquí igual deben pasar 3:1 y no depender solo de
    opacidad.
- Contraste medido, no estimado visualmente.
- Navegación completa con teclado en desktop.
- Estados de focus visibles.
- Touch targets de al menos 44 px.
- HTML semántico y nombres accesibles.
- El color nunca es el único indicador de un estado.
- Respetar `prefers-reduced-motion`.
- Mantener legibilidad con zoom y textos largos.

## Autenticación implementada

Better Auth con código de un solo uso por correo, sin contraseñas. No hay registro
público: las cuentas se crean con `npm run db:user -- correo "Nombre"`.

Dónde se verifica, que es lo que importa:

- Cada Server Action llama a `requireSession()` por su cuenta. Son endpoints POST
  públicos y el proxy no las cubre.
- `proxy.ts` solo mira si existe la cookie, sin tocar la base ni validar la firma.
  Es una comprobación optimista para navegaciones.
- La organización sale de la sesión, nunca de un valor fijo en el código.

Dos decisiones que costaron una verificación:

- **Sin caché de sesión en cookie.** Con ella activada, cambiar tu nombre tardaba
  una navegación entera en verse. La lectura de sesión es una consulta por índice.
- **La IP del cliente se lee de `CF-Connecting-IP`.** Sin eso, Better Auth cae en
  un balde compartido por ruta y el límite de intentos deja de proteger.

Mientras no exista dominio propio, el código sale por el log del servidor si no hay
`RESEND_API_KEY`. Resend entrega desde `onboarding@resend.dev` solo al correo dueño
de la cuenta, que alcanza para un operador.

## Dónde vive cada dato

Todas las pantallas leen de D1. No queda ningún dato de prueba en el código.

| Pantalla | Qué viaja al cliente |
| --- | --- |
| Reservas | Las ocho filas de la página. Filtro, orden y paginación en SQL |
| Hoy | Las salidas del periodo, pocas decenas |
| Reportes | Solo las métricas ya calculadas |
| Configuración | Los seis catálogos completos, un par de centenares de filas |
| Avisos | Solo las salidas de hoy y mañana con algo sin resolver |
| Búsqueda global | Nada hasta que se escribe; entonces una Server Action |

En Reservas **los filtros y la página viven en la URL**, no en estado de cliente: la
vista es compartible, el botón atrás funciona y el servidor puede filtrar en SQL.

En Hoy el filtrado sí ocurre en el cliente, a propósito: son las salidas de un día y
los contadores de incidencia tienen que responder al instante.

Reportes trae las filas del periodo y calcula en el servidor con la misma función de
siempre. Bajar rankings y comparaciones a SQL sería reescribir lógica probada sin
ganar nada con este volumen.

### Nada de KV ni Durable Objects todavía

OpenNext los ofrece para caché incremental y `revalidateTag` sobre contenido
cacheado. Con sesión, cada página es dinámica y no hay nada cacheable entre
visitantes, así que `revalidatePath` alcanza. Entran cuando aparezca contenido que
de verdad se pueda cachear, y R2 cuando existan vouchers o pasaportes.

## Datos reales importados

La app actual exportó seis hojas de cálculo, que son la base de datos de arranque.
`npm run import:seed` las normaliza y escribe `data/seed/`: una JSON por tabla, un `seed.sql`
listo para D1 y un `REPORT.md` con cada decisión que hubo que tomar. El script es idempotente,
los ids se derivan del nombre.

| Tabla | Filas | Origen |
| --- | --- | --- |
| tours | 20 | `tours.xlsx` |
| guides | 25 | `guias.xlsx` |
| drivers | 11 | `choferes.xlsx` |
| hotels | 59 | `hoteles.xlsx` |
| agents | 92 | `agentes.xlsx`, 96 filas con 4 duplicados por mayúsculas |
| reservations | 380 | `reservas.xlsx`, del 2026-05-07 al 2026-09-18 |

Lo que el import resuelve:

- Las reservas citaban tour, hotel, chofer, guía y agente por nombre con espacios sobrantes.
  Ahora son llaves foráneas, y las 380 resolvieron sin huérfanos.
- `pendiente` era el relleno para email y licencia sin dato. Pasa a `NULL`.
- Fechas desde el serial de Excel a ISO, horas de `07:40 AM` a `07:40`.
- Precios y tarifas en céntimos enteros, en dólares.
- Nombres de cliente en mayúsculas de captura pasan a capitalización normal.
- El export solo trae registros vigentes, así que todo entra activo. Los desactivados de la app
  actual no viajaron.

Pendiente de revisar con el operador: 13 reservas salen antes de las 04:00, probablemente AM y PM
mal capturados. El código visible de reserva es `T113`. Las reservas nuevas siguen ese consecutivo.

Lo que el histórico no trae y el formulario sí pide: punto de recogida, depósito, tipo de tour,
alimentación y el detalle de entradas por pasaporte. El esquema los tiene, llegan vacíos.

## Capa de datos

- `db/schema.ts` define diez tablas, todas colgando de `organization_id`.
- `db/index.ts` entrega el cliente de Drizzle sobre el binding `DB` de D1.
- `db/queries/` son lecturas de servidor: `listReservations` con filtros y total, `listCatalog`.
- Migraciones en `drizzle/`, generadas con `npm run db:generate` y aplicadas con `npm run db:migrate`.
- `npm run db:reset` reconstruye la base local con los datos reales.
- `next dev` accede a la D1 local a través de `initOpenNextCloudflareForDev`.

## Evidencia disponible

- Brief funcional completo entregado por el usuario.
- Nombre `epic-ops` confirmado.
- Método de autenticación confirmado.
- Datos reales de la app actual, seis exports importados a `data/seed/`.
- No existe todavía logo, identidad de marca, dominio, contenido legal ni assets.
- No se deben inventar clientes, métricas comerciales, testimonios ni integraciones activas.

## Decisiones abiertas

- Aprobación de la primera pantalla.
- Stack final y destino de despliegue.
- Logo e identidad de marca.
- Zona horaria por organización. La demo usa `America/Costa_Rica`.
- Moneda y reglas de formato por organización. La demo usa USD.
- Idioma y localización. La demo usa español.
- Alta de usuarios por invitación o signup controlado.
- Políticas finales de sesión y OTP.
- Necesidades offline reales.
- Alcance exacto de auditoría, backups y recuperación.
- Manejo de comisiones y reglas financieras.

## Criterios de aceptación del slice actual

- `Hoy` comunica fecha, volumen, pasajeros y alertas accionables en el primer viewport.
- En mobile la primera salida aparece en el primer viewport sin atravesar controles redundantes.
- El operador identifica hora, tour, pasajeros, hotel, guía, chofer, estado y total sin ruido.
- Mobile y desktop tienen estructuras deliberadamente distintas.
- Una alerta puede enfocar las reservas afectadas.
- Una reserva abre su detalle manteniendo el patrón correcto por dispositivo.
- El prototipo funciona con teclado y touch.
- No contiene un dashboard de cards ni una tabla ERP.
- Cumple contraste WCAG 2.2 AA en los pares renderizados.
- No implementa todavía login, base de datos, reservas, reportes ni configuración de producción.
