/*
  Warnings:

  - Added the required column `curso` to the `Actividad` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Actividad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modulo" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "puntosBase" INTEGER NOT NULL DEFAULT 20,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Actividad" ("contenido", "createdAt", "id", "modulo", "orden", "puntosBase", "titulo") SELECT "contenido", "createdAt", "id", "modulo", "orden", "puntosBase", "titulo" FROM "Actividad";
DROP TABLE "Actividad";
ALTER TABLE "new_Actividad" RENAME TO "Actividad";
CREATE UNIQUE INDEX "Actividad_modulo_curso_orden_key" ON "Actividad"("modulo", "curso", "orden");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
