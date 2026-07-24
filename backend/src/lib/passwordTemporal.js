const crypto = require("crypto");

// Alfabeto sin caracteres que se confunden fácilmente al dictarlos en
// clase (0/O, 1/l/I). Usado para contraseñas temporales que un
// docente/admin genera y le dicta al estudiante.
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

function generarPasswordTemporal(longitud = 8) {
  let resultado = "";
  const bytes = crypto.randomBytes(longitud);
  for (let i = 0; i < longitud; i++) {
    resultado += ALFABETO[bytes[i] % ALFABETO.length];
  }
  return resultado;
}

module.exports = { generarPasswordTemporal };
