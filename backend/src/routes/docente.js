const { Router } = require("express");
const bcrypt = require("bcrypt");
const PDFDocument = require("pdfkit");
const prisma = require("../lib/prisma");
const { verifyToken, requireRole } = require("../middleware/auth");
const { calcularNivel } = require("../services/puntos");
const { cursosPermitidosPara } = require("../lib/cursosDocente");
const { generarPasswordTemporal } = require("../lib/passwordTemporal");
const { normalizarUsuario } = require("../lib/usuario");
const { CURSOS } = require("../lib/constants");

const router = Router();
router.use(verifyToken, requireRole("docente", "administrador"));

const UMBRAL_REFUERZO = 50;

const NIVELES_COMPRENSION = ["literal", "inferencial", "critico"];

// Devuelve las filas de progreso por estudiante Y el desglose de
// aciertos de COMPRENSION por nivel de lectura (literal/inferencial/
// crítico), leído de Actividad.contenido.nivel — así el docente ve en
// qué habilidad específica falla más su grupo, no solo un % global.
async function construirResumenEstudiantes(cursosPermitidos) {
  const [estudiantes, intentos] = await Promise.all([
    prisma.estudiante.findMany({
      where: cursosPermitidos ? { curso: { in: cursosPermitidos } } : undefined,
    }),
    prisma.intento.findMany({
      select: { estudianteId: true, actividadId: true, correcto: true, actividad: { select: { modulo: true, contenido: true } } },
    }),
  ]);

  const porEstudiante = new Map(estudiantes.map((e) => [e.id, { actividadesCompletadas: new Set(), comprensionCorrectos: 0, comprensionTotal: 0 }]));
  const desglose = Object.fromEntries(NIVELES_COMPRENSION.map((n) => [n, { correctos: 0, total: 0 }]));

  for (const intento of intentos) {
    const stats = porEstudiante.get(intento.estudianteId);
    if (!stats) continue; // estudiante fuera de los cursos permitidos de este docente
    if (intento.correcto) stats.actividadesCompletadas.add(intento.actividadId);
    if (intento.actividad.modulo === "COMPRENSION") {
      stats.comprensionTotal += 1;
      if (intento.correcto) stats.comprensionCorrectos += 1;

      let nivel = "literal";
      try {
        const contenido = JSON.parse(intento.actividad.contenido);
        if (NIVELES_COMPRENSION.includes(contenido.nivel)) nivel = contenido.nivel;
      } catch {}
      desglose[nivel].total += 1;
      if (intento.correcto) desglose[nivel].correctos += 1;
    }
  }

  const filas = estudiantes.map((e) => {
    const stats = porEstudiante.get(e.id);
    const comprension = stats.comprensionTotal > 0 ? Math.round((stats.comprensionCorrectos / stats.comprensionTotal) * 100) : 0;
    const { nivel } = calcularNivel(e.puntos);
    return {
      id: e.id,
      nombre: e.nombre,
      curso: e.curso,
      nivel,
      puntos: e.puntos,
      actividades: stats.actividadesCompletadas.size,
      comprension,
      tieneActividad: stats.actividadesCompletadas.size > 0 || stats.comprensionTotal > 0,
    };
  });

  const desglosePorNivel = NIVELES_COMPRENSION.map((nivel) => ({
    nivel,
    correctos: desglose[nivel].correctos,
    total: desglose[nivel].total,
    pct: desglose[nivel].total > 0 ? Math.round((desglose[nivel].correctos / desglose[nivel].total) * 100) : null,
  }));

  return { filas, desglosePorNivel };
}

router.get("/resumen", async (req, res) => {
  const cursosPermitidos = await cursosPermitidosPara(prisma, req.usuario);
  const { filas, desglosePorNivel } = await construirResumenEstudiantes(cursosPermitidos);

  const activos = filas.filter((f) => f.tieneActividad);
  const actividadesCompletadas = filas.reduce((suma, f) => suma + f.actividades, 0);
  const comprensionPromedio =
    activos.length > 0 ? Math.round(activos.reduce((suma, f) => suma + f.comprension, 0) / activos.length) : 0;
  const necesitanRefuerzo = activos.filter((f) => f.comprension < UMBRAL_REFUERZO).length;

  res.json({
    estudiantesActivos: activos.length,
    actividadesCompletadas,
    comprensionPromedio,
    necesitanRefuerzo,
    desglosePorNivel,
  });
});

router.get("/estudiantes", async (req, res) => {
  const { q, curso } = req.query;
  const cursosPermitidos = await cursosPermitidosPara(prisma, req.usuario);
  let { filas } = await construirResumenEstudiantes(cursosPermitidos);

  if (curso) filas = filas.filter((f) => f.curso === curso);
  if (q) {
    const busqueda = String(q).trim().toLowerCase();
    filas = filas.filter((f) => f.nombre.toLowerCase().includes(busqueda));
  }

  filas.sort((a, b) => b.puntos - a.puntos);
  res.json(filas.map(({ tieneActividad, ...resto }) => resto));
});

// Crea la cuenta de un estudiante. No hay registro público (ver
// routes/auth.js): las cuentas las abre el docente o el administrador,
// así el colegio controla quién entra y que el curso quede bien puesto.
// Si no se envía contraseña se genera una temporal y se devuelve para
// que el docente se la dicte al estudiante.
router.post("/estudiantes", async (req, res) => {
  const { nombre, curso, password } = req.body ?? {};
  const usuario = normalizarUsuario(req.body?.usuario);

  if (!nombre?.trim() || !usuario || !curso) {
    return res.status(400).json({ error: "Faltan el nombre, el usuario o el curso" });
  }
  if (!CURSOS.includes(curso)) {
    return res.status(400).json({ error: "Curso inválido" });
  }
  if (password && password.length < 4) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 4 caracteres" });
  }

  const cursosPermitidos = await cursosPermitidosPara(prisma, req.usuario);
  if (cursosPermitidos !== null && !cursosPermitidos.includes(curso)) {
    return res.status(403).json({ error: "No tienes ese curso asignado" });
  }

  const existente = await prisma.estudiante.findUnique({ where: { usuario } });
  if (existente) {
    return res.status(409).json({ error: "Ese usuario ya existe" });
  }

  // La contraseña se devuelve una sola vez, igual que en el
  // restablecimiento: no queda en texto plano en ningún lado.
  const passwordFinal = password || generarPasswordTemporal();
  const passwordHash = await bcrypt.hash(passwordFinal, 10);

  const estudiante = await prisma.estudiante.create({
    data: { nombre: nombre.trim(), usuario, passwordHash, curso },
  });

  res.status(201).json({
    id: estudiante.id,
    nombre: estudiante.nombre,
    usuario: estudiante.usuario,
    curso: estudiante.curso,
    password: passwordFinal,
  });
});

// Genera una contraseña temporal nueva para un estudiante y la
// devuelve una sola vez (no queda guardada en texto plano en ningún
// lado). Pensado para cuando un estudiante olvida su contraseña: el
// docente/admin la restablece en el momento y se la dicta en clase. Un
// docente solo puede hacerlo con estudiantes de sus cursosAsignados.
router.post("/estudiantes/:id/restablecer-password", async (req, res) => {
  const estudiante = await prisma.estudiante.findUnique({ where: { id: req.params.id } });
  if (!estudiante) return res.status(404).json({ error: "Estudiante no encontrado" });

  const cursosPermitidos = await cursosPermitidosPara(prisma, req.usuario);
  if (cursosPermitidos !== null && !cursosPermitidos.includes(estudiante.curso)) {
    return res.status(403).json({ error: "No tienes ese curso asignado" });
  }

  const password = generarPasswordTemporal();
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.estudiante.update({ where: { id: estudiante.id }, data: { passwordHash } });

  res.json({ password });
});

// ── Reporte de progreso (CSV / PDF) ─────────────────────────────────────

function escaparCsv(valor) {
  const texto = String(valor ?? "");
  return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

async function filasReporte(req) {
  const cursosPermitidos = await cursosPermitidosPara(prisma, req.usuario);
  if (req.query.curso && cursosPermitidos !== null && !cursosPermitidos.includes(req.query.curso)) {
    const err = new Error("No tienes ese curso asignado");
    err.status = 403;
    throw err;
  }
  const { filas } = await construirResumenEstudiantes(cursosPermitidos);
  const filtradas = req.query.curso ? filas.filter((f) => f.curso === req.query.curso) : filas;
  return filtradas.sort((a, b) => a.curso.localeCompare(b.curso) || b.puntos - a.puntos);
}

router.get("/reporte.csv", async (req, res) => {
  try {
    const filas = await filasReporte(req);
    const encabezado = ["Estudiante", "Curso", "Nivel", "Puntos", "Actividades completadas", "Comprensión (%)"];
    const lineas = [encabezado.join(",")];
    for (const f of filas) {
      lineas.push([f.nombre, f.curso, f.nivel, f.puntos, f.actividades, f.comprension].map(escaparCsv).join(","));
    }
    const nombreArchivo = `reporte-lectosmart-${req.query.curso || "todos"}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);
    // BOM UTF-8 para que Excel muestre bien las tildes/eñes.
    res.send("﻿" + lineas.join("\n"));
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.get("/reporte.pdf", async (req, res) => {
  let filas;
  try {
    filas = await filasReporte(req);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }

  const nombreArchivo = `reporte-lectosmart-${req.query.curso || "todos"}.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${nombreArchivo}"`);

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  doc.pipe(res);

  doc.fontSize(18).text("LectoSmart — Reporte de progreso", { align: "left" });
  doc.fontSize(10).fillColor("#666").text(
    `Curso: ${req.query.curso || "todos"}  ·  Generado el ${new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}`
  );
  doc.moveDown(1);
  doc.fillColor("#000");

  const columnas = [
    { titulo: "Estudiante", ancho: 150 },
    { titulo: "Curso", ancho: 50 },
    { titulo: "Nivel", ancho: 45 },
    { titulo: "Puntos", ancho: 55 },
    { titulo: "Activ.", ancho: 50 },
    { titulo: "Compr. %", ancho: 60 },
  ];
  const xInicial = doc.page.margins.left;
  const altoFila = 20;

  function dibujarEncabezado(y) {
    doc.font("Helvetica-Bold").fontSize(10);
    let x = xInicial;
    for (const col of columnas) {
      doc.text(col.titulo, x, y, { width: col.ancho });
      x += col.ancho;
    }
    doc.font("Helvetica");
    return y + altoFila;
  }

  let y = dibujarEncabezado(doc.y);
  doc.moveTo(xInicial, y - 4).lineTo(xInicial + columnas.reduce((s, c) => s + c.ancho, 0), y - 4).strokeColor("#ccc").stroke();

  doc.fontSize(9);
  for (const f of filas) {
    const valores = [f.nombre, f.curso, `Nv ${f.nivel}`, String(f.puntos), String(f.actividades), `${f.comprension}%`];
    // Algunos nombres (varios nombres/apellidos) pueden ocupar 2 líneas
    // en la columna "Estudiante" — la altura de la fila se ajusta a la
    // celda más alta para que no se encime con la fila siguiente.
    const altoFilaReal = Math.max(
      altoFila,
      ...valores.map((valor, i) => doc.heightOfString(valor, { width: columnas[i].ancho }) + 6)
    );

    if (y + altoFilaReal > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = dibujarEncabezado(doc.page.margins.top);
      doc.fontSize(9);
    }

    let x = xInicial;
    valores.forEach((valor, i) => {
      doc.text(valor, x, y, { width: columnas[i].ancho });
      x += columnas[i].ancho;
    });
    y += altoFilaReal;
  }

  if (filas.length === 0) {
    doc.fontSize(10).fillColor("#666").text("No hay estudiantes para este curso.", xInicial, y);
  }

  doc.end();
});

module.exports = router;
