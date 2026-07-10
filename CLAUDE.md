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

## Contenido de actividades
- En esta fase el contenido (palabras, textos de comprensión, lecturas de
  fluidez) es semilla fija (`backend/prisma/seed.js`), no hay CRUD docente
  todavía. Al añadir actividades nuevas, seguir el formato de `contenido`
  JSON documentado en el seed de cada módulo.

## Git / commits
- Commits descriptivos en español, enfocados en el "por qué".
- No incluir `node_modules/`, `backend/prisma/dev.db` ni `.env` en el
  repositorio (ver `.gitignore`).
