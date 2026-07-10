-- CreateTable
CREATE TABLE "Estudiante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "racha" INTEGER NOT NULL DEFAULT 0,
    "ultimaActividadEn" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Docente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Actividad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modulo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "puntosBase" INTEGER NOT NULL DEFAULT 20,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Intento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "estudianteId" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "correcto" BOOLEAN NOT NULL,
    "puntosGanados" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Intento_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Intento_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "Actividad" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Logro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "criterio" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EstudianteLogro" (
    "estudianteId" TEXT NOT NULL,
    "logroId" TEXT NOT NULL,
    "conseguidoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("estudianteId", "logroId"),
    CONSTRAINT "EstudianteLogro_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EstudianteLogro_logroId_fkey" FOREIGN KEY ("logroId") REFERENCES "Logro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_usuario_key" ON "Estudiante"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Docente_usuario_key" ON "Docente"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Actividad_modulo_orden_key" ON "Actividad"("modulo", "orden");

-- CreateIndex
CREATE INDEX "Intento_estudianteId_idx" ON "Intento"("estudianteId");

-- CreateIndex
CREATE INDEX "Intento_actividadId_idx" ON "Intento"("actividadId");

-- CreateIndex
CREATE UNIQUE INDEX "Logro_codigo_key" ON "Logro"("codigo");
