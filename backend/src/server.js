require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const estudiantesRoutes = require("./routes/estudiantes");
const actividadesRoutes = require("./routes/actividades");
const docenteRoutes = require("./routes/docente");
const adminRoutes = require("./routes/admin");
const documentosRoutes = require("./routes/documentos");
const iaRoutes = require("./routes/ia");
const propuestasRoutes = require("./routes/propuestas");
const actividadesGestionRoutes = require("./routes/actividadesGestion");
const fluidezAudioRoutes = require("./routes/fluidezAudio");

// Red de seguridad: Express 4 no atrapa automáticamente una promesa
// rechazada dentro de un handler async (p. ej. findUniqueOrThrow con un
// id que ya no existe, como un estudiante borrado cuyo token JWT
// todavía es válido). Sin este handler, Node mata TODO el proceso ante
// ese único error, tumbando el servidor para todos los usuarios
// conectados. Se registra el error pero el servidor sigue en pie.
process.on("unhandledRejection", (err) => {
  console.error("Promesa rechazada sin capturar:", err);
});

const app = express();

// Sin FRONTEND_URL definida (desarrollo local) se acepta cualquier
// origen, igual que antes. En producción se restringe al dominio real
// del frontend.
app.use(cors(process.env.FRONTEND_URL ? { origin: process.env.FRONTEND_URL } : undefined));
// Límite elevado sobre el default (100kb) porque el audio de fluidez
// viaja como base64 dentro del JSON (~1-2 min de voz, ver fluidezAudio.js).
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/estudiantes", estudiantesRoutes);
app.use("/api", actividadesRoutes);
app.use("/api/docente", docenteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documentos", documentosRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/propuestas", propuestasRoutes);
app.use("/api/actividades-gestion", actividadesGestionRoutes);
app.use("/api", fluidezAudioRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`LectoSmart API escuchando en http://localhost:${PORT}`);
});
