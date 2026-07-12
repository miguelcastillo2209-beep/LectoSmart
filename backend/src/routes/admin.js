const { Router } = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../lib/prisma");
const { verifyToken, requireRole } = require("../middleware/auth");
const { CURSOS } = require("../lib/constants");
const { normalizarUsuario } = require("../lib/usuario");
const { validarCursos, parseCursos } = require("../lib/cursosDocente");

const router = Router();
router.use(verifyToken, requireRole("administrador"));

async function hashSiVienePassword(password) {
  if (!password) return undefined;
  if (password.length < 4) {
    const err = new Error("La contraseña debe tener al menos 4 caracteres");
    err.status = 400;
    throw err;
  }
  return bcrypt.hash(password, 10);
}

function manejarError(res, err) {
  if (err.status) return res.status(err.status).json({ error: err.message });
  throw err;
}

/* ============================== Estudiantes ============================== */

router.get("/estudiantes", async (_req, res) => {
  const estudiantes = await prisma.estudiante.findMany({
    select: { id: true, nombre: true, usuario: true, curso: true, puntos: true, racha: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(estudiantes);
});

router.post("/estudiantes", async (req, res) => {
  try {
    const { nombre, password, curso } = req.body ?? {};
    const usuario = normalizarUsuario(req.body?.usuario);
    if (!nombre?.trim() || !usuario || !password || !curso) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    if (!CURSOS.includes(curso)) {
      return res.status(400).json({ error: "Curso inválido" });
    }
    const passwordHash = await hashSiVienePassword(password);

    const existente = await prisma.estudiante.findUnique({ where: { usuario } });
    if (existente) return res.status(409).json({ error: "Ese usuario ya existe" });

    const estudiante = await prisma.estudiante.create({
      data: { nombre: nombre.trim(), usuario, passwordHash, curso },
    });
    res.status(201).json(estudiante);
  } catch (err) {
    manejarError(res, err);
  }
});

router.put("/estudiantes/:id", async (req, res) => {
  try {
    const { nombre, password, curso } = req.body ?? {};
    const usuario = req.body?.usuario ? normalizarUsuario(req.body.usuario) : null;
    if (curso && !CURSOS.includes(curso)) {
      return res.status(400).json({ error: "Curso inválido" });
    }
    if (usuario) {
      const enUso = await prisma.estudiante.findUnique({ where: { usuario } });
      if (enUso && enUso.id !== req.params.id) return res.status(409).json({ error: "Ese usuario ya existe" });
    }
    const passwordHash = await hashSiVienePassword(password);

    const estudiante = await prisma.estudiante.update({
      where: { id: req.params.id },
      data: {
        ...(nombre && { nombre: nombre.trim() }),
        ...(usuario && { usuario }),
        ...(curso && { curso }),
        ...(passwordHash && { passwordHash }),
      },
    });
    res.json(estudiante);
  } catch (err) {
    manejarError(res, err);
  }
});

router.delete("/estudiantes/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.$transaction([
    prisma.estudianteLogro.deleteMany({ where: { estudianteId: id } }),
    prisma.intento.deleteMany({ where: { estudianteId: id } }),
    prisma.estudiante.delete({ where: { id } }),
  ]);
  res.status(204).end();
});

/* ================================ Docentes ================================ */

router.get("/docentes", async (_req, res) => {
  const docentes = await prisma.docente.findMany({
    select: { id: true, nombre: true, usuario: true, cursosAsignados: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(docentes.map(({ cursosAsignados, ...resto }) => ({ ...resto, cursos: parseCursos(cursosAsignados) })));
});

router.post("/docentes", async (req, res) => {
  try {
    const { nombre, password } = req.body ?? {};
    const usuario = normalizarUsuario(req.body?.usuario);
    if (!nombre?.trim() || !usuario || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    const passwordHash = await hashSiVienePassword(password);
    const cursos = validarCursos(req.body?.cursos) ?? [];

    const existente = await prisma.docente.findUnique({ where: { usuario } });
    if (existente) return res.status(409).json({ error: "Ese usuario ya existe" });

    const docente = await prisma.docente.create({
      data: { nombre: nombre.trim(), usuario, passwordHash, cursosAsignados: JSON.stringify(cursos) },
    });
    res.status(201).json({ ...docente, cursos });
  } catch (err) {
    manejarError(res, err);
  }
});

router.put("/docentes/:id", async (req, res) => {
  try {
    const { nombre, password } = req.body ?? {};
    const usuario = req.body?.usuario ? normalizarUsuario(req.body.usuario) : null;
    if (usuario) {
      const enUso = await prisma.docente.findUnique({ where: { usuario } });
      if (enUso && enUso.id !== req.params.id) return res.status(409).json({ error: "Ese usuario ya existe" });
    }
    const passwordHash = await hashSiVienePassword(password);
    const cursos = validarCursos(req.body?.cursos);

    const docente = await prisma.docente.update({
      where: { id: req.params.id },
      data: {
        ...(nombre && { nombre: nombre.trim() }),
        ...(usuario && { usuario }),
        ...(passwordHash && { passwordHash }),
        ...(cursos && { cursosAsignados: JSON.stringify(cursos) }),
      },
    });
    res.json({ ...docente, cursos: parseCursos(docente.cursosAsignados) });
  } catch (err) {
    manejarError(res, err);
  }
});

router.delete("/docentes/:id", async (req, res) => {
  await prisma.docente.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

/* ============================= Administradores ============================= */

router.get("/administradores", async (_req, res) => {
  const administradores = await prisma.administrador.findMany({
    select: { id: true, nombre: true, usuario: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(administradores);
});

router.post("/administradores", async (req, res) => {
  try {
    const { nombre, password } = req.body ?? {};
    const usuario = normalizarUsuario(req.body?.usuario);
    if (!nombre?.trim() || !usuario || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    const passwordHash = await hashSiVienePassword(password);

    const existente = await prisma.administrador.findUnique({ where: { usuario } });
    if (existente) return res.status(409).json({ error: "Ese usuario ya existe" });

    const administrador = await prisma.administrador.create({
      data: { nombre: nombre.trim(), usuario, passwordHash },
    });
    res.status(201).json(administrador);
  } catch (err) {
    manejarError(res, err);
  }
});

router.put("/administradores/:id", async (req, res) => {
  try {
    const { nombre, password } = req.body ?? {};
    const usuario = req.body?.usuario ? normalizarUsuario(req.body.usuario) : null;
    if (usuario) {
      const enUso = await prisma.administrador.findUnique({ where: { usuario } });
      if (enUso && enUso.id !== req.params.id) return res.status(409).json({ error: "Ese usuario ya existe" });
    }
    const passwordHash = await hashSiVienePassword(password);

    const administrador = await prisma.administrador.update({
      where: { id: req.params.id },
      data: {
        ...(nombre && { nombre: nombre.trim() }),
        ...(usuario && { usuario }),
        ...(passwordHash && { passwordHash }),
      },
    });
    res.json(administrador);
  } catch (err) {
    manejarError(res, err);
  }
});

router.delete("/administradores/:id", async (req, res) => {
  const { id } = req.params;
  if (id === req.usuario.id) {
    return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
  }
  const total = await prisma.administrador.count();
  if (total <= 1) {
    return res.status(400).json({ error: "No puedes eliminar el último administrador" });
  }
  await prisma.administrador.delete({ where: { id } });
  res.status(204).end();
});

module.exports = router;
