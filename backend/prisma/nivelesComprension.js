// Clasificación de las 48 actividades de COMPRENSION por nivel de
// lectura (ICFES: literal / inferencial / crítico), según el diseño
// pedagógico del banco (docs/estudio-contenidos-por-grado.md).
const NIVELES = {
  "6°": {
    "El colibrí del Valle de Tenza": "literal",
    "La huerta escolar": "literal",
    "El perro guardián de la finca": "literal",
    "Un día de mercado en Guateque": "literal",
    "La laguna de la vereda": "literal",
    "Las abejas del profesor": "literal",
    "El sancocho del domingo": "literal",
    "El viaje a Bogotá": "literal",
  },
  "7°": {
    "Un viaje en chiva": "literal",
    "El apagón en la vereda": "inferencial",
    "El zapatero del pueblo": "inferencial",
    "La salida de observación": "inferencial",
    "La carta de la abuela": "inferencial",
    "El aviso de la alcaldía": "literal",
    "Ruana en pleno sol": "inferencial",
    "Las almojábanas de la tía": "literal",
  },
  "8°": {
    "¿Por qué llueve más en las montañas?": "inferencial",
    "El impacto de la sequía en los cultivos": "inferencial",
    "¿Por qué se erosiona el suelo?": "inferencial",
    "El efecto de dormir poco en el aprendizaje": "inferencial",
    "El páramo, fábrica de agua": "literal",
    "Oídos tapados en la carretera": "inferencial",
    "Murciélagos incomprendidos": "inferencial",
    "Energía que baja de la montaña": "literal",
  },
  "9°": {
    "¿Deberían los celulares estar prohibidos en el colegio?": "inferencial",
    "La importancia de separar la basura": "inferencial",
    "¿Es necesario el uniforme escolar?": "inferencial",
    "El valor de aprender un segundo idioma": "literal",
    "Menos memoria, más criterio": "inferencial",
    "La tienda escolar saludable": "inferencial",
    "¿Hecho u opinión?": "critico",
    "La propuesta de don Gustavo": "inferencial",
  },
  "10°": {
    "El silencio también comunica": "inferencial",
    "La trampa de la comparación constante": "inferencial",
    "Aprender del error en lugar de temerle": "inferencial",
    "El costo invisible de la prisa": "inferencial",
    "El ruido de fondo": "inferencial",
    "Conversaciones de pantalla": "critico",
    "Volver al campo": "critico",
    "La función del ejemplo": "critico",
  },
  "11°": {
    "¿Correlación o causalidad?": "critico",
    "El sesgo de confirmación": "critico",
    "Los límites de las encuestas de opinión": "critico",
    "La paradoja de la elección": "critico",
    "La generalización apresurada": "critico",
    "El testimonio publicitario": "critico",
    "Dos posturas, un acuerdo": "critico",
    "El algoritmo elige por ti": "critico",
  },
};

module.exports = { NIVELES };
