const { Router } = require("express");
const prisma = require("../lib/prisma");
const { verifyToken, requireRole } = require("../middleware/auth");
const { cursosPermitidosPara } = require("../lib/cursosDocente");
const { MODULOS, CURSOS } = require("../lib/constants");

const router = Router();
// Gestión (editar/reordenar/eliminar) de actividades YA publicadas.
// A diferencia de las rutas de estudiante, aquí sí se devuelve el
// contenido completo (incluida la respuesta correcta) — es exclusivo de
// docente/admin.
router.use(verifyToken, requireRole("docente", "administrador"));

async function validarAccesoCurso(usuario, curso) {
  const permitidos = await cursosPermitidosPara(prisma, usuario);
  if (permitidos !== null && !permitidos.includes(curso)) {
    const err = new Error("No tienes ese curso asignado");
    err.status = 403;
    throw err;
  }
}

// Misma validación que usa el generador de IA, para que una edición
// manual no pueda dejar una actividad con una respuesta que no exista
// entre sus opciones.
function validarContenido(modulo, contenido) {
  if (modulo === "PALABRAS") {
    const { instruccion, opciones, respuesta } = contenido || {};
    if (!instruccion?.trim()) return "Falta la instrucción";
    if (!Array.isArray(opciones) || opciones.length < 2) return "Debe haber al menos 2 opciones";
    if (!opciones.includes(respuesta)) return "La respuesta debe ser igual a una de las opciones";
    return null;
  }
  if (modulo === "COMPRENSION") {
    const { texto, pregunta, opciones, respuesta, nivel } = contenido || {};
    if (!texto?.trim()) return "Falta el texto";
    if (!pregunta?.trim()) return "Falta la pregunta";
    if (!Array.isArray(opciones) || opciones.length < 2) return "Debe haber al menos 2 opciones";
    if (!opciones.includes(respuesta)) return "La respuesta debe ser igual a una de las opciones";
    if (nivel && !["literal", "inferencial", "critico"].includes(nivel)) return "Nivel inválido";
    return null;
  }
  // FLUIDEZ
  const { texto, ppmObjetivo } = contenido || {};
  if (!texto?.trim()) return "Falta el texto";
  if (texto.trim().split(/\s+/).length < 20) return "El texto es demasiado corto";
  if (!ppmObjetivo || ppmObjetivo <= 0) return "La meta de ppm debe ser un número mayor a 0";
  return null;
}

router.get("/", async (req, res) => {
  const { curso, modulo } = req.query;
  if (!CURSOS.includes(curso)) return res.status(400).json({ error: "Curso inválido" });
  if (!MODULOS.includes(modulo)) return res.status(400).json({ error: "Módulo inválido" });

  try {
    await validarAccesoCurso(req.usuario, curso);
    const actividades = await prisma.actividad.findMany({
      where: { curso, modulo },
      orderBy: { orden: "asc" },
    });
    res.json(actividades.map((a) => ({ ...a, contenido: JSON.parse(a.contenido) })));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const actividad = await prisma.actividad.findUnique({ where: { id: req.params.id } });
  if (!actividad) return res.status(404).json({ error: "Actividad no encontrada" });

  try {
    await validarAccesoCurso(req.usuario, actividad.curso);

    const titulo = String(req.body?.titulo || "").trim();
    if (!titulo) return res.status(400).json({ error: "Falta el título" });

    const contenido = req.body?.contenido;
    const errorContenido = validarContenido(actividad.modulo, contenido);
    if (errorContenido) return res.status(400).json({ error: errorContenido });

    // El conteo de palabras de FLUIDEZ nunca se confía al cliente: se
    // recalcula del texto real, igual que en el seed y en el generador IA.
    const contenidoFinal =
      actividad.modulo === "FLUIDEZ"
        ? { texto: contenido.texto.trim(), palabras: contenido.texto.trim().split(/\s+/).length, ppmObjetivo: Number(contenido.ppmObjetivo) }
        : contenido;

    const actualizada = await prisma.actividad.update({
      where: { id: actividad.id },
      data: { titulo, contenido: JSON.stringify(contenidoFinal) },
    });
    res.json({ ...actualizada, contenido: JSON.parse(actualizada.contenido) });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post("/:id/mover", async (req, res) => {
  const direccion = req.body?.direccion;
  if (!["arriba", "abajo"].includes(direccion)) return res.status(400).json({ error: "Dirección inválida" });

  const actividad = await prisma.actividad.findUnique({ where: { id: req.params.id } });
  if (!actividad) return res.status(404).json({ error: "Actividad no encontrada" });

  try {
    await validarAccesoCurso(req.usuario, actividad.curso);

    const vecina = await prisma.actividad.findFirst({
      where: {
        modulo: actividad.modulo,
        curso: actividad.curso,
        orden: direccion === "arriba" ? { lt: actividad.orden } : { gt: actividad.orden },
      },
      orderBy: { orden: direccion === "arriba" ? "desc" : "asc" },
    });
    if (!vecina) return res.status(400).json({ error: `Ya está ${direccion === "arriba" ? "de primera" : "de última"}` });

    // Intercambio de orden con un valor temporal para no chocar con la
    // restricción única (modulo, curso, orden) durante la transacción.
    await prisma.$transaction([
      prisma.actividad.update({ where: { id: actividad.id }, data: { orden: -1 } }),
      prisma.actividad.update({ where: { id: vecina.id }, data: { orden: actividad.orden } }),
      prisma.actividad.update({ where: { id: actividad.id }, data: { orden: vecina.orden } }),
    ]);

    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const actividad = await prisma.actividad.findUnique({ where: { id: req.params.id } });
  if (!actividad) return res.status(404).json({ error: "Actividad no encontrada" });

  try {
    await validarAccesoCurso(req.usuario, actividad.curso);
    await prisma.$transaction([
      prisma.intento.deleteMany({ where: { actividadId: actividad.id } }),
      prisma.actividad.delete({ where: { id: actividad.id } }),
    ]);
    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
