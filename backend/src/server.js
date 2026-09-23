require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

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
const { limitadorGeneral } = require("./middleware/limites");

// Sin JWT_SECRET, jwt.verify acepta cualquier cosa mal firmada de formas
// sorprendentes y todo el control de acceso deja de valer. Es preferible
// no arrancar a arrancar sin autenticación real.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error("FALTA JWT_SECRET (o es demasiado corta). Define una cadena larga y aleatoria en el .env antes de arrancar.");
  process.exit(1);
}

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

// Detrás de nginx: sin esto req.ip sería siempre 127.0.0.1 y los límites
// de tasa contarían a todo internet como un solo cliente. "1" = un único
// proxy de confianza (nginx en el mismo VPS), no una cadena abierta.
app.set("trust proxy", 1);
// No anunciar que esto es Express (reconocimiento gratis para un atacante).
app.disable("x-powered-by");

// Cabeceras de seguridad. La API solo devuelve JSON y descargas, así que
// se puede cerrar fuerte: nada de embeber esto en un iframe ajeno y CSP
// mínima (la CSP que importa para la interfaz la pone nginx sobre el
// frontend, ver docs/seguridad-y-rendimiento.md).
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] },
    },
    crossOriginResourcePolicy: { policy: "same-site" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

// gzip de las respuestas JSON. El listado de actividades y los reportes
// del docente comprimen muy bien (texto plano repetitivo).
app.use(compression());

// En producción FRONTEND_URL restringe el origen. En desarrollo local no
// está definida y se acepta cualquier origen, igual que antes.
app.use(cors(process.env.FRONTEND_URL ? { origin: process.env.FRONTEND_URL } : undefined));

// Límite de tasa general antes de tocar la base de datos.
app.use("/api", limitadorGeneral);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Se monta ANTES del parser global a propósito: el audio de fluidez
// viaja como base64 dentro del JSON y necesita un límite mucho mayor.
// Ese parser vive dentro de la propia ruta (fluidezAudio.js), así solo
// esa URL acepta cuerpos grandes; body-parser marca req._body y el
// parser global de abajo no vuelve a leer el cuerpo.
app.use("/api", fluidezAudioRoutes);

// El resto de la API mueve JSON pequeño. Un límite global de 10 MB
// dejaba que cualquiera obligara al servidor a parsear 10 MB por
// petición — memoria y CPU gratis para tumbarlo.
app.use(express.json({ limit: "512kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/estudiantes", estudiantesRoutes);
app.use("/api", actividadesRoutes);
app.use("/api/docente", docenteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/documentos", documentosRoutes);
app.use("/api/ia", iaRoutes);
app.use("/api/propuestas", propuestasRoutes);
app.use("/api/actividades-gestion", actividadesGestionRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  // Un JSON malformado o demasiado grande es culpa del cliente, no un
  // fallo del servidor: responder 500 hacía ruido en los logs y ocultaba
  // los errores de verdad.
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "El contenido enviado es demasiado grande" });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El contenido enviado no es válido" });
  }
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 4000;
const servidor = app.listen(PORT, () => {
  console.log(`LectoSmart API escuchando en http://localhost:${PORT}`);
});

// Sin estos tiempos, una conexión que abre y no termina de enviar la
// petición se queda ocupando un socket indefinidamente (slowloris).
// requestTimeout es holgado a propósito: subir una grabación de voz o un
// PDF desde el internet de una vereda puede tardar minutos, y cortarlo
// sería un fallo real, no un ataque.
servidor.headersTimeout = 30 * 1000;
servidor.requestTimeout = 180 * 1000;
servidor.keepAliveTimeout = 30 * 1000;
