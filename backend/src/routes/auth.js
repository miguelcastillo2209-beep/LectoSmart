const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { CURSOS } = require("../lib/constants");
const { normalizarUsuario } = require("../lib/usuario");

const router = Router();

function firmarToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/estudiantes/registro", async (req, res) => {
  const { nombre, usuario: usuarioBruto, password, curso } = req.body ?? {};
  const usuario = normalizarUsuario(usuarioBruto);

  if (!nombre?.trim() || !usuario || !password || !curso) {
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
    data: { nombre: nombre.trim(), usuario, passwordHash, curso },
  });

  const token = firmarToken({ id: estudiante.id, rol: "estudiante" });
  res.status(201).json({
    token,
    estudiante: { id: estudiante.id, nombre: estudiante.nombre, curso: estudiante.curso },
  });
});

router.post("/estudiantes/login", async (req, res) => {
  const { usuario: usuarioBruto, password } = req.body ?? {};
  const usuario = normalizarUsuario(usuarioBruto);
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
  const { usuario: usuarioBruto, password } = req.body ?? {};
  const usuario = normalizarUsuario(usuarioBruto);
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

router.post("/administradores/login", async (req, res) => {
  const { usuario: usuarioBruto, password } = req.body ?? {};
  const usuario = normalizarUsuario(usuarioBruto);
  if (!usuario || !password) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const administrador = await prisma.administrador.findUnique({ where: { usuario } });
  if (!administrador || !(await bcrypt.compare(password, administrador.passwordHash))) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos" });
  }

  const token = firmarToken({ id: administrador.id, rol: "administrador" });
  res.json({ token, administrador: { id: administrador.id, nombre: administrador.nombre } });
});

module.exports = router;
