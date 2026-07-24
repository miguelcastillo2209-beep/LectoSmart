-- CreateTable
CREATE TABLE "Estudiante" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "puntos" INTEGER NOT NULL DEFAULT 0,
    "racha" INTEGER NOT NULL DEFAULT 0,
    "ultimaActividadEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Docente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "cursosAsignados" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Docente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Administrador" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Administrador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Actividad" (
    "id" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "puntosBase" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Actividad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Intento" (
    "id" TEXT NOT NULL,
    "estudianteId" TEXT NOT NULL,
    "actividadId" TEXT NOT NULL,
    "correcto" BOOLEAN NOT NULL,
    "puntosGanados" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Intento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logro" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "icono" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "criterio" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Logro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstudianteLogro" (
    "estudianteId" TEXT NOT NULL,
    "logroId" TEXT NOT NULL,
    "conseguidoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EstudianteLogro_pkey" PRIMARY KEY ("estudianteId","logroId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Estudiante_usuario_key" ON "Estudiante"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Docente_usuario_key" ON "Docente"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Administrador_usuario_key" ON "Administrador"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Actividad_modulo_curso_orden_key" ON "Actividad"("modulo", "curso", "orden");

-- CreateIndex
CREATE INDEX "Intento_estudianteId_idx" ON "Intento"("estudianteId");

-- CreateIndex
CREATE INDEX "Intento_actividadId_idx" ON "Intento"("actividadId");

-- CreateIndex
CREATE UNIQUE INDEX "Logro_codigo_key" ON "Logro"("codigo");

-- AddForeignKey
ALTER TABLE "Intento" ADD CONSTRAINT "Intento_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Intento" ADD CONSTRAINT "Intento_actividadId_fkey" FOREIGN KEY ("actividadId") REFERENCES "Actividad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstudianteLogro" ADD CONSTRAINT "EstudianteLogro_estudianteId_fkey" FOREIGN KEY ("estudianteId") REFERENCES "Estudiante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EstudianteLogro" ADD CONSTRAINT "EstudianteLogro_logroId_fkey" FOREIGN KEY ("logroId") REFERENCES "Logro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
