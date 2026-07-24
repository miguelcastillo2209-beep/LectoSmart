// Metas de fluidez lectora por curso (ver docs/estudio-contenidos-por-grado.md).
// Usadas por el generador de actividades con IA para pedir textos con la
// longitud y velocidad objetivo correctas de cada grado.
const METAS_FLUIDEZ = {
  "6°": { ppmMin: 95, ppmMax: 115, palabrasMin: 65, palabrasMax: 85 },
  "7°": { ppmMin: 110, ppmMax: 125, palabrasMin: 85, palabrasMax: 95 },
  "8°": { ppmMin: 120, ppmMax: 140, palabrasMin: 95, palabrasMax: 110 },
  "9°": { ppmMin: 130, ppmMax: 150, palabrasMin: 105, palabrasMax: 120 },
  "10°": { ppmMin: 140, ppmMax: 160, palabrasMin: 120, palabrasMax: 130 },
  "11°": { ppmMin: 150, ppmMax: 170, palabrasMin: 130, palabrasMax: 150 },
};

module.exports = { METAS_FLUIDEZ };
