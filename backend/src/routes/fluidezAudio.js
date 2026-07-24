const { Router } = require("express");
const prisma = require("../lib/prisma");
const { verifyToken, requireRole } = require("../middleware/auth");
const { estudianteActual } = require("../lib/estudianteActual");
const { transcribirAudio, iaConfigurada } = require("../services/ia");
const { compararLectura } = require("../lib/comparadorTexto");

const router = Router();

const MIME_PERMITIDOS = ["audio/webm", "audio/ogg", "audio/wav", "audio/mp4", "audio/mpeg"];
// Generoso para una lectura de 1-2 minutos codificada en base64 (~33% más pesada que el binario).
const AUDIO_MAX_BASE64 = 8 * 1024 * 1024;

// Verificación opcional de fluidez lectora: transcribe el audio que el
// estudiante grabó leyendo en voz alta y compara contra el texto
// original. Es un endpoint aparte de /intentos a propósito — si la IA
// falla o está congestionada, el puntaje por ppm ya calculado no se ve
// afectado en absoluto.
router.post("/actividades/:id/verificar-audio", verifyToken, requireRole("estudiante"), async (req, res) => {
  if (!iaConfigurada()) {
    return res.status(503).json({ error: "La verificación por voz no está disponible en este momento." });
  }

  const { audioBase64, mimeType } = req.body ?? {};
  if (!audioBase64 || typeof audioBase64 !== "string") {
    return res.status(400).json({ error: "Falta el audio" });
  }
  if (!mimeType || !MIME_PERMITIDOS.includes(mimeType)) {
    return res.status(400).json({ error: "Formato de audio no soportado" });
  }
  if (audioBase64.length > AUDIO_MAX_BASE64) {
    return res.status(413).json({ error: "El audio es demasiado largo" });
  }

  const [actividad, estudiante] = await Promise.all([
    prisma.actividad.findUnique({ where: { id: req.params.id } }),
    estudianteActual(req, res),
  ]);
  if (!estudiante) return; // ya respondió 401
  if (!actividad || actividad.modulo !== "FLUIDEZ") {
    return res.status(404).json({ error: "Actividad no encontrada" });
  }
  if (actividad.curso !== estudiante.curso) {
    return res.status(403).json({ error: "Esta actividad no es de tu curso" });
  }

  const contenido = JSON.parse(actividad.contenido);

  let transcripcion;
  try {
    transcripcion = await transcribirAudio({ audioBase64, mimeType });
  } catch (err) {
    return res.status(502).json({ error: err.message || "No se pudo procesar el audio" });
  }

  // El modelo a veces agrega ruido (marcas de tiempo, espacios) pese a
  // pedirle la respuesta exacta, así que se valida por prefijo en vez de
  // igualdad estricta.
  if (/^SIN_VOZ/i.test(transcripcion.trim())) {
    return res.json({ sinVoz: true, transcripcion: null, porcentaje: 0, palabrasCorrectas: 0, palabrasTotal: 0 });
  }

  const { porcentaje, palabrasCorrectas, palabrasTotal } = compararLectura(contenido.texto, transcripcion);

  res.json({ sinVoz: false, transcripcion, porcentaje, palabrasCorrectas, palabrasTotal });
});

module.exports = router;
