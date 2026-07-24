const fs = require("fs/promises");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// Extrae el texto de un archivo subido para usarlo como contexto del
// asistente IA. Devuelve null si el formato no permite extraer texto
// (la subida no falla por esto: el documento igual queda guardado).
async function extraerTexto(rutaArchivo, mimeType, nombreOriginal) {
  try {
    const extension = (nombreOriginal.split(".").pop() || "").toLowerCase();

    if (mimeType === "application/pdf" || extension === "pdf") {
      const buffer = await fs.readFile(rutaArchivo);
      const data = await pdfParse(buffer);
      return limpiar(data.text);
    }

    if (
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      extension === "docx"
    ) {
      const { value } = await mammoth.extractRawText({ path: rutaArchivo });
      return limpiar(value);
    }

    if (mimeType.startsWith("text/") || ["txt", "md", "csv"].includes(extension)) {
      const contenido = await fs.readFile(rutaArchivo, "utf8");
      return limpiar(contenido);
    }

    return null;
  } catch (err) {
    console.error(`No se pudo extraer texto de ${nombreOriginal}:`, err.message);
    return null;
  }
}

function limpiar(texto) {
  const t = (texto || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  return t.length > 0 ? t : null;
}

module.exports = { extraerTexto };
