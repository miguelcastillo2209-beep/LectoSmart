const { PUNTOS_POR_NIVEL } = require("../lib/constants");

function calcularNivel(puntosTotales) {
  const nivel = Math.floor(puntosTotales / PUNTOS_POR_NIVEL) + 1;
  const puntosEnNivel = puntosTotales % PUNTOS_POR_NIVEL;
  return { nivel, puntosEnNivel, metaNivel: PUNTOS_POR_NIVEL };
}

// Determina la nueva racha de un estudiante a partir de la fecha de su
// última actividad y "ahora". Compara únicamente el día calendario.
function calcularRacha({ rachaActual, ultimaActividadEn, ahora = new Date() }) {
  if (!ultimaActividadEn) return 1;

  const inicioDia = (fecha) =>
    Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());

  const diffDias = Math.round(
    (inicioDia(ahora) - inicioDia(new Date(ultimaActividadEn))) / 86400000
  );

  if (diffDias <= 0) return rachaActual || 1; // misma fecha calendario
  if (diffDias === 1) return (rachaActual || 0) + 1; // día consecutivo
  return 1; // se rompió la racha
}

module.exports = { calcularNivel, calcularRacha };
