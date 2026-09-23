const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const { normalizarUsuario } = require("../lib/usuario");

// Límites de tasa. Decisión de diseño clave: la IP no sirve para
// distinguir a nadie. Todo el salón sale a internet por la misma IP
// pública (NAT), y en servidoria es peor: el router no pasa la IP real,
// así que TODA visita llega como 192.168.2.2. Un límite por IP se
// comparte con todo internet: un bot probando contraseñas bloquearía el
// login del colegio entero. Por eso:
//   - el login se limita por CUENTA (el usuario que se intenta),
//   - lo demás se limita por USUARIO autenticado (id del JWT),
//   - la IP queda solo como respaldo para peticiones sin identidad.

const mensaje = (texto) => ({ error: texto });

// Identidad del token si es válido. Se verifica la firma (no basta con
// decodificar): si no, un atacante inventaría un id distinto en cada
// petición para no gastar nunca su cupo.
function idDelToken(req) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  try {
    const { id, rol } = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    return `${rol}:${id}`;
  } catch {
    return null;
  }
}

// Red de seguridad general de la API: 600/min por usuario aguanta de
// sobra a un estudiante navegando y corta un script en bucle. Lo que
// llega sin token (casi solo los logins) comparte un cupo por IP más
// amplio, porque en servidoria esa IP es la de todo el mundo.
const limitadorGeneral = rateLimit({
  windowMs: 60 * 1000,
  limit: (req) => (idDelToken(req) ? 600 : 3000),
  keyGenerator: (req) => idDelToken(req) ?? rateLimit.ipKeyGenerator(req.ip),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensaje("Demasiadas peticiones. Espera un momento e intenta de nuevo."),
});

// Fuerza bruta contra los tres logins: 20 intentos fallidos por CUENTA
// cada 10 minutos. Un estudiante que se equivoca solo se bloquea a sí
// mismo, y un bot que ataca una cuenta no deja afuera a los demás. La
// ruta va en la llave porque estudiante, docente y administrador pueden
// compartir nombre de usuario. Los aciertos no cuentan
// (skipSuccessfulRequests), así que entrar bien nunca gasta cupo.
const limitadorLogin = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const bruto = req.body?.usuario;
    const usuario = typeof bruto === "string" ? normalizarUsuario(bruto) : "";
    return usuario ? `${req.path}:${usuario}` : rateLimit.ipKeyGenerator(req.ip);
  },
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensaje("Demasiados intentos fallidos. Espera 10 minutos o pídele a tu profesor que te restablezca la contraseña."),
});

// Rutas que cuestan dinero (llaman a Gemini) o CPU. Se limitan por
// usuario autenticado: un estudiante no puede quemar la cuota de IA de
// todo el colegio grabando audio en bucle.
function limitadorPorUsuario({ windowMs, limit, texto }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    // req.usuario lo pone verifyToken; el fallback por IP solo aplica si
    // alguien llega sin token (ahí la ruta responde 401 igualmente).
    keyGenerator: (req) => req.usuario?.id ?? rateLimit.ipKeyGenerator(req.ip),
    message: mensaje(texto),
  });
}

// Una lectura en voz alta dura 1-2 minutos, así que 10 verificaciones
// cada 5 minutos es más de lo que alcanza a hacer un estudiante real.
const limitadorAudio = limitadorPorUsuario({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  texto: "Estás enviando muchas grabaciones seguidas. Espera unos minutos.",
});

// Chat del asistente y generación de actividades (solo docente/admin).
const limitadorIA = limitadorPorUsuario({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  texto: "El asistente está recibiendo muchas peticiones tuyas. Espera unos minutos.",
});

// Envío de respuestas: evita que un script sume puntos en bucle. 120 por
// minuto es holgado para un estudiante respondiendo de verdad.
const limitadorIntentos = limitadorPorUsuario({
  windowMs: 60 * 1000,
  limit: 120,
  texto: "Vas demasiado rápido. Respira y sigue con la siguiente pregunta.",
});

module.exports = {
  limitadorGeneral,
  limitadorLogin,
  limitadorAudio,
  limitadorIA,
  limitadorIntentos,
};
