const { Router } = require("express");
const prisma = require("../lib/prisma");
const { verifyToken, requireRole } = require("../middleware/auth");
const { MODULOS } = require("../lib/constants");
const { contenidoPublico } = require("../lib/contenido");
const { calcularNivel, calcularRacha } = require("../services/puntos");
const { evaluarLogros } = require("../services/logros");

const router = Router();

router.get("/modulos/:modulo/actividades", verifyToken, requireRole("estudiante"), async (req, res) => {
  const { modulo } = req.params;
  if (!MODULOS.includes(modulo)) {
    return res.status(400).json({ error: "Módulo inválido" });
  }

  const [actividades, intentosCorrectos] = await Promise.all([
    prisma.actividad.findMany({ where: { modulo }, orderBy: { orden: "asc" } }),
    prisma.intento.findMany({
      where: { estudianteId: req.usuario.id, correcto: true, actividad: { modulo } },
      select: { actividadId: true },
    }),
  ]);

  const completadasIds = new Set(intentosCorrectos.map((i) => i.actividadId));

  res.json(
    actividades.map((a) => ({
      id: a.id,
      titulo: a.titulo,
      orden: a.orden,
      completada: completadasIds.has(a.id),
    }))
  );
});

router.get("/actividades/:id", verifyToken, requireRole("estudiante"), async (req, res) => {
  const actividad = await prisma.actividad.findUnique({ where: { id: req.params.id } });
  if (!actividad) {
    return res.status(404).json({ error: "Actividad no encontrada" });
  }

  res.json({
    id: actividad.id,
    modulo: actividad.modulo,
    titulo: actividad.titulo,
    orden: actividad.orden,
    puntosBase: actividad.puntosBase,
    contenido: contenidoPublico(actividad),
  });
});

router.post("/actividades/:id/intentos", verifyToken, requireRole("estudiante"), async (req, res) => {
  const actividad = await prisma.actividad.findUnique({ where: { id: req.params.id } });
  if (!actividad) {
    return res.status(404).json({ error: "Actividad no encontrada" });
  }

  const contenido = JSON.parse(actividad.contenido);
  let correcto;
  let metadata = null;

  if (actividad.modulo === "FLUIDEZ") {
    const { tiempoSegundos } = req.body ?? {};
    if (!tiempoSegundos || tiempoSegundos <= 0) {
      return res.status(400).json({ error: "tiempoSegundos inválido" });
    }
    const ppm = Math.round(contenido.palabras / (tiempoSegundos / 60));
    correcto = ppm >= contenido.ppmObjetivo;
    metadata = JSON.stringify({ tiempoSegundos, ppm });
  } else {
    const { respuesta } = req.body ?? {};
    if (respuesta === undefined || respuesta === null) {
      return res.status(400).json({ error: "Falta la respuesta" });
    }
    correcto = respuesta === contenido.respuesta;
  }

  const puntosGanados = correcto ? actividad.puntosBase : 0;
  const estudianteAntes = await prisma.estudiante.findUniqueOrThrow({ where: { id: req.usuario.id } });
  const nuevaRacha = calcularRacha({
    rachaActual: estudianteAntes.racha,
    ultimaActividadEn: estudianteAntes.ultimaActividadEn,
  });

  const [, estudiante] = await prisma.$transaction([
    prisma.intento.create({
      data: { estudianteId: req.usuario.id, actividadId: actividad.id, correcto, puntosGanados, metadata },
    }),
    prisma.estudiante.update({
      where: { id: req.usuario.id },
      data: { puntos: { increment: puntosGanados }, racha: nuevaRacha, ultimaActividadEn: new Date() },
    }),
  ]);

  const logrosNuevos = await evaluarLogros(req.usuario.id);
  const { nivel, puntosEnNivel, metaNivel } = calcularNivel(estudiante.puntos);

  res.json({
    correcto,
    puntosGanados,
    respuestaCorrecta: contenido.respuesta ?? null,
    estudiante: { puntos: estudiante.puntos, nivel, puntosEnNivel, metaNivel, racha: estudiante.racha },
    logrosNuevos: logrosNuevos.map((l) => ({ codigo: l.codigo, nombre: l.nombre, icono: l.icono })),
  });
});

module.exports = router;
