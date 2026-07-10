const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { CURSOS } = require("../lib/constants");

const router = Router();

function firmarToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/estudiantes/registro", async (req, res) => {
  const { nombre, usuario, password, curso } = req.body ?? {};

  if (!nombre?.trim() || !usuario?.trim() || !password || !curso) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 4 caracteres" });
  }
  if (!CURSOS.includes(curso)) {
    return res.status(400).json({ error: "Curso inválido" });
  }

  const existente = await prisma.estudiante.findUnique({ where: { usuario } });
  if (existente) {
    return res.status(409).json({ error: "Ese usuario ya existe" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const estudiante = await prisma.estudiante.create({
    data: { nombre: nombre.trim(), usuario: usuario.trim(), passwordHash, curso },
  });

  const token = firmarToken({ id: estudiante.id, rol: "estudiante" });
  res.status(201).json({
    token,
    estudiante: { id: estudiante.id, nombre: estudiante.nombre, curso: estudiante.curso },
  });
});

router.post("/estudiantes/login", async (req, res) => {
  const { usuario, password } = req.body ?? {};
  if (!usuario || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const estudiante = await prisma.estudiante.findUnique({ where: { usuario } });
  if (!estudiante || !(await bcrypt.compare(password, estudiante.passwordHash))) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const token = firmarToken({ id: estudiante.id, rol: "estudiante" });
  res.json({
    token,
    estudiante: { id: estudiante.id, nombre: estudiante.nombre, curso: estudiante.curso },
  });
});

router.post("/docentes/login", async (req, res) => {
  const { usuario, password } = req.body ?? {};
  if (!usuario || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const docente = await prisma.docente.findUnique({ where: { usuario } });
  if (!docente || !(await bcrypt.compare(password, docente.passwordHash))) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const token = firmarToken({ id: docente.id, rol: "docente" });
  res.json({ token, docente: { id: docente.id, nombre: docente.nombre } });
});

module.exports = router;
