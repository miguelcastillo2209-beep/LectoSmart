// Fisher-Yates: baraja una copia del arreglo sin mutar el original.
function barajar(arreglo) {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Quita del contenido de una actividad los campos que revelarían la
// respuesta correcta antes de que el estudiante intente resolverla
// (respuesta y explicacion) y, para PALABRAS/COMPRENSION, mezcla el
// orden de las opciones en cada solicitud para que la posición de la
// correcta no sea predecible.
function contenidoPublico(actividad) {
  const contenido = JSON.parse(actividad.contenido);
  const { respuesta, explicacion, ...publico } = contenido;
  if (Array.isArray(publico.opciones)) {
    publico.opciones = barajar(publico.opciones);
  }
  return publico;
}

module.exports = { contenidoPublico };
