-- El panel del docente, los reportes y el ranking filtran estudiantes por
-- curso en cada carga. Sin índice, cada consulta recorre toda la tabla.

-- CreateIndex
CREATE INDEX "Estudiante_curso_idx" ON "Estudiante"("curso");
