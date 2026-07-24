const { Router } = require("express");
const prisma = require("../lib/prisma");
const { verifyToken, requireRole } = require("../middleware/auth");
const { MODULOS } = require("../lib/constants");
const { calcularNivel } = require("../services/puntos");
const { estudianteActual } = require("../lib/estudianteActual");

const router = Router();

router.get("/me", verifyToken, requireRole("estudiante"), async (req, res) => {
  const estudiante = await estudianteActual(req, res);
  if (!estudiante) return;

  const [actividades, intentosCorrectos, catalogoLogros, logrosConseguidos] = await Promise.all([
    prisma.actividad.findMany({ where: { curso: estudiante.curso }, select: { id: true, modulo: true } }),
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

// Tabla de posiciones del propio curso (no compite entre cursos
// distintos, porque tienen dificultades distintas). Devuelve el top 20
// por puntos y, si el estudiante no está en ese top, su propia fila al
// final para que siempre vea dónde está parado.
router.get("/ranking", verifyToken, requireRole("estudiante"), async (req, res) => {
  const yo = await estudianteActual(req, res);
  if (!yo) return;

  const compañeros = await prisma.estudiante.findMany({
    where: { curso: yo.curso },
    orderBy: { puntos: "desc" },
    select: { id: true, nombre: true, puntos: true },
  });

  const conPosicion = compañeros.map((e, i) => ({
    id: e.id,
    nombre: e.nombre,
    puntos: e.puntos,
    nivel: calcularNivel(e.puntos).nivel,
    posicion: i + 1,
    esYo: e.id === yo.id,
  }));

  const TOP = 20;
  const top = conPosicion.slice(0, TOP);
  const miFila = conPosicion.find((e) => e.esYo);
  const estoyEnTop = top.some((e) => e.esYo);

  res.json({
    curso: yo.curso,
    total: conPosicion.length,
    top,
    yo: miFila,
    yoFueraDelTop: !estoyEnTop,
  });
});

module.exports = router;
