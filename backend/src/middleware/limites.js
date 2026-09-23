const rateLimit = require("express-rate-limit");

// Límites de tasa. Decisión de diseño clave para un colegio: TODO el
// salón sale a internet por la misma IP pública (NAT), así que limitar
// por IP con un número bajo bloquearía al curso entero a media clase.
// Por eso:
//   - los límites por IP son generosos y solo frenan abuso evidente,
//   - lo caro (IA, audio) se limita por USUARIO, con el id del JWT.

const mensaje = (texto) => ({ error: texto });

// Red de seguridad general de la API. 600/min por IP aguanta de sobra un
// salón de 40 estudiantes navegando a la vez y aun así corta un script
// que intente inundar el servidor.
const limitadorGeneral = rateLimit({
  windowMs: 60 * 1000,
  limit: 600,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: mensaje("Demasiadas peticiones. Espera un momento e intenta de nuevo."),
});

// Fuerza bruta contra los tres logins. 20 intentos fallidos por IP cada
// 10 minutos: suficiente para un curso que se equivoca al escribir, muy
// poco para un diccionario de contraseñas. Los aciertos no cuentan
// (skipSuccessfulRequests), así que entrar bien nunca gasta cupo.
const limitadorLogin = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
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
    keyGenerator: (req) => req.usuario?.id ?? rateLimit.ipKeyGenerator(req),
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
