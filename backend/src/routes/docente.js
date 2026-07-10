const { Router } = require("express");
const prisma = require("../lib/prisma");
const { verifyToken, requireRole } = require("../middleware/auth");
const { calcularNivel } = require("../services/puntos");

const router = Router();
router.use(verifyToken, requireRole("docente"));

const UMBRAL_REFUERZO = 50;

async function construirResumenEstudiantes() {
  const [estudiantes, intentos] = await Promise.all([
    prisma.estudiante.findMany(),
    prisma.intento.findMany({ select: { estudianteId: true, actividadId: true, correcto: true, actividad: { select: { modulo: true } } } }),
  ]);

  const porEstudiante = new Map(estudiantes.map((e) => [e.id, { actividadesCompletadas: new Set(), comprensionCorrectos: 0, comprensionTotal: 0 }]));

  for (const intento of intentos) {
    const stats = porEstudiante.get(intento.estudianteId);
    if (!stats) continue;
    if (intento.correcto) stats.actividadesCompletadas.add(intento.actividadId);
    if (intento.actividad.modulo === "COMPRENSION") {
      stats.comprensionTotal += 1;
      if (intento.correcto) stats.comprensionCorrectos += 1;
    }
  }

  return estudiantes.map((e) => {
    const stats = porEstudiante.get(e.id);
    const comprension = stats.comprensionTotal > 0 ? Math.round((stats.comprensionCorrectos / stats.comprensionTotal) * 100) : 0;
    const { nivel } = calcularNivel(e.puntos);
    return {
      id: e.id,
      nombre: e.nombre,
      curso: e.curso,
      nivel,
      puntos: e.puntos,
      actividades: stats.actividadesCompletadas.size,
      comprension,
      tieneActividad: stats.actividadesCompletadas.size > 0 || stats.comprensionTotal > 0,
    };
  });
}

router.get("/resumen", async (_req, res) => {
  const filas = await construirResumenEstudiantes();

  const activos = filas.filter((f) => f.tieneActividad);
  const actividadesCompletadas = filas.reduce((suma, f) => suma + f.actividades, 0);
  const comprensionPromedio =
    activos.length > 0 ? Math.round(activos.reduce((suma, f) => suma + f.comprension, 0) / activos.length) : 0;
  const necesitanRefuerzo = activos.filter((f) => f.comprension < UMBRAL_REFUERZO).length;

  res.json({
    estudiantesActivos: activos.length,
    actividadesCompletadas,
    comprensionPromedio,
    necesitanRefuerzo,
  });
});

router.get("/estudiantes", async (req, res) => {
  const { q, curso } = req.query;
  let filas = await construirResumenEstudiantes();

  if (curso) filas = filas.filter((f) => f.curso === curso);
  if (q) {
    const busqueda = String(q).trim().toLowerCase();
    filas = filas.filter((f) => f.nombre.toLowerCase().includes(busqueda));
  }

  filas.sort((a, b) => b.puntos - a.puntos);
  res.json(filas.map(({ tieneActividad, ...resto }) => resto));
});

module.exports = router;
