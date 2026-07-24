const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs/promises");
const prisma = require("../lib/prisma");
const { verifyToken, requireRole } = require("../middleware/auth");
const { extraerTexto } = require("../services/extraerTexto");

const router = Router();
// Solo docentes y administradores: los estudiantes no ven estas rutas.
router.use(verifyToken, requireRole("docente", "administrador"));

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

router.get("/", async (_req, res) => {
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
    },
  });
  // No mandamos textoExtraido al listado (puede ser enorme); solo
  // señalamos si la IA podrá usar cada documento.
  const conTexto = await prisma.documento.findMany({
    where: { textoExtraido: { not: null } },
    select: { id: true },
  });
  const idsConTexto = new Set(conTexto.map((d) => d.id));
  res.json(documentos.map((d) => ({ ...d, legibleParaIA: idsConTexto.has(d.id) })));
});

router.post("/", (req, res) => {
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

    const documento = await prisma.documento.create({
      data: {
        nombre: nombreOriginal,
        archivo: req.file.filename,
        mimeType: req.file.mimetype,
        tamano: req.file.size,
        descripcion: req.body.descripcion?.trim() || null,
        textoExtraido,
        subidoPor: req.usuario.rol === "administrador" ? "Administración" : (req.body.subidoPor || "Docente"),
      },
    });

    res.status(201).json({
      id: documento.id,
      nombre: documento.nombre,
      legibleParaIA: textoExtraido !== null,
    });
  });
});

router.get("/:id/descargar", async (req, res) => {
  const documento = await prisma.documento.findUnique({ where: { id: req.params.id } });
  if (!documento) return res.status(404).json({ error: "Documento no encontrado" });

  const ruta = path.join(CARPETA_UPLOADS, documento.archivo);
  res.download(ruta, documento.nombre, (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ error: "El archivo ya no está disponible en el servidor" });
    }
  });
});

router.delete("/:id", async (req, res) => {
  const documento = await prisma.documento.findUnique({ where: { id: req.params.id } });
  if (!documento) return res.status(404).json({ error: "Documento no encontrado" });

  await prisma.documento.delete({ where: { id: documento.id } });
  // Borrar el archivo físico es lo de menos: si falla, la fila ya no existe.
  fs.unlink(path.join(CARPETA_UPLOADS, documento.archivo)).catch(() => {});

  res.status(204).end();
});

module.exports = router;
