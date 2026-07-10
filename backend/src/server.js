require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const estudiantesRoutes = require("./routes/estudiantes");
const actividadesRoutes = require("./routes/actividades");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/estudiantes", estudiantesRoutes);
app.use("/api", actividadesRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`LectoSmart API escuchando en http://localhost:${PORT}`);
});
