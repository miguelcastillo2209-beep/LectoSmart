const { Router } = require("express");
const prisma = require("../lib/prisma");
const { verifyToken, requireRole } = require("../middleware/auth");
const { cursosPermitidosPara } = require("../lib/cursosDocente");
const { MODULOS, CURSOS, PUNTOS_BASE_POR_MODULO } = require("../lib/constants");
const { ENFOQUE_POR_CURSO } = require("../lib/enfoquePorCurso");
const { METAS_FLUIDEZ } = require("../lib/metasFluidez");
const { generarJSON } = require("../services/ia");
const { construirContextoDocumentos } = require("../services/contextoDocumentos");

const router = Router();
// Generar, revisar y aprobar actividades con IA es exclusivo de
// docentes y administradores; los estudiantes nunca ven propuestas.
router.use(verifyToken, requireRole("docente", "administrador"));

const CANTIDAD_MIN = 1;
const CANTIDAD_MAX = 5;
const CANTIDAD_DEFECTO = 3;

async function validarAccesoCurso(usuario, curso) {
  const permitidos = await cursosPermitidosPara(prisma, usuario);
  if (permitidos !== null && !permitidos.includes(curso)) {
    const err = new Error("No tienes ese curso asignado");
    err.status = 403;
    throw err;
  }
}

// ── Esquemas de salida JSON por módulo (para Gemini responseSchema) ────

function esquemaItemPorModulo(modulo) {
  if (modulo === "PALABRAS") {
    return {
      type: "OBJECT",
      properties: {
        titulo: { type: "STRING" },
        instruccion: { type: "STRING" },
        opciones: { type: "ARRAY", items: { type: "STRING" } },
        respuesta: { type: "STRING" },
        explicacion: { type: "STRING" },
      },
      required: ["titulo", "instruccion", "opciones", "respuesta", "explicacion"],
    };
  }
  if (modulo === "COMPRENSION") {
    return {
      type: "OBJECT",
      properties: {
        titulo: { type: "STRING" },
        texto: { type: "STRING" },
        pregunta: { type: "STRING" },
        opciones: { type: "ARRAY", items: { type: "STRING" } },
        respuesta: { type: "STRING" },
        explicacion: { type: "STRING" },
        // Nivel de lectura ICFES que evalúa la pregunta — se usa para el
        // desglose de errores por habilidad que ve el docente.
        nivel: { type: "STRING", enum: ["literal", "inferencial", "critico"] },
      },
      required: ["titulo", "texto", "pregunta", "opciones", "respuesta", "explicacion", "nivel"],
    };
  }
  // FLUIDEZ: palabras/ppmObjetivo se calculan en el servidor, no se le
  // piden a la IA (evita que invente un conteo de palabras incorrecto).
  return {
    type: "OBJECT",
    properties: {
      titulo: { type: "STRING" },
      texto: { type: "STRING" },
    },
    required: ["titulo", "texto"],
  };
}

function esquemaLotePorModulo(modulo) {
  return {
    type: "OBJECT",
    properties: {
      actividades: { type: "ARRAY", items: esquemaItemPorModulo(modulo) },
    },
    required: ["actividades"],
  };
}

// ── Construcción de prompts ─────────────────────────────────────────────

function instruccionesBase(modulo, curso) {
  const enfoque = ENFOQUE_POR_CURSO[curso];
  const descripcionModulo = {
    PALABRAS: "vocabulario/ortografía/morfología, con una instrucción, 3 opciones y una respuesta correcta",
    COMPRENSION: "un texto corto (máximo 100 palabras) seguido de una pregunta de opción múltiple con 3 opciones",
    FLUIDEZ: "un texto para leer en voz alta cronometrado (sin preguntas de opción múltiple)",
  }[modulo];

  return `Eres un experto en pedagogía del lenguaje que redacta actividades para LectoSmart, una plataforma de lectura de la I.E. Técnica Valle de Tenza (Guateque, Boyacá, Colombia) para el grado ${curso}.

Módulo: ${modulo} — cada actividad es ${descripcionModulo}.

Enfoque pedagógico de ${curso}: ${enfoque}

Reglas para redactar:
- Español correcto, natural, apto para estudiantes de secundaria colombianos.
- En 6°-8°, ambienta los textos en contextos cercanos (vereda, colegio, Valle de Tenza, vida rural); en 9°-11° puedes usar temas nacionales o universales.
- Los distractores (opciones incorrectas) deben ser plausibles, errores reales que un lector cometería, nunca absurdos.
- La "explicacion" es la retroalimentación que verá el estudiante después de responder (acierte o no): debe decir POR QUÉ la respuesta correcta es la correcta, en 1-2 frases claras, sin sonar robótica.
- No repitas literalmente el enunciado de la pregunta dentro de la explicación.
${modulo === "COMPRENSION" ? '- El campo "nivel" clasifica la pregunta según lo que exige del lector: "literal" (la respuesta está dicha explícitamente en el texto), "inferencial" (hay que deducirla de pistas, causas, sentimientos o el sentido global no dicho directamente), "critico" (hay que evaluar la validez de un argumento, distinguir hecho de opinión, detectar una falacia, o contrastar posturas). Clasifica con honestidad según la pregunta que redactaste, no según el grado.' : ""}
${modulo !== "FLUIDEZ" ? "- El campo \"respuesta\" debe ser EXACTAMENTE igual (carácter por carácter) a una de las cadenas de \"opciones\"." : ""}`;
}

function construirPeticionGeneracion({ modulo, curso, cantidad, contextoDocumentos, titulosExistentes }) {
  const instrucciones = instruccionesBase(modulo, curso);
  const partes = [`Genera ${cantidad} actividad(es) nueva(s) y original(es) de ${modulo} para ${curso}.`];

  if (titulosExistentes.length > 0) {
    partes.push(`Ya existen estas actividades en la plataforma para este grado y módulo — NO las repitas ni generes algo muy parecido:\n- ${titulosExistentes.join("\n- ")}`);
  }
  if (contextoDocumentos) {
    partes.push(`Da prioridad a basar el contenido en estos documentos que subió el colegio (úsalos como fuente de temas, datos o contexto cuando sea pertinente para el grado; si no aportan nada útil para este módulo, ignóralos):\n\n${contextoDocumentos}`);
  }

  return { instrucciones, prompt: partes.join("\n\n"), schema: esquemaLotePorModulo(modulo) };
}

function construirPeticionRegeneracion({ modulo, curso, itemActual, sugerencia }) {
  const instrucciones = instruccionesBase(modulo, curso);
  const prompt = `Esta es una actividad de ${modulo} para ${curso} que un docente revisó y pidió mejorar:

${JSON.stringify(itemActual, null, 2)}

Sugerencia del docente para mejorarla: "${sugerencia}"

Genera UNA versión mejorada de esta misma actividad que incorpore la sugerencia del docente. Puede cambiar el texto, las opciones, la pregunta o la explicación si hace falta, pero debe seguir siendo del mismo módulo y nivel. Devuelve solo esa actividad dentro del arreglo "actividades" (un único elemento).`;

  return { instrucciones, prompt, schema: esquemaLotePorModulo(modulo) };
}

// ── Normalización y validación de lo que devuelve la IA ────────────────

function normalizarItem(modulo, curso, item) {
  const titulo = String(item.titulo || "").trim().slice(0, 200);
  if (!titulo) return null;

  if (modulo === "PALABRAS") {
    const opciones = Array.isArray(item.opciones) ? item.opciones.map((o) => String(o).trim()).filter(Boolean) : [];
    const respuesta = String(item.respuesta || "").trim();
    const instruccion = String(item.instruccion || "").trim();
    if (opciones.length < 2 || !instruccion || !opciones.includes(respuesta)) return null;
    return { titulo, contenido: { instruccion, opciones, respuesta, explicacion: String(item.explicacion || "").trim() } };
  }

  if (modulo === "COMPRENSION") {
    const opciones = Array.isArray(item.opciones) ? item.opciones.map((o) => String(o).trim()).filter(Boolean) : [];
    const respuesta = String(item.respuesta || "").trim();
    const texto = String(item.texto || "").trim();
    const pregunta = String(item.pregunta || "").trim();
    if (opciones.length < 2 || !texto || !pregunta || !opciones.includes(respuesta)) return null;
    const nivel = ["literal", "inferencial", "critico"].includes(item.nivel) ? item.nivel : "literal";
    return { titulo, contenido: { texto, pregunta, opciones, respuesta, explicacion: String(item.explicacion || "").trim(), nivel } };
  }

  // FLUIDEZ: calculamos el conteo real de palabras (nunca confiar en el
  // conteo de la IA) y elegimos la meta de ppm del curso.
  const texto = String(item.texto || "").trim();
  const palabras = texto ? texto.split(/\s+/).length : 0;
  if (palabras < 30) return null;
  const meta = METAS_FLUIDEZ[curso];
  const ppmObjetivo = meta ? Math.round((meta.ppmMin + meta.ppmMax) / 2) : 120;
  return { titulo, contenido: { texto, palabras, ppmObjetivo } };
}

// ── Rutas ────────────────────────────────────────────────────────────────

router.get("/", async (req, res) => {
  const estado = ["pendiente", "aprobada", "rechazada"].includes(req.query.estado) ? req.query.estado : "pendiente";
  const permitidos = await cursosPermitidosPara(prisma, req.usuario);

  const where = { estado };
  if (req.query.modulo) where.modulo = req.query.modulo;
  if (req.query.curso) {
    if (permitidos !== null && !permitidos.includes(req.query.curso)) {
      return res.status(403).json({ error: "No tienes ese curso asignado" });
    }
    where.curso = req.query.curso;
  } else if (permitidos !== null) {
    where.curso = { in: permitidos.length > 0 ? permitidos : ["__ninguno__"] };
  }

  const propuestas = await prisma.propuestaActividad.findMany({ where, orderBy: { createdAt: "desc" } });
  res.json(
    propuestas.map((p) => ({
      id: p.id,
      modulo: p.modulo,
      curso: p.curso,
      titulo: p.titulo,
      contenido: JSON.parse(p.contenido),
      estado: p.estado,
      basadaEnDocumentos: p.basadaEnDocumentos,
      sugerenciaDocente: p.sugerenciaDocente,
      creadaPor: p.creadaPor,
      createdAt: p.createdAt,
    }))
  );
});

router.post("/generar", async (req, res) => {
  const { modulo, curso } = req.body || {};
  const cantidad = Math.min(CANTIDAD_MAX, Math.max(CANTIDAD_MIN, Number(req.body?.cantidad) || CANTIDAD_DEFECTO));

  if (!MODULOS.includes(modulo)) return res.status(400).json({ error: "Módulo inválido" });
  if (!CURSOS.includes(curso)) return res.status(400).json({ error: "Curso inválido" });

  try {
    await validarAccesoCurso(req.usuario, curso);

    const [contextoDocumentos, existentes, hayDocumentos] = await Promise.all([
      construirContextoDocumentos(),
      prisma.actividad.findMany({ where: { modulo, curso }, select: { titulo: true } }),
      prisma.documento.count({ where: { textoExtraido: { not: null } } }),
    ]);

    const { instrucciones, prompt, schema } = construirPeticionGeneracion({
      modulo,
      curso,
      cantidad,
      contextoDocumentos,
      titulosExistentes: existentes.map((a) => a.titulo),
    });

    const resultado = await generarJSON({ instrucciones, prompt, schema });
    const items = Array.isArray(resultado?.actividades) ? resultado.actividades : [];
    const normalizados = items.map((item) => normalizarItem(modulo, curso, item)).filter(Boolean);

    if (normalizados.length === 0) {
      return res.status(502).json({ error: "La IA no generó propuestas válidas esta vez. Intenta de nuevo." });
    }

    const nombreUsuario = req.usuario.rol === "administrador" ? "Administración" : req.body.nombreDocente || "Docente";
    const creadas = [];
    for (const item of normalizados) {
      const fila = await prisma.propuestaActividad.create({
        data: {
          modulo,
          curso,
          titulo: item.titulo,
          contenido: JSON.stringify(item.contenido),
          creadaPor: nombreUsuario,
          basadaEnDocumentos: hayDocumentos > 0,
        },
      });
      creadas.push({ ...fila, contenido: item.contenido });
    }

    res.status(201).json(creadas);
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message });
  }
});

router.post("/:id/regenerar", async (req, res) => {
  const sugerencia = String(req.body?.sugerencia || "").trim();
  if (!sugerencia) return res.status(400).json({ error: "Escribe una sugerencia para mejorar la propuesta" });

  const propuesta = await prisma.propuestaActividad.findUnique({ where: { id: req.params.id } });
  if (!propuesta) return res.status(404).json({ error: "Propuesta no encontrada" });
  if (propuesta.estado !== "pendiente") {
    return res.status(400).json({ error: "Esta propuesta ya fue revisada" });
  }

  try {
    await validarAccesoCurso(req.usuario, propuesta.curso);

    const { instrucciones, prompt, schema } = construirPeticionRegeneracion({
      modulo: propuesta.modulo,
      curso: propuesta.curso,
      itemActual: JSON.parse(propuesta.contenido),
      sugerencia,
    });

    const resultado = await generarJSON({ instrucciones, prompt, schema });
    const item = Array.isArray(resultado?.actividades) ? resultado.actividades[0] : null;
    const normalizado = item && normalizarItem(propuesta.modulo, propuesta.curso, item);

    if (!normalizado) {
      return res.status(502).json({ error: "La IA no pudo regenerar una versión válida. Intenta con otra sugerencia." });
    }

    const actualizada = await prisma.propuestaActividad.update({
      where: { id: propuesta.id },
      data: {
        titulo: normalizado.titulo,
        contenido: JSON.stringify(normalizado.contenido),
        sugerenciaDocente: sugerencia,
      },
    });

    res.json({ ...actualizada, contenido: normalizado.contenido });
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message });
  }
});

router.post("/:id/aprobar", async (req, res) => {
  const propuesta = await prisma.propuestaActividad.findUnique({ where: { id: req.params.id } });
  if (!propuesta) return res.status(404).json({ error: "Propuesta no encontrada" });
  if (propuesta.estado !== "pendiente") {
    return res.status(400).json({ error: "Esta propuesta ya fue revisada" });
  }

  try {
    await validarAccesoCurso(req.usuario, propuesta.curso);

    const actividad = await prisma.$transaction(async (tx) => {
      const ultima = await tx.actividad.findFirst({
        where: { modulo: propuesta.modulo, curso: propuesta.curso },
        orderBy: { orden: "desc" },
        select: { orden: true },
      });
      const nuevaActividad = await tx.actividad.create({
        data: {
          modulo: propuesta.modulo,
          curso: propuesta.curso,
          titulo: propuesta.titulo,
          contenido: propuesta.contenido,
          orden: (ultima?.orden ?? 0) + 1,
          puntosBase: PUNTOS_BASE_POR_MODULO[propuesta.modulo],
        },
      });
      await tx.propuestaActividad.update({
        where: { id: propuesta.id },
        data: { estado: "aprobada", actividadId: nuevaActividad.id },
      });
      return nuevaActividad;
    });

    res.json({ id: actividad.id, titulo: actividad.titulo, orden: actividad.orden });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post("/:id/rechazar", async (req, res) => {
  const propuesta = await prisma.propuestaActividad.findUnique({ where: { id: req.params.id } });
  if (!propuesta) return res.status(404).json({ error: "Propuesta no encontrada" });
  if (propuesta.estado !== "pendiente") {
    return res.status(400).json({ error: "Esta propuesta ya fue revisada" });
  }

  try {
    await validarAccesoCurso(req.usuario, propuesta.curso);
    const motivo = String(req.body?.motivo || "").trim() || null;
    await prisma.propuestaActividad.update({
      where: { id: propuesta.id },
      data: { estado: "rechazada", sugerenciaDocente: motivo },
    });
    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
