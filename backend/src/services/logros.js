const prisma = require("../lib/prisma");
const { calcularNivel } = require("./puntos");

function cumpleCriterio(criterio, { intentosCompletados, racha, puntos }) {
  const { tipo, valor } = JSON.parse(criterio);
  if (tipo === "intentos_completados") return intentosCompletados >= valor;
  if (tipo === "racha") return racha >= valor;
  if (tipo === "nivel") return calcularNivel(puntos).nivel >= valor;
  return false;
}

// Evalúa el catálogo de logros contra el estado actual del estudiante y
// desbloquea (persiste) los que aún no tenía. Devuelve los logros nuevos.
async function evaluarLogros(estudianteId) {
  const [estudiante, catalogo, yaConseguidos] = await Promise.all([
    prisma.estudiante.findUniqueOrThrow({ where: { id: estudianteId } }),
    prisma.logro.findMany(),
    prisma.estudianteLogro.findMany({ where: { estudianteId } }),
  ]);

  const intentosCompletados = await prisma.intento.count({
    where: { estudianteId, correcto: true },
  });

  const conseguidosIds = new Set(yaConseguidos.map((l) => l.logroId));
  const estado = { intentosCompletados, racha: estudiante.racha, puntos: estudiante.puntos };

  const nuevos = catalogo.filter(
    (logro) => !conseguidosIds.has(logro.id) && cumpleCriterio(logro.criterio, estado)
  );

  if (nuevos.length > 0) {
    await prisma.estudianteLogro.createMany({
      data: nuevos.map((l) => ({ estudianteId, logroId: l.id })),
    });
  }

  return nuevos;
}

module.exports = { evaluarLogros };
