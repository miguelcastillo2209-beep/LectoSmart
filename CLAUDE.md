# LectoSmart

Plataforma web educativa de lectura — proyecto de grado, I.E. Técnica Valle
de Tenza (Guateque, 2026). Autoras: Danna Valentina Ramírez y Aileen Celeste
Guevara.

## Stack
- Frontend: React 18 + Vite + Tailwind CSS + react-router-dom
- Backend: Node.js + Express
- Base de datos: SQLite vía Prisma ORM
- Autenticación: JWT + bcrypt (API stateless, token guardado en localStorage)

## Estructura
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

## Reglas de negocio (puntos / niveles / racha / logros)
- Nivel = `floor(puntosTotales / 500) + 1`; progreso mostrado como
  `puntosTotales % 500` sobre `500`.
- Racha: se incrementa si la última actividad fue el día calendario
  anterior; se reinicia a 1 si hay un salto de más de un día.
- Los logros se evalúan en el backend (`services/logros.js`) tras cada
  intento, nunca en el cliente — evita que el frontend pueda "otorgarse"
  logros falsos.

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
- El contenido es semilla fija (`backend/prisma/seed.js`, objeto `BANCO`
  organizado por curso → módulo → actividades), no hay CRUD docente
  todavía. `puntosBase` es fijo por módulo (20/20/30) en todos los cursos;
  la dificultad sube por el contenido, no por el puntaje.
- El banco actual (4 actividades por módulo por curso) se redactó con
  asistencia de IA siguiendo los Estándares Básicos de Competencias del
  Lenguaje (MEN) para secundaria — **debe revisarse por las autoras o la
  docente antes de usarse en un salón real**. Para ampliarlo, pedir un
  lote nuevo con el mismo formato de `contenido` por módulo y la
  progresión de dificultad por curso ya usada (ver historial de
  conversación / commit que introdujo el banco por grado).

## Roles y administración de usuarios
- Tres roles con login separado: `estudiante` (`/ingreso`), `docente`
  (`/ingreso-docente`) y `administrador` (`/ingreso-admin`), cada uno con
  su propia tabla (`Estudiante`, `Docente`, `Administrador`) y su propio
  JWT (`{ id, rol }`).
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
- Cuenta de administrador sembrada por defecto: usuario `admin`,
  contraseña `R0CK3T` (definida en `backend/prisma/seed.js` — cambiarla
  ahí, o desde el propio panel `/admin`, antes de un uso real).

## Git / commits
- Commits descriptivos en español, enfocados en el "por qué".
- No incluir `node_modules/`, `backend/prisma/dev.db` ni `.env` en el
  repositorio (ver `.gitignore`).
