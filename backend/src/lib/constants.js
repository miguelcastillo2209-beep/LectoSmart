const MODULOS = ["PALABRAS", "COMPRENSION", "FLUIDEZ"];

const CURSOS = ["6°", "7°", "8°", "9°", "10°", "11°"];

const PUNTOS_POR_NIVEL = 500;

// Puntos base por módulo (Fluidez pesa más por el esfuerzo de leer en
// voz alta cronometrado). Usado por el seed y por el generador de
// actividades con IA para que las propuestas aprobadas queden con el
// mismo puntaje que el resto del banco.
const PUNTOS_BASE_POR_MODULO = { PALABRAS: 20, COMPRENSION: 20, FLUIDEZ: 30 };

// Corazones (intentos fallidos permitidos) por lección/módulo antes de
// que el estudiante deba salir y volver a intentarlo.
const CORAZONES_POR_LECCION = 2;

module.exports = { MODULOS, CURSOS, PUNTOS_POR_NIVEL, PUNTOS_BASE_POR_MODULO, CORAZONES_POR_LECCION };
