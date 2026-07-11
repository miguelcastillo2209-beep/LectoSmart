// Normaliza el usuario de login para que no dependa de mayúsculas/minúsculas
// ni de espacios accidentales al escribirlo. Se usa tanto al crear cuentas
// (registro público y panel admin) como al buscarlas en el login, para que
// "Miguel_Castillo" y "miguel_castillo" sean siempre la misma cuenta.
function normalizarUsuario(usuario) {
  return usuario?.trim().toLowerCase() ?? "";
}

module.exports = { normalizarUsuario };
