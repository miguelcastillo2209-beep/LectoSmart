const { Router } = require("express");
const prisma = require("../lib/prisma");
const { verifyToken, requireRole } = require("../middleware/auth");
const { limitadorIA } = require("../middleware/limites");
const { cursosPermitidosPara } = require("../lib/cursosDocente");
const { consultarIA, iaConfigurada } = require("../services/ia");
const { construirContextoDocumentos } = require("../services/contextoDocumentos");

const router = Router();
// El asistente IA es exclusivo de docentes y administradores.
router.use(verifyToken, requireRole("docente", "administrador"));

const MAX_TURNOS_HISTORIAL = 10;

router.get("/estado", (_req, res) => {
  res.json({ configurada: iaConfigurada() });
});

router.post("/consultar", limitadorIA, async (req, res) => {
  const pregunta = String(req.body?.pregunta || "").trim();
  if (!pregunta) return res.status(400).json({ error: "Escribe una pregunta" });
  if (pregunta.length > 4000) {
    return res.status(400).json({ error: "La pregunta es demasiado larga" });
  }

  try {
    const [contextoEstudiantes, contextoDocumentos] = await Promise.all([
      construirContextoEstudiantes(req.usuario),
      construirContextoDocumentos(),
    ]);

    const instrucciones = construirInstrucciones(contextoEstudiantes, contextoDocumentos);

    // Historial opcional de la conversación (lo maneja el frontend).
    const historial = Array.isArray(req.body.historial)
      ? req.body.historial
          .filter((m) => m && (m.rol === "usuario" || m.rol === "ia") && typeof m.texto === "string")
          .slice(-MAX_TURNOS_HISTORIAL)
      : [];

    const respuesta = await consultarIA({
      instrucciones,
      mensajes: [...historial, { rol: "usuario", texto: pregunta }],
    });

    res.json({ respuesta });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// ── Contexto: desempeño real de los estudiantes ────────────────────────

async function construirContextoEstudiantes(usuario) {
  const cursosPermitidos = await cursosPermitidosPara(prisma, usuario);

  const estudiantes = await prisma.estudiante.findMany({
    where: cursosPermitidos ? { curso: { in: cursosPermitidos } } : undefined,
    select: { id: true, nombre: true, curso: true, puntos: true, racha: true },
  });
  if (estudiantes.length === 0) {
    return "Aún no hay estudiantes registrados en los cursos de este usuario.";
  }

  const idsEstudiantes = estudiantes.map((e) => e.id);
  const intentos = await prisma.intento.findMany({
    where: { estudianteId: { in: idsEstudiantes } },
    select: {
      estudianteId: true,
      correcto: true,
      metadata: true,
      actividad: { select: { modulo: true, curso: true } },
    },
  });

  // Agregados por curso y módulo + ppm promedio en fluidez.
  const porCurso = new Map();
  for (const e of estudiantes) {
    if (!porCurso.has(e.curso)) {
      porCurso.set(e.curso, {
        estudiantes: 0,
        modulos: {
          PALABRAS: { total: 0, correctos: 0 },
          ORTOGRAFIA: { total: 0, correctos: 0 },
          COMPRENSION: { total: 0, correctos: 0 },
          FLUIDEZ: { total: 0, correctos: 0, sumaPpm: 0, conPpm: 0 },
        },
      });
    }
    porCurso.get(e.curso).estudiantes += 1;
  }

  const porEstudiante = new Map(
    estudiantes.map((e) => [e.id, { ...e, total: 0, correctos: 0 }])
  );

  for (const intento of intentos) {
    const curso = porCurso.get(intento.actividad.curso);
    const stats = curso?.modulos[intento.actividad.modulo];
    if (stats) {
      stats.total += 1;
      if (intento.correcto) stats.correctos += 1;
      if (intento.actividad.modulo === "FLUIDEZ" && intento.metadata) {
        try {
          const meta = JSON.parse(intento.metadata);
          if (typeof meta.ppm === "number" && meta.ppm > 0) {
            stats.sumaPpm += meta.ppm;
            stats.conPpm += 1;
          }
        } catch {}
      }
    }
    const est = porEstudiante.get(intento.estudianteId);
    if (est) {
      est.total += 1;
      if (intento.correcto) est.correctos += 1;
    }
  }

  const lineas = [];
  for (const [curso, datos] of [...porCurso.entries()].sort()) {
    const m = datos.modulos;
    const pct = (x) => (x.total > 0 ? `${Math.round((x.correctos / x.total) * 100)}% de acierto en ${x.total} intentos` : "sin intentos aún");
    const ppm = m.FLUIDEZ.conPpm > 0 ? `, ppm promedio ${Math.round(m.FLUIDEZ.sumaPpm / m.FLUIDEZ.conPpm)}` : "";
    lineas.push(
      `- Curso ${curso} (${datos.estudiantes} estudiantes): Palabras ${pct(m.PALABRAS)}; Ortografía ${pct(m.ORTOGRAFIA)}; Comprensión ${pct(m.COMPRENSION)}; Fluidez ${pct(m.FLUIDEZ)}${ppm}.`
    );
  }

  const conDificultad = [...porEstudiante.values()]
    .filter((e) => e.total >= 3 && e.correctos / e.total < 0.5)
    .sort((a, b) => a.correctos / a.total - b.correctos / b.total)
    .slice(0, 15)
    .map((e) => `- ${e.nombre} (${e.curso}): ${Math.round((e.correctos / e.total) * 100)}% de acierto en ${e.total} intentos`);

  return [
    "Desempeño por curso:",
    ...lineas,
    conDificultad.length > 0 ? "\nEstudiantes que más necesitan refuerzo (acierto < 50%):" : "",
    ...conDificultad,
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Instrucciones del asistente ────────────────────────────────────────

function construirInstrucciones(contextoEstudiantes, contextoDocumentos) {
  return `Eres el asistente pedagógico de LectoSmart, una plataforma web de lectura para secundaria (grados 6° a 11°) de la I.E. Técnica Valle de Tenza (Guateque, Boyacá, Colombia). Hablas SOLO con docentes y administradores, nunca con estudiantes.

La plataforma tiene 4 módulos por grado: Reconocer palabras (vocabulario: sinónimos, antónimos, morfología), Escribir sin errores (ortografía y gramática, con cuatro focos: letras que se confunden, tildes, gramática/concordancia y puntuación), Comprensión lectora (texto + pregunta de opción múltiple) y Fluidez lectora (lectura cronometrada medida en palabras por minuto, ppm).

Referentes que fundamentan el contenido (síntesis del estudio pedagógico del proyecto, basado en los Estándares Básicos de Competencias del MEN y los DBA de Lenguaje v2):
- 6°: comprensión literal, vocabulario básico; meta 95-115 ppm.
- 7°: morfología (prefijos/sufijos), inferencias simples; meta 110-125 ppm.
- 8°: conectores, sentido global en textos expositivos, causa-efecto; meta 120-140 ppm.
- 9°: texto argumentativo (tesis, argumentos, hecho vs. opinión); meta 130-150 ppm.
- 10°: lenguaje figurado, connotación, postura del autor; meta 140-160 ppm.
- 11°: lectura crítica tipo Saber 11 (falacias, validez, contraste de posturas); meta 150-170 ppm.
- Niveles de lectura (ICFES): literal → inferencial → crítico.
- Ortografía por grado (estudio aparte): 6°-7° pesan las letras que se confunden (b/v, s/c/z, g/j, h) y las reglas de acentuación; 8°-9° la tilde diacrítica, los homófonos (echar/hechar, a ver/haber, porque/por qué, sino/si no) y la coma; 10°-11° la sintaxis del habla que no debe pasar al escrito (dequeísmo, queísmo, haber impersonal), el registro formal y la puntuación del texto largo.

DATOS REALES Y ACTUALES de los estudiantes de este docente:
${contextoEstudiantes}
${contextoDocumentos ? `\nDOCUMENTOS DE APOYO subidos por los docentes/administración (úsalos como fuente principal cuando sean pertinentes):\n\n${contextoDocumentos}` : ""}

Cómo respondes:
- En español claro y cercano, para docentes de colegio. Respuestas concretas y accionables, no teoría abstracta.
- Apóyate en los DATOS REALES de arriba cuando el docente pregunte por sus cursos o estudiantes; cita cifras específicas.
- Cuando propongas actividades nuevas, usa el formato de la plataforma (Palabras y Escribir sin errores: instrucción + 3 opciones + respuesta, y en ortografía la palabra siempre dentro de una oración; Comprensión: texto ≤100 palabras + pregunta + 3 opciones; Fluidez: texto con el rango de palabras y ppm del grado) y el nivel del grado según los referentes.
- Prefiere contextos cercanos a los estudiantes (Valle de Tenza, vida rural, colegio) en 6°-8°, y temas nacionales/universales en 9°-11°.
- Si te preguntan algo fuera de la pedagogía/lectura/gestión del aula, redirige amablemente al propósito del asistente.
- Sé honesto cuando no haya datos suficientes para responder algo.`;
}

module.exports = router;
