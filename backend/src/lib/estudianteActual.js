const prisma = require("./prisma");

// Carga el estudiante dueño del token actual. Si ya no existe (por
// ejemplo, un admin lo borró después de emitirse el token), responde
// 401 en vez de dejar que un findUniqueOrThrow lance un error sin
// capturar — eso tumbaba el proceso entero de Node (ver
// server.js -> unhandledRejection) para todos los estudiantes
// conectados, no solo el de la sesión inválida.
async function estudianteActual(req, res) {
  const estudiante = await prisma.estudiante.findUnique({ where: { id: req.usuario.id } });
  if (!estudiante) {
    res.status(401).json({ error: "Tu sesión ya no es válida. Vuelve a iniciar sesión." });
    return null;
  }
  return estudiante;
}

module.exports = { estudianteActual };
