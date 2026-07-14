require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const estudiantesRoutes = require("./routes/estudiantes");
const actividadesRoutes = require("./routes/actividades");
const docenteRoutes = require("./routes/docente");
const adminRoutes = require("./routes/admin");

const app = express();

// Sin FRONTEND_URL definida (desarrollo local) se acepta cualquier
// origen, igual que antes. En producción se restringe al dominio real
// del frontend.
app.use(cors(process.env.FRONTEND_URL ? { origin: process.env.FRONTEND_URL } : undefined));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/estudiantes", estudiantesRoutes);
app.use("/api", actividadesRoutes);
app.use("/api/docente", docenteRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`LectoSmart API escuchando en http://localhost:${PORT}`);
});
