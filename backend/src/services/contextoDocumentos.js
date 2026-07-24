const prisma = require("../lib/prisma");

// Límites para no exceder la capa gratuita del proveedor de IA.
const MAX_CARACTERES_POR_DOCUMENTO = 15000;
const MAX_CARACTERES_DOCUMENTOS = 45000;

// Arma el bloque de texto con el contenido de los documentos que
// subieron docentes/administración, para usarlo como contexto (RAG) en
// el asistente de chat y en el generador de actividades con IA.
async function construirContextoDocumentos() {
  const documentos = await prisma.documento.findMany({
    where: { textoExtraido: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { nombre: true, descripcion: true, textoExtraido: true },
  });
  if (documentos.length === 0) return "";

  const partes = [];
  let usados = 0;
  for (const doc of documentos) {
    if (usados >= MAX_CARACTERES_DOCUMENTOS) break;
    const restante = MAX_CARACTERES_DOCUMENTOS - usados;
    const texto = doc.textoExtraido.slice(0, Math.min(MAX_CARACTERES_POR_DOCUMENTO, restante));
    usados += texto.length;
    partes.push(
      `── Documento: "${doc.nombre}"${doc.descripcion ? ` (${doc.descripcion})` : ""} ──\n${texto}`
    );
  }
  return partes.join("\n\n");
}

module.exports = { construirContextoDocumentos };
