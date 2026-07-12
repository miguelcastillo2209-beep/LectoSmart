-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Docente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "cursosAsignados" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Docente" ("createdAt", "id", "nombre", "passwordHash", "usuario") SELECT "createdAt", "id", "nombre", "passwordHash", "usuario" FROM "Docente";
DROP TABLE "Docente";
ALTER TABLE "new_Docente" RENAME TO "Docente";
CREATE UNIQUE INDEX "Docente_usuario_key" ON "Docente"("usuario");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
