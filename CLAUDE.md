# LectoSmart

Plataforma web educativa de lectura — proyecto de grado, I.E. Técnica Valle
de Tenza (Guateque, 2026). Autoras: Danna Valentina Ramírez y Aileen Celeste
Guevara.

## Stack
- Frontend: React 18 + Vite + Tailwind CSS + react-router-dom
- Backend: Node.js + Express
- Base de datos: SQLite vía Prisma ORM
- Autenticación: JWT + bcrypt (API stateless, token guardado en localStorage)
- PWA instalable: `vite-plugin-pwa` (Workbox `generateSW`, `registerType:
  autoUpdate`) en `frontend/vite.config.js`. El manifest y los íconos
  (`frontend/public/pwa-*.png`, incluido uno `maskable`) permiten
  "Instalar app". El service worker precachea el shell estático pero
  **excluye `/api/*`** a propósito (nada de respuestas de API cacheadas,
  para no servir datos/autenticación obsoletos).

## Estructura
- `docs/` — estudios pedagógicos que fundamentan el banco de contenido
  (`estudio-contenidos-por-grado.md` y `estudio-ortografia-y-gramatica.md`)
  y el manual de uso
- `frontend/` — SPA de React (estudiantes y docentes)
- `backend/` — API REST en Express
- `frontend/reference/lectosmart-prototipo.jsx` — prototipo de diseño
  aprobado; es la fuente de verdad visual (colores, tipografías, mascota
  Leo, estilo de tarjetas/botones). No se ejecuta, solo se consulta.

## Cómo correr en desarrollo
- Backend: `cd backend && npm install && npx prisma migrate dev && npm run seed && npm run dev`
- Frontend: `cd frontend && npm install && npm run dev`

## Convenciones de nombres
- Texto de interfaz, nombres de componentes de página y copy: **español**
  (Inicio, Login, PanelEstudiante, PanelDocente...), igual que el prototipo.
- Identificadores de código (variables, funciones, rutas de API, columnas
  Prisma): **inglés/camelCase** salvo que ya exista un término establecido
  en español en el dominio del proyecto (ej. `curso`, `racha`, `logro`,
  `puntos` se quedan en español porque son el vocabulario del dominio).
- Rutas API: `/api/<recurso>/<accion>`, minúsculas, en español cuando el
  recurso es de dominio (`/api/estudiantes`, `/api/docente/resumen`).

## Sistema de diseño (fuente: prototipo aprobado)
- Paleta de colores centralizada en `frontend/src/theme/colors.js` (objeto
  `C`) — no hardcodear hex en componentes, importar de ahí.
- Tipografías: 'Baloo 2' para títulos/display (`ls-display`), 'Inter' para
  texto (`ls-body`).
- Componentes reutilizables: `Leo` (mascota), `AppHeader`, tarjeta
  `ls-card`, botón `ls-btn`. Cualquier pantalla nueva debe reusar estos
  antes de crear estilos nuevos.
- Mantener `prefers-reduced-motion` respetado en cualquier animación nueva.

## Módulos
Son **cuatro**, en el orden de `MODULOS` (`backend/src/lib/constants.js`),
que es también el orden de las tarjetas del panel del estudiante:
`PALABRAS` (vocabulario) · `ORTOGRAFIA` (escritura correcta) ·
`COMPRENSION` · `FLUIDEZ`. Al agregar un módulo hay que tocar: `MODULOS` y
`PUNTOS_BASE_POR_MODULO`, `validarContenido`/`normalizarContenido` en
`actividadesGestion.js`, los esquemas y el prompt de `propuestas.js`, el
`CASE` de `moduloLegible` en el seed, `MODULOS_INFO` en
`PanelEstudiante.jsx`, la lista `MODULOS` de `GestionActividades.jsx` y
`PropuestasIA.jsx`, la página `Modulo*.jsx` y su ruta en `App.jsx`.

## Módulo ORTOGRAFIA ("Escribir sin errores")
- Se separó de PALABRAS a pedido de la docente: PALABRAS trabaja el
  *significado* (sinónimos, morfología) y ORTOGRAFIA la *forma* (cómo se
  escribe). Mezclados, un % bajo no decía si el problema era vocabulario
  u ortografía.
- Misma mecánica que PALABRAS (opción múltiple, sin reintento, 2
  corazones); `contenido` = `{ instruccion, opciones, respuesta,
  explicacion, foco }`.
- **`foco`** (`backend/src/lib/focosOrtografia.js`): `letras` | `tildes` |
  `gramatica` | `puntuacion`. Es lo que la docente pidió distinguir —
  "las letras que en verdad van", "la entonación" (que en la plataforma
  se llama `tildes`, para no confundirla con la prosodia de FLUIDEZ) y
  "la gramática"; `puntuacion` se agregó porque desde 8° la coma y el
  punto no caben en ninguno de los otros tres. El servidor lo normaliza
  siempre (`normalizarFoco`), nunca se confía el valor del cliente.
- El banco (8 por grado, 48 en total) vive en `prisma/bancoOrtografia.js`,
  aparte de `BANCO` por tamaño, y se siembra en el mismo bucle del seed.
  Progresión y reparto de focos por grado justificados en
  `docs/estudio-ortografia-y-gramatica.md`.
- El panel del docente muestra "Ortografía por foco"
  (`desglosePorFoco` de `GET /docente/resumen`), el equivalente de
  "Comprensión por habilidad".

## Mecánica de juego (estilo Duolingo)
- **Opciones aleatorias:** `lib/contenido.js` → `contenidoPublico()` baraja
  el orden de `opciones` en cada petición (Fisher-Yates) y quita
  `respuesta`/`explicacion` antes de enviarlas al estudiante. Por eso
  `Actividad.contenido.respuesta` en PALABRAS, ORTOGRAFIA **y** COMPRENSION es el
  **texto** de la opción correcta (no un índice) — así la validación de
  `POST /actividades/:id/intentos` funciona sin importar el orden
  mostrado. Si agregas actividades a mano, `respuesta` debe ser una de
  las cadenas de `opciones`, igual en los tres módulos.
- **Sin reintento:** cada pregunta se responde una sola vez (acierte o
  falle); el frontend siempre avanza a la siguiente con "Siguiente →"
  tras mostrar la explicación — no hay botón "Intentar de nuevo" en
  ningún módulo (incluida Fluidez, que ya no permite releer el mismo
  texto).
- **Repetir la lección:** al responder la última actividad ya no se salta
  al panel: se muestra `LeccionCompletada.jsx` con el marcador de ESA
  pasada (aciertos y puntos, contados en el estado del módulo) y un botón
  para rehacerla desde la primera. Como el componente del módulo **no se
  desmonta** al cambiar de `:id`, `repetir()` reinicia a mano corazones,
  falladas, aciertos y puntos. En el panel, `elegirSiguiente()` devuelve la
  **primera** actividad cuando ya están todas completadas (el botón dice
  "Repasar", y antes caía en la última pregunta).
- **Animaciones (index.css, prefijo `ls-`):** entrada escalonada de las
  opciones (`ls-entra` + `--retraso`), relieve tipo tecla en los botones
  (`ls-opcion`, borde inferior de 4px que se hunde), rebote al acertar
  (`ls-acierto`), temblor al fallar (`ls-fallo`), panel de explicación que
  sube (`ls-sube`) y latido del corazón perdido (`ls-latido`). Todas están
  anuladas bajo `prefers-reduced-motion`, donde además se fuerza
  `opacity: 1` porque las entradas usan `both` y si no quedarían invisibles.
  **La animación nunca decide el valor mostrado:** la barra de progreso
  pinta su ancho directo y deja que la transición de CSS lo anime — usar
  `requestAnimationFrame` para eso la dejaba en 0% en pestañas de fondo,
  donde el navegador no ejecuta rAF.
- **2 corazones por lección:** `CORAZONES_POR_LECCION` en
  `lib/constants.js` (solo referencia; el valor real vive como
  `CORAZONES_INICIALES` en cada `Modulo*.jsx`). Los corazones **no se
  reinician al pasar de pregunta** — solo al montar el componente de
  cero (salir y volver a entrar a la ruta). Al llegar a 0, se muestra
  `SinCorazones.jsx` en vez de la siguiente pregunta.
- **Recuperar corazón (repaso):** desde `SinCorazones.jsx` (prop
  `onRepasar`) el estudiante puede repasar una actividad para recuperar
  **un** corazón. A diferencia del flujo normal, el repaso **sí** permite
  reintentar hasta acertar (`RepasoPregunta.jsx` para PALABRAS/COMPRENSION;
  en Fluidez se relee el mismo texto). Al acertar, `corazonRecuperado()`
  fija las vidas en 1 y continúa la lección. El repaso no otorga puntos.
- **Explicación:** `POST /actividades/:id/intentos` devuelve
  `explicacion` (de `Actividad.contenido.explicacion`) junto con
  `respuestaCorrecta`; se muestra siempre, acierte o falle.
- **Verificación de fluidez por voz (opcional):** en `ModuloFluidez.jsx`
  el estudiante puede marcar una casilla (consentimiento explícito) para
  grabar su voz con `MediaRecorder` mientras lee. Al terminar, el audio
  se envía **una sola vez** a `POST /actividades/:id/verificar-audio`
  (ruta `routes/fluidezAudio.js`), que lo transcribe con Gemini
  (`services/ia.js` → `transcribirAudio`, `inline_data`) y lo compara
  contra el texto original por subsecuencia común más larga a nivel de
  palabra (`lib/comparadorTexto.js` → `compararLectura`). Es **solo
  retroalimentación**: nunca afecta puntos ni corazones (endpoint aparte
  de `/intentos` a propósito, para que un fallo de la IA no toque el
  puntaje por ppm). El audio no se persiste; si el micrófono falla, la
  lectura continúa normal. La transcripción `SIN_VOZ*` marca "sin voz".

## Propuestas de actividades con IA (docente/administrador)
- `PropuestaActividad`: actividad generada por Gemini con salida JSON
  estructurada (`services/ia.js` → `generarJSON`, usa
  `generationConfig.responseSchema`), en estado `pendiente` hasta que un
  docente/admin la apruebe (crea la `Actividad` real, `orden` = máximo +1
  para ese módulo/curso), la rechace, o pida una `regenerar` con una
  sugerencia en texto libre (la IA reescribe incorporando el feedback).
- El prompt usa el contexto de documentos (`services/contextoDocumentos.js`,
  compartido con el asistente de chat) y el enfoque pedagógico por curso
  (`lib/enfoquePorCurso.js`). En FLUIDEZ, `palabras` y `ppmObjetivo` se
  calculan en el servidor (nunca se le piden a la IA — evita repetir el
  bug de conteo de palabras que ya se corrigió una vez en el banco
  original) usando `lib/metasFluidez.js`.
- Un docente solo puede generar/aprobar/rechazar para sus
  `cursosAsignados` (`lib/cursosDocente.js` → `cursosPermitidosPara`,
  compartida entre `docente.js`, `ia.js` y `propuestas.js`); un
  administrador no tiene restricción.
- Frontend: pestaña "🧪 Actividades con IA" en `PanelDocente.jsx` →
  `PropuestasIA.jsx`.

## Reglas de negocio (puntos / niveles / racha / logros)
- Nivel = `floor(puntosTotales / 500) + 1`; progreso mostrado como
  `puntosTotales % 500` sobre `500`.
- Racha: se incrementa si la última actividad fue el día calendario
  anterior; se reinicia a 1 si hay un salto de más de un día.
- Los logros se evalúan en el backend (`services/logros.js`) tras cada
  intento, nunca en el cliente — evita que el frontend pueda "otorgarse"
  logros falsos.

## Tabla de posiciones (ranking)
- `GET /estudiantes/ranking` (solo estudiante): ranking **por curso** — no
  se compite entre cursos distintos porque tienen dificultades distintas.
  Devuelve el top 20 por `puntos` y, si el estudiante no está en ese top,
  su propia fila aparte (`yo`, `yoFueraDelTop`) para que siempre vea su
  posición. Frontend: `Ranking.jsx`, botón "🏆 Ranking" en
  `PanelEstudiante.jsx`, ruta `/ranking` (solo estudiante).

## Panel docente: seguimiento y reportes
- **Desglose por habilidad:** `construirResumenEstudiantes` (en
  `routes/docente.js`) devuelve `{filas, desglosePorNivel}`. Para
  COMPRENSION, cada intento se clasifica por `contenido.nivel`
  (`literal`/`inferencial`/`critico`; los nuevos usan un enum en el schema
  de Gemini de `propuestas.js`, con fallback a `literal`). El panel muestra
  la tarjeta "Comprensión por habilidad" con 3 tiles (aciertos/total) y,
  al lado, "Ortografía por foco" con 4 tiles construidos igual desde
  `contenido.foco` (`desglosePorFoco`).
- **Reportes descargables:** `GET /docente/reporte.csv` y
  `.../reporte.pdf` (PDF con `pdfkit`, alto de fila dinámico vía
  `doc.heightOfString()` para que nombres largos no se solapen). Frontend:
  botones "⬇️ CSV" / "⬇️ PDF" usando `apiDescargar` en `api/client.js`.
- **Restablecer contraseña de estudiante:** `POST
  /docente/estudiantes/:id/restablecer-password` genera una contraseña
  temporal (`lib/passwordTemporal.js`, `crypto.randomBytes`, alfabeto sin
  caracteres ambiguos) y la devuelve **una sola vez** para que el docente
  se la entregue al estudiante (no hay correo). Es un reset iniciado por el
  docente, no autoservicio. Frontend: botón "🔑 Reset" por fila en
  `PanelDocente.jsx`, banner verde que muestra la contraseña una vez.

## Gestión de actividades publicadas (docente)
- `routes/actividadesGestion.js` (montado en `/api/actividades-gestion`):
  GET (listar por curso/módulo), POST (crear), PUT (editar), POST
  `mover` (reordenar) y DELETE. `validarContenido()` valida la forma por
  módulo antes de guardar y `normalizarContenido()` aplica lo que nunca
  se toma del cliente (conteo de palabras en FLUIDEZ, `foco` en
  ORTOGRAFIA); ambos los comparten POST y PUT.
- **Crear** publica de una vez para el curso (a diferencia de las
  propuestas de IA, que pasan por revisión) con `orden` = máximo + 1,
  igual que al aprobar una propuesta. En el frontend es el botón
  "+ Nueva actividad" y reusa `FormularioActividad`, el mismo componente
  de la edición (sin `actividad` arranca en blanco).
  Reordenar y borrar usan transacciones Prisma: `mover` fija un `orden: -1`
  temporal para evitar chocar con el índice único `modulo_curso_orden`;
  DELETE borra primero los `Intento` hijos (FK) y luego la `Actividad`.
- Restringido a los cursos del docente (misma `cursosPermitidosPara`).
  Frontend: pestaña "✏️ Editar actividades" en `PanelDocente.jsx` →
  `GestionActividades.jsx`.

## Cursos y contenido por grado
- Cursos válidos: `6°, 7°, 8°, 9°, 10°, 11°` (`CURSOS` en
  `backend/src/lib/constants.js`, duplicado a propósito en
  `frontend/src/pages/Login.jsx`, `PanelDocente.jsx` y `PanelAdmin.jsx` —
  actualizar los cuatro si cambia la lista).
- Cada `Actividad` pertenece a un `curso` específico (además de su
  `modulo`); un estudiante solo ve y puede resolver actividades de su
  propio curso (`GET /modulos/:modulo/actividades` filtra por el curso del
  token; `GET /actividades/:id` y `POST .../intentos` devuelven 403 si la
  actividad no es de ese curso).
- El contenido base es semilla fija (`backend/prisma/seed.js`, objeto
  `BANCO` organizado por curso → módulo → actividades). Además, un docente
  puede editar/reordenar/eliminar las actividades publicadas de sus cursos
  (ver "Gestión de actividades publicadas"). `puntosBase` es fijo por
  módulo (20/20/30) en todos los cursos; la dificultad sube por el
  contenido, no por el puntaje.
- El banco actual (8 actividades por módulo por curso, **192 en total**:
  144 de los tres módulos originales + 48 de ORTOGRAFIA) se redactó con
  asistencia de IA siguiendo los estudios pedagógicos de
  `docs/estudio-contenidos-por-grado.md` (Estándares Básicos MEN, DBA v2
  y referencias de fluidez lectora) y
  `docs/estudio-ortografia-y-gramatica.md` (el mismo marco + la
  Ortografía de la RAE 2010) — **debe revisarse por las autoras o
  la docente antes de usarse en un salón real**. Para ampliarlo, seguir
  los criterios de redacción y los rangos de palabras/ppm de esos estudios.
- En FLUIDEZ, el campo `palabras` del `contenido` debe ser el conteo
  **real** de palabras del texto (la app calcula las ppm con él); en
  2026-07-20 se corrigieron 24 textos que lo tenían inflado.

## Roles y administración de usuarios
- Tres roles con login separado: `estudiante` (`/ingreso`), `docente`
  (`/ingreso-docente`) y `administrador` (`/ingreso-admin`), cada uno con
  su propia tabla (`Estudiante`, `Docente`, `Administrador`) y su propio
  JWT (`{ id, rol }`).
- **No hay registro público de estudiantes** (se quitó el 2026-07-21). Las
  cuentas las crea un docente (`POST /api/docente/estudiantes`, limitado a
  sus `cursosAsignados`) o un administrador (`POST /api/admin/estudiantes`,
  sin límite). `Login.jsx` solo inicia sesión y remite al docente. El
  motivo: el colegio controla quién entra, y evita cuentas falsas o con el
  curso mal elegido, que falsearían el ranking y los reportes por curso.
  Al crear, si no se envía `password` el servidor genera una temporal con
  `lib/passwordTemporal.js` y la devuelve **una sola vez** (misma lógica
  que el restablecimiento).
- **Token huérfano (fiabilidad):** un JWT válido de un estudiante ya
  eliminado (o cuya cuenta borró el admin) no debe tumbar el servidor. Las
  rutas de estudiante resuelven la cuenta con `lib/estudianteActual.js`
  (devuelve `null` + responde 401 en vez de lanzar, sustituyendo a
  `findUniqueOrThrow` en `actividades.js`/`estudiantes.js`). Como respaldo,
  `server.js` registra `process.on("unhandledRejection")` — Express 4 no
  atrapa el rechazo de una promesa async y, sin esto, un solo request con
  token huérfano mataba **todo** el proceso. Al agregar rutas de estudiante
  nuevas, usar `estudianteActual(req, res)`, no `findUniqueOrThrow`.
- `administrador` es un rol aparte de `docente`, no una variante — un
  docente normal no puede entrar a `/admin` ni llamar a `/api/admin/*`
  (`requireRole` en `backend/src/middleware/auth.js` acepta varios roles;
  las rutas de `/api/docente` aceptan `["docente","administrador"]`, las
  de `/api/admin` solo `["administrador"]`).
- El panel `/admin` (`frontend/src/pages/PanelAdmin.jsx` +
  `backend/src/routes/admin.js`) reemplaza la necesidad de editar SQL
  para gestión de cuentas: crear/editar/eliminar estudiantes, docentes y
  administradores desde la interfaz. Al eliminar un estudiante se borran
  también sus `Intento`/`EstudianteLogro` en la misma transacción. No se
  puede eliminar la propia cuenta de administrador logueada ni el último
  administrador restante (evita quedarse sin acceso de administración).
- El usuario de login **no distingue mayúsculas ni espacios sobrantes**:
  `lib/usuario.js` → `normalizarUsuario()` recorta y pasa a minúsculas, y se
  aplica tanto al crear cuentas (registro público y panel `/admin`) como al
  buscarlas en los tres logins. Por eso los `usuario` se guardan siempre en
  minúsculas; cualquier ruta nueva que reciba un usuario debe normalizarlo
  igual, o la cuenta quedará inalcanzable desde el login.
- Cuenta de administrador: el seed la crea con `ADMIN_USUARIO`/
  `ADMIN_PASSWORD` del `.env` y, si no están definidas, cae en
  `admin`/`R0CK3T` (solo para desarrollo). **Esas variables deben coincidir
  siempre con la cuenta real**: el upsert del seed busca por `usuario` con
  `update: {}`, así que si la cuenta se renombra en la base de datos y el
  `.env` conserva el nombre viejo, el siguiente reseed no la encuentra y
  crea una cuenta ADICIONAL con la contraseña por defecto — una puerta
  trasera silenciosa. En producción y en el entorno local el administrador
  es hoy `administrador` (2026-07-21), con las variables ya alineadas.
- Las tres pantallas de ingreso (`Login.jsx`, `LoginDocente.jsx`,
  `LoginAdmin.jsx`) se enlazan entre sí ("¿Eres...? Ingresa aquí") para
  que se pueda llegar a cualquiera de los tres roles desde cualquiera.
- Un `Docente` tiene `cursosAsignados` (JSON-string, mismo patrón que
  `Actividad.contenido`/`Logro.criterio`) y solo ve en `/docente` a los
  estudiantes de esos cursos (`docente.js` filtra con
  `cursosPermitidosPara(req.usuario)`); un docente sin cursos asignados
  ve un mensaje pidiendo que un administrador se los asigne, no una
  tabla vacía. El **administrador nunca se filtra** — siempre ve todos
  los cursos, sin importar `cursosAsignados`. Los cursos se asignan
  desde `/admin` → pestaña Docentes → botones de curso (selección
  múltiple).

## Documentos, material de refuerzo y asistente IA
- Modelo `Documento` + carpeta `backend/uploads/` (fuera del repo y de la
  carpeta pública; se descarga solo vía endpoint autenticado). En
  `backend/src/routes/documentos.js` el guard es `verifyToken` para todo
  y `soloCuerpoDocente` (`requireRole("docente","administrador")`) por
  ruta: subir, listar, borrar y cambiar visibilidad siguen siendo del
  cuerpo docente, y el estudiante recibe 403 en todas ellas.
- **Material de refuerzo (visible para estudiantes):** `Documento` tiene
  `visibleParaEstudiantes` (false por defecto — subir un archivo no debe
  publicarlo por accidente, hay rúbricas que solo son del docente) y
  `cursos` (JSON-string, arreglo vacío = todos los cursos, mismo patrón
  que `Docente.cursosAsignados`).
  - `GET /api/documentos/mios` (solo estudiante) devuelve los publicados
    para **su** curso, sin `subidoPor` ni `textoExtraido`.
  - `PATCH /api/documentos/:id/visibilidad` (docente/admin) publica o
    despublica y fija los cursos.
  - `GET /api/documentos/:id/descargar` es la única ruta compartida: si
    el rol es estudiante comprueba visibilidad **y** curso antes de
    servir el archivo — sin eso, tener el id de cualquier documento
    bastaría para bajarlo.
  - Frontend: `MaterialesEstudiante.jsx` (sección "Material de refuerzo"
    del panel del estudiante, se oculta si no hay nada publicado) y los
    controles de publicación en `DocumentosPanel.jsx`. Publicar exige
    elegir al menos un curso.
- Al subir un archivo se extrae su texto (`services/extraerTexto.js`:
  pdf-parse, mammoth, texto plano) y se guarda en `Documento.textoExtraido`
  — ese texto alimenta al asistente IA (RAG), no se re-procesa por consulta.
- Asistente IA (`routes/ia.js` + `services/ia.js`): proveedor
  intercambiable por env (`IA_PROVIDER`/`IA_API_KEY`/`IA_MODEL`); hoy usa
  la capa gratuita de Gemini (`gemini-flash-latest`) con cadena de modelos
  de respaldo si hay congestión. El contexto se arma en el backend:
  desempeño real por curso/módulo (respetando `cursosAsignados` del
  docente) + documentos subidos + síntesis del estudio pedagógico. La
  clave NUNCA va al frontend.
- Frontend: pestañas en `PanelDocente.jsx` (`DocumentosPanel.jsx`,
  `AsistenteIA.jsx`); `apiUpload`/`apiDescargar` en `api/client.js`.
- El script `dev` del backend usa `--watch-path=src` a propósito: con
  `--watch` a secas, cada subida a `uploads/` reiniciaba el servidor.

## Seguridad y rendimiento
Detalle completo (incluida la lista de tareas pendientes en el VPS y el
plan de contingencia) en `docs/seguridad-y-rendimiento.md`.
- `server.js` monta `helmet`, `compression`, `trust proxy 1` (nginx),
  tiempos límite del servidor y **aborta el arranque si falta
  `JWT_SECRET`** — sin secreto, el control de acceso no vale nada.
- **Límites de tasa** en `middleware/limites.js`. Regla de diseño: todo el
  colegio comparte una IP pública (NAT), así que los límites por IP son
  altos (600/min general, 20 fallos de login por 10 min) y lo caro se
  limita **por usuario** con el id del JWT: IA (30/5 min), audio de
  fluidez (10/5 min) e intentos (120/min). Un límite bajo por IP dejaría
  a un curso entero afuera a media clase.
- **Cuerpo de las peticiones:** 512 kB en toda la API. La excepción es
  `/actividades/:id/verificar-audio`, que recibe audio en base64 y monta
  su propio `express.json({ limit: "10mb" })` dentro de la ruta;
  `fluidezAudioRoutes` se monta antes del parser global a propósito
  (body-parser marca `req._body` y no vuelve a leer el cuerpo). Si se
  mueve ese `app.use`, el límite de 10 MB vuelve a aplicar a toda la API.
- El frontend carga por rutas (`React.lazy` en `App.jsx`) y solo importa
  el subconjunto **latino** de las fuentes; el precache del PWA pasó de
  2 733 KB a 888 KB. `frontend/reference/logo-original.jpg` guarda el
  logo en alta resolución (el de `public/` está reducido a 256 px).

## Producción (servidoria)
- `https://lectosmart.coltek.com.co` — desde el 2026-09-23 corre en
  `servidoria` (190.85.68.90, se entra con `ssh servidoria`, usuario
  `admin1` con `sudo`). Comparte el servidor con el CRM de Coltek, n8n y
  los bots: no tocar otros servicios. El VPS viejo (45.79.184.87) solo
  reenvía el dominio mientras propaga el DNS; ya no ejecuta la app.
- En servidoria **toda visita llega como 192.168.2.2** (el router no pasa
  la IP real): los `limit_req` de nginx están ×10 y los límites por IP de
  `middleware/limites.js` los comparten todos los visitantes.
- App en `/opt/lectosmart`, servicio systemd `lectosmart` (puerto 4000),
  nginx sirve `frontend/dist` y proxya `/api`. SSL Let's Encrypt.
- Base de datos: MySQL local `lectosmart` (usuario `lectosmart`,
  credenciales en `/opt/lectosmart/backend/.env`). Producción usa
  `prisma/schema.mysql.prisma` — **si cambias modelos en `schema.prisma`,
  replica el cambio allí** (difiere en provider y `@db.Text`).
- Despliegue: `npm run build` en frontend → tar de `backend` (sin
  node_modules/.env/dev.db/migrations) + `frontend/dist` → scp → extraer
  en `/opt/lectosmart` → `npx prisma db push --schema
  prisma/schema.mysql.prisma` → `npm run seed` (el seed es idempotente,
  usa `upsert`; hace falta cuando el banco de actividades cambió) →
  `systemctl restart lectosmart`.
- El `.env` de producción debe tener `FRONTEND_URL` (si no, la API acepta
  cualquier origen) y un `JWT_SECRET` largo (sin él la app ya no arranca).
- Respaldo diario 2:10am (`/usr/local/bin/backup-lectosmart.sh` →
  `/root/backups/lectosmart-<fecha>.sql.gz`, conserva 14).
- La instalación local del colegio (SQLite, sin internet) sigue siendo
  independiente de la del VPS.

## Git / commits
- Commits descriptivos en español, enfocados en el "por qué".
- No incluir `node_modules/`, `backend/prisma/dev.db` ni `.env` en el
  repositorio (ver `.gitignore`).
