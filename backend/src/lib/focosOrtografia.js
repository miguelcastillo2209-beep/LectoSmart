// Focos del módulo ORTOGRAFIA. La docente pidió poder distinguir tres
// cosas que hoy se mezclan en "Reconocer palabras": qué letra va de
// verdad (b/v, s/c/z…), dónde va la fuerza de voz (la tilde) y si la
// frase está bien construida. Se agrega "puntuacion" porque a partir de
// 8° la coma y el punto son parte del mismo problema de escritura y no
// caben en ninguno de los otros tres.
//
// Cada Actividad de ORTOGRAFIA guarda su foco en contenido.foco; el
// panel del docente los usa para mostrar en qué está fallando el grupo
// (ver docs/estudio-ortografia-y-gramatica.md).
const FOCOS_ORTOGRAFIA = ["letras", "tildes", "gramatica", "puntuacion"];

const FOCO_POR_DEFECTO = "letras";

// Etiquetas legibles, usadas en el prompt de la IA y en los reportes.
const ETIQUETA_FOCO = {
  letras: "Letras que van (b/v, s/c/z, g/j, h, ll/y)",
  tildes: "Tildes y acentuación (dónde va la fuerza de voz)",
  gramatica: "Gramática y concordancia (cómo se arma la frase)",
  puntuacion: "Puntuación (coma, punto, signos)",
};

function normalizarFoco(valor) {
  return FOCOS_ORTOGRAFIA.includes(valor) ? valor : FOCO_POR_DEFECTO;
}

module.exports = { FOCOS_ORTOGRAFIA, FOCO_POR_DEFECTO, ETIQUETA_FOCO, normalizarFoco };
