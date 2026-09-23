const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs/promises");
const prisma = require("../lib/prisma");
const { verifyToken, requireRole } = require("../middleware/auth");
const { extraerTexto } = require("../services/extraerTexto");
const { estudianteActual } = require("../lib/estudianteActual");
const { CURSOS } = require("../lib/constants");

const router = Router();
// Toda ruta exige sesión. Gestionar documentos (subir, publicar, borrar)
// sigue siendo de docentes y administradores; el estudiante solo llega a
// los que se marcaron como material de refuerzo para su curso.
router.use(verifyToken);

const soloCuerpoDocente = requireRole("docente", "administrador");

// Los cursos se guardan como JSON-string (mismo patrón que
// Docente.cursosAsignados). Un arreglo vacío significa "todos los cursos".
function cursosDe(documento) {
  try {
    const lista = JSON.parse(documento.cursos);
    return Array.isArray(lista) ? lista : [];
  } catch {
    return [];
  }
}

function esParaCurso(documento, curso) {
  const cursos = cursosDe(documento);
  return cursos.length === 0 || cursos.includes(curso);
}

// Normaliza lo que llega del cliente a una lista de cursos válidos, sin
// repetidos y en el orden oficial de CURSOS.
function normalizarCursos(valor) {
  const lista = Array.isArray(valor) ? valor : [];
  return CURSOS.filter((c) => lista.includes(c));
}

// Los archivos viven fuera de la carpeta pública del frontend; solo se
// sirven a través del endpoint autenticado de descarga.
const CARPETA_UPLOADS = path.join(__dirname, "..", "..", "uploads");

const EXTENSIONES_PERMITIDAS = ["pdf", "docx", "txt", "md", "csv"];
const TAMANO_MAXIMO = 15 * 1024 * 1024; // 15 MB

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(CARPETA_UPLOADS, { recursive: true });
      cb(null, CARPETA_UPLOADS);
    } catch (err) {
      cb(err);
    }
  },
  filename: (_req, file, cb) => {
    // Nombre aleatorio en disco (evita colisiones y path traversal);
    // el nombre original se conserva en la base de datos.
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomBytes(16).toString("hex")}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: TAMANO_MAXIMO },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).slice(1).toLowerCase();
    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      return cb(new Error(`Formato no permitido. Usa: ${EXTENSIONES_PERMITIDAS.join(", ")}`));
    }
    cb(null, true);
  },
});

router.get("/", soloCuerpoDocente, async (_req, res) => {
  const documentos = await prisma.documento.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nombre: true,
      mimeType: true,
      tamano: true,
      descripcion: true,
      subidoPor: true,
      createdAt: true,
      visibleParaEstudiantes: true,
      cursos: true,
    },
  });
  // No mandamos textoExtraido al listado (puede ser enorme); solo
  // señalamos si la IA podrá usar cada documento.
  const conTexto = await prisma.documento.findMany({
    where: { textoExtraido: { not: null } },
    select: { id: true },
  });
  const idsConTexto = new Set(conTexto.map((d) => d.id));
  res.json(
    documentos.map((d) => ({
      ...d,
      cursos: cursosDe(d),
      legibleParaIA: idsConTexto.has(d.id),
    }))
  );
});

// Material de refuerzo del estudiante: solo los documentos publicados
// para su curso. Nunca expone quién lo subió ni el texto extraído.
router.get("/mios", requireRole("estudiante"), async (req, res) => {
  const estudiante = await estudianteActual(req, res);
  if (!estudiante) return;

  const documentos = await prisma.documento.findMany({
    where: { visibleParaEstudiantes: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nombre: true,
      mimeType: true,
      tamano: true,
      descripcion: true,
      cursos: true,
      createdAt: true,
    },
  });

  res.json(
    documentos
      .filter((d) => esParaCurso(d, estudiante.curso))
      .map((d) => ({
        id: d.id,
        nombre: d.nombre,
        mimeType: d.mimeType,
        tamano: d.tamano,
        descripcion: d.descripcion,
        createdAt: d.createdAt,
      }))
  );
});

router.post("/", soloCuerpoDocente, (req, res) => {
  upload.single("archivo")(req, res, async (err) => {
    if (err) {
      const mensaje =
        err.code === "LIMIT_FILE_SIZE" ? "El archivo supera el límite de 15 MB" : err.message;
      return res.status(400).json({ error: mensaje });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    // multer decodifica originalname como latin1; lo pasamos a utf8 para
    // que tildes y eñes se guarden bien.
    const nombreOriginal = Buffer.from(req.file.originalname, "latin1").toString("utf8");

    const textoExtraido = await extraerTexto(req.file.path, req.file.mimetype, nombreOriginal);

    // En multipart todo llega como texto: el checkbox viaja como "true".
    // Los cursos vienen como JSON-string desde el formulario.
    const visibleParaEstudiantes = req.body.visibleParaEstudiantes === "true";
    let cursos = [];
    try {
      cursos = normalizarCursos(JSON.parse(req.body.cursos || "[]"));
    } catch {
      cursos = [];
    }

    const documento = await prisma.documento.create({
      data: {
        nombre: nombreOriginal,
        archivo: req.file.filename,
        mimeType: req.file.mimetype,
        tamano: req.file.size,
        descripcion: req.body.descripcion?.trim() || null,
        visibleParaEstudiantes,
        cursos: JSON.stringify(cursos),
        textoExtraido,
        subidoPor: req.usuario.rol === "administrador" ? "Administración" : (req.body.subidoPor || "Docente"),
      },
    });

    res.status(201).json({
      id: documento.id,
      nombre: documento.nombre,
      visibleParaEstudiantes: documento.visibleParaEstudiantes,
      legibleParaIA: textoExtraido !== null,
    });
  });
});

// Publicar/despublicar un documento como material de refuerzo y elegir a
// qué cursos llega (lista vacía = a todos).
router.patch("/:id/visibilidad", soloCuerpoDocente, async (req, res) => {
  const documento = await prisma.documento.findUnique({ where: { id: req.params.id } });
  if (!documento) return res.status(404).json({ error: "Documento no encontrado" });

  const visibleParaEstudiantes = Boolean(req.body?.visibleParaEstudiantes);
  const cursos = normalizarCursos(req.body?.cursos);

  const actualizado = await prisma.documento.update({
    where: { id: documento.id },
    data: { visibleParaEstudiantes, cursos: JSON.stringify(cursos) },
    select: { id: true, visibleParaEstudiantes: true, cursos: true },
  });

  res.json({ ...actualizado, cursos: cursosDe(actualizado) });
});

// Descarga autenticada. El estudiante solo pasa si el documento está
// publicado como refuerzo Y es de su curso: sin esta comprobación, tener
// el id de cualquier documento (incluidas rúbricas o exámenes) bastaría
// para bajarlo.
router.get("/:id/descargar", async (req, res) => {
  const documento = await prisma.documento.findUnique({ where: { id: req.params.id } });
  if (!documento) return res.status(404).json({ error: "Documento no encontrado" });

  if (req.usuario.rol === "estudiante") {
    const estudiante = await estudianteActual(req, res);
    if (!estudiante) return;
    if (!documento.visibleParaEstudiantes || !esParaCurso(documento, estudiante.curso)) {
      return res.status(403).json({ error: "Este documento no está disponible para tu curso" });
    }
  }

  const ruta = path.join(CARPETA_UPLOADS, documento.archivo);
  res.download(ruta, documento.nombre, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: "El archivo ya no está disponible en el servidor" });
    }
  });
});

router.delete("/:id", soloCuerpoDocente, async (req, res) => {
  const documento = await prisma.documento.findUnique({ where: { id: req.params.id } });
  if (!documento) return res.status(404).json({ error: "Documento no encontrado" });

  await prisma.documento.delete({ where: { id: documento.id } });
  // Borrar el archivo físico es lo de menos: si falla, la fila ya no existe.
  fs.unlink(path.join(CARPETA_UPLOADS, documento.archivo)).catch(() => {});

  res.status(204).end();
});

module.exports = router;
