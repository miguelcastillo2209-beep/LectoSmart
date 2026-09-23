// El orden importa: es el que usa GET /estudiantes/me para armar
// progresoPorModulo y, por lo tanto, el orden de las tarjetas en el
// panel del estudiante (ORTOGRAFIA va junto a PALABRAS porque ambas
// trabajan la palabra, antes de pasar al texto completo).
const MODULOS = ["PALABRAS", "ORTOGRAFIA", "COMPRENSION", "FLUIDEZ"];

const CURSOS = ["6°", "7°", "8°", "9°", "10°", "11°"];

const PUNTOS_POR_NIVEL = 500;

// Puntos base por módulo (Fluidez pesa más por el esfuerzo de leer en
// voz alta cronometrado). Usado por el seed y por el generador de
// actividades con IA para que las propuestas aprobadas queden con el
// mismo puntaje que el resto del banco.
const PUNTOS_BASE_POR_MODULO = { PALABRAS: 20, COMPRENSION: 20, FLUIDEZ: 30, ORTOGRAFIA: 20 };

// Corazones (intentos fallidos permitidos) por lección/módulo antes de
// que el estudiante deba salir y volver a intentarlo.
const CORAZONES_POR_LECCION = 2;

module.exports = {
  MODULOS,
  CURSOS,
  PUNTOS_POR_NIVEL,
  PUNTOS_BASE_POR_MODULO,
  CORAZONES_POR_LECCION,
};
