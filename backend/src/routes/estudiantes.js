const { Router } = require("express");
const prisma = require("../lib/prisma");
const { verifyToken, requireRole } = require("../middleware/auth");
const { MODULOS } = require("../lib/constants");
const { calcularNivel } = require("../services/puntos");

const router = Router();

router.get("/me", verifyToken, requireRole("estudiante"), async (req, res) => {
  const estudiante = await prisma.estudiante.findUniqueOrThrow({ where: { id: req.usuario.id } });

  const [actividades, intentosCorrectos, catalogoLogros, logrosConseguidos] = await Promise.all([
    prisma.actividad.findMany({ select: { id: true, modulo: true } }),
    prisma.intento.findMany({
      where: { estudianteId: estudiante.id, correcto: true },
      select: { actividadId: true },
      distinct: ["actividadId"],
    }),
    prisma.logro.findMany(),
    prisma.estudianteLogro.findMany({ where: { estudianteId: estudiante.id } }),
  ]);

  const completadasIds = new Set(intentosCorrectos.map((i) => i.actividadId));
  const progresoPorModulo = MODULOS.map((modulo) => {
    const deEsteModulo = actividades.filter((a) => a.modulo === modulo);
    const completadas = deEsteModulo.filter((a) => completadasIds.has(a.id)).length;
    const total = deEsteModulo.length;
    return {
      modulo,
      completadas,
      total,
      pct: total > 0 ? Math.round((completadas / total) * 100) : 0,
    };
  });

  const conseguidosIds = new Set(logrosConseguidos.map((l) => l.logroId));
  const logros = catalogoLogros.map((l) => ({
    codigo: l.codigo,
    nombre: l.nombre,
    icono: l.icono,
    descripcion: l.descripcion,
    conseguido: conseguidosIds.has(l.id),
  }));

  const { nivel, puntosEnNivel, metaNivel } = calcularNivel(estudiante.puntos);

  res.json({
    id: estudiante.id,
    nombre: estudiante.nombre,
    usuario: estudiante.usuario,
    curso: estudiante.curso,
    puntos: estudiante.puntos,
    nivel,
    puntosEnNivel,
    metaNivel,
    racha: estudiante.racha,
    progresoPorModulo,
    logros,
  });
});

module.exports = router;
