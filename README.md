# LectoSmart

Plataforma web educativa de lectura — proyecto de grado, I.E. Técnica Valle
de Tenza (Guateque, 2026). Autoras: Danna Valentina Ramírez y Aileen Celeste
Guevara.

LectoSmart acompaña a estudiantes de básica primaria y secundaria a mejorar
su lectura mediante tres módulos de actividades (reconocer palabras,
comprensión lectora y fluidez lectora), con puntos, niveles, racha y logros
persistentes, y un panel para que el docente haga seguimiento del progreso
del curso.

## Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + react-router-dom
- **Backend**: Node.js + Express
- **Base de datos**: SQLite vía Prisma ORM
- **Autenticación**: JWT + bcrypt

Ver [`CLAUDE.md`](./CLAUDE.md) para las convenciones de código y diseño del
proyecto.

## Requisitos

- Node.js 20 o superior (probado con Node 24 LTS) y npm.

## Instalación y arranque en desarrollo

Se necesitan dos terminales, una para el backend y otra para el frontend.

### 1. Backend (API)

```bash
cd backend
npm install
cp .env.example .env        # o crear .env manualmente (ver más abajo)
npx prisma migrate dev      # crea backend/prisma/dev.db y aplica el esquema
npm run seed                # siembra docente, logros y actividades de ejemplo
npm run dev                 # http://localhost:4000
```

Variables de entorno (`backend/.env`):

| Variable       | Descripción                                      |
| -------------- | ------------------------------------------------- |
| `DATABASE_URL` | Ruta del archivo SQLite (por defecto `file:./dev.db`) |
| `JWT_SECRET`   | Secreto para firmar los tokens JWT (cambiar en producción) |
| `PORT`         | Puerto del servidor (por defecto `4000`)          |

### 2. Frontend (SPA)

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

El frontend usa un proxy de Vite (`vite.config.js`) que redirige `/api` al
backend en `http://localhost:4000`, así que ambos deben estar corriendo a
la vez durante el desarrollo.

## Cuenta docente de prueba

El seed crea una cuenta docente de ejemplo para entrar al panel docente:

- **Usuario**: `mbernal`
- **Contraseña**: `docente123`

Las cuentas de estudiante se crean desde la pantalla de registro
("Soy estudiante" → "Soy nuevo") eligiendo un curso (3°, 5°, 7° o 9°).

## Estructura del repositorio

```
LectoSmart/
├── CLAUDE.md              # convenciones de código y diseño
├── backend/                # API REST (Express + Prisma + SQLite)
│   ├── prisma/schema.prisma
│   ├── prisma/seed.js
│   └── src/
└── frontend/                # SPA (React + Vite + Tailwind)
    ├── reference/lectosmart-prototipo.jsx   # prototipo de diseño aprobado
    └── src/
```

## Scripts útiles

| Comando (dentro de `backend/`) | Qué hace |
| --- | --- |
| `npm run dev` | Levanta la API con recarga automática |
| `npm run seed` | Vuelve a sembrar docente/logros/actividades (usa `upsert`, no duplica) |
| `npm run prisma:studio` | Abre Prisma Studio para inspeccionar la base de datos |

| Comando (dentro de `frontend/`) | Qué hace |
| --- | --- |
| `npm run dev` | Levanta el frontend con recarga automática |
| `npm run build` | Genera el build de producción en `frontend/dist` |
