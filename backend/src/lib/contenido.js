// Quita del contenido de una actividad los campos que revelarían la
// respuesta correcta antes de que el estudiante intente resolverla.
function contenidoPublico(actividad) {
  const contenido = JSON.parse(actividad.contenido);
  const { respuesta, ...publico } = contenido;
  return publico;
}

module.exports = { contenidoPublico };
