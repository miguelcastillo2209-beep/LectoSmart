-- Material de refuerzo: un documento puede publicarse para que los
-- estudiantes lo vean y lo descarguen desde su panel, opcionalmente
-- limitado a ciertos cursos. Por defecto sigue siendo privado del
-- cuerpo docente (visibleParaEstudiantes = false).
-- SQLite no permite añadir columnas con default a una tabla existente
-- sin recrearla, así que se copia la tabla (patrón estándar de Prisma).

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Documento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "archivo" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "descripcion" TEXT,
    "visibleParaEstudiantes" BOOLEAN NOT NULL DEFAULT false,
    "cursos" TEXT NOT NULL DEFAULT '[]',
    "textoExtraido" TEXT,
    "subidoPor" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Documento" ("archivo", "createdAt", "descripcion", "id", "mimeType", "nombre", "subidoPor", "tamano", "textoExtraido") SELECT "archivo", "createdAt", "descripcion", "id", "mimeType", "nombre", "subidoPor", "tamano", "textoExtraido" FROM "Documento";
DROP TABLE "Documento";
ALTER TABLE "new_Documento" RENAME TO "Documento";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
