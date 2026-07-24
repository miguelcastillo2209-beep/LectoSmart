const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { normalizarUsuario } = require("../lib/usuario");

const router = Router();

function firmarToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// No existe registro público de estudiantes a propósito: las cuentas las
// crea un docente (POST /api/docente/estudiantes) o un administrador
// (POST /api/admin/estudiantes). Así el colegio controla quién entra y
// evita cuentas falsas o con el curso mal elegido, que además falsearían
// el ranking y los reportes por curso.

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
  res.json({
    token,
    docente: { id: docente.id, nombre: docente.nombre, cursos: JSON.parse(docente.cursosAsignados) },
  });
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
