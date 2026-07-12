const { CURSOS } = require("./constants");

// Valida y normaliza el arreglo de cursos que un admin asigna a un
// docente (Docente.cursosAsignados, guardado como JSON-string).
function validarCursos(cursos) {
  if (cursos === undefined) return undefined;
  if (!Array.isArray(cursos)) {
    const err = new Error("Cursos inválidos");
    err.status = 400;
    throw err;
  }
  const limpios = [...new Set(cursos)];
  if (limpios.some((c) => !CURSOS.includes(c))) {
    const err = new Error("Uno o más cursos no son válidos");
    err.status = 400;
    throw err;
  }
  return limpios;
}

function parseCursos(cursosAsignados) {
  try {
    return JSON.parse(cursosAsignados ?? "[]");
  } catch {
    return [];
  }
}

module.exports = { validarCursos, parseCursos };
