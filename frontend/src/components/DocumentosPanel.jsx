import { useEffect, useRef, useState } from "react";
import { C } from "../theme/colors";
import { apiFetch, apiUpload, apiDescargar } from "../api/client";

const formatearTamano = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });

// Sección de documentos de apoyo — visible SOLO para docentes y
// administradores (la ruta del backend rechaza cualquier otro rol).
export default function DocumentosPanel({ onUnauthorized, nombreUsuario }) {
  const [documentos, setDocumentos] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok" | "error", texto }
  const inputArchivo = useRef(null);

  const cargar = () => {
    apiFetch("/documentos", { onUnauthorized })
      .then(setDocumentos)
      .catch((err) => setMensaje({ tipo: "error", texto: err.message }));
  };

  useEffect(cargar, []); // eslint-disable-line react-hooks/exhaustive-deps

  const subir = async (evento) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    setSubiendo(true);
    setMensaje(null);
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      if (descripcion.trim()) formData.append("descripcion", descripcion.trim());
      if (nombreUsuario) formData.append("subidoPor", nombreUsuario);
      const resultado = await apiUpload("/documentos", formData, { onUnauthorized });
      setMensaje({
        tipo: "ok",
        texto: resultado.legibleParaIA
          ? `"${resultado.nombre}" subido. El asistente IA ya puede usarlo.`
          : `"${resultado.nombre}" subido (el asistente IA no pudo leer su contenido).`,
      });
      setDescripcion("");
      cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    } finally {
      setSubiendo(false);
      if (inputArchivo.current) inputArchivo.current.value = "";
    }
  };

  const eliminar = async (doc) => {
    if (!window.confirm(`¿Eliminar "${doc.nombre}"? El asistente IA dejará de usarlo.`)) return;
    try {
      await apiFetch(`/documentos/${doc.id}`, { method: "DELETE", onUnauthorized });
      cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  return (
    <div className="mt-6">
      <div className="rounded-3xl p-6" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
        <h2 className="ls-display text-lg font-bold" style={{ color: C.tinta }}>
          📎 Subir documento de apoyo
        </h2>
        <p className="ls-body text-sm mt-1" style={{ color: C.gris }}>
          Guías, planes de lectura, textos, rúbricas… Solo docentes y administración pueden verlos.
          Los formatos PDF, Word (.docx) y texto alimentan además al asistente IA.
        </p>
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <input
            className="ls-body text-sm px-4 py-2 rounded-full outline-none flex-1 min-w-56"
            placeholder="Descripción corta (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{ background: C.fondo, border: `2px solid ${C.borde}` }}
          />
          <label
            className="ls-btn ls-body text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer"
            style={{ background: subiendo ? C.gris : C.azul, color: "#fff" }}
          >
            {subiendo ? "Subiendo…" : "Elegir archivo"}
            <input
              ref={inputArchivo}
              type="file"
              accept=".pdf,.docx,.txt,.md,.csv"
              className="hidden"
              disabled={subiendo}
              onChange={subir}
            />
          </label>
        </div>
        {mensaje && (
          <p
            className="ls-body text-sm font-semibold rounded-xl px-4 py-3 mt-4"
            style={
              mensaje.tipo === "ok"
                ? { background: C.verdeSuave ?? "#E7F6EC", color: "#2E7D46" }
                : { background: C.coralSuave, color: "#C2453B" }
            }
          >
            {mensaje.texto}
          </p>
        )}
      </div>

      <div className="mt-6 rounded-3xl overflow-hidden" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
        <div className="px-6 py-4" style={{ borderBottom: `2px solid ${C.borde}` }}>
          <h2 className="ls-display text-lg font-bold" style={{ color: C.tinta }}>
            Documentos ({documentos.length})
          </h2>
        </div>
        {documentos.length === 0 ? (
          <p className="ls-body text-sm px-6 py-6 text-center" style={{ color: C.gris }}>
            Aún no hay documentos. Sube el primero para que el asistente IA los use.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full ls-body text-sm">
              <thead>
                <tr style={{ color: C.gris }}>
                  {["Documento", "Subido por", "Fecha", "Tamaño", "IA", ""].map((h, i) => (
                    <th key={i} className="text-left font-semibold px-6 py-3 whitespace-nowrap" style={{ background: C.fondo }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc) => (
                  <tr key={doc.id} style={{ borderTop: `1px solid ${C.borde}` }}>
                    <td className="px-6 py-3.5">
                      <p className="font-semibold" style={{ color: C.tinta }}>{doc.nombre}</p>
                      {doc.descripcion && (
                        <p className="text-xs mt-0.5" style={{ color: C.gris }}>{doc.descripcion}</p>
                      )}
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap" style={{ color: C.gris }}>{doc.subidoPor}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap" style={{ color: C.gris }}>{formatearFecha(doc.createdAt)}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap" style={{ color: C.gris }}>{formatearTamano(doc.tamano)}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={
                          doc.legibleParaIA
                            ? { background: "#E7F6EC", color: "#2E7D46" }
                            : { background: C.fondo, color: C.gris }
                        }
                        title={doc.legibleParaIA ? "El asistente IA usa este documento" : "No se pudo extraer texto"}
                      >
                        {doc.legibleParaIA ? "✓ activa" : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => apiDescargar(`/documentos/${doc.id}/descargar`, doc.nombre)}
                        className="ls-btn text-xs font-semibold px-3 py-1.5 rounded-full mr-2"
                        style={{ background: C.azulSuave, color: C.azul }}
                      >
                        Descargar
                      </button>
                      <button
                        onClick={() => eliminar(doc)}
                        className="ls-btn text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{ background: C.coralSuave, color: "#C2453B" }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
