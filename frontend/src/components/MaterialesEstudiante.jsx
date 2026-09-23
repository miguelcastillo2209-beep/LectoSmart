import { useEffect, useState } from "react";
import { C } from "../theme/colors";
import { apiFetch, apiDescargar } from "../api/client";

const formatearTamano = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });

// Ícono según el tipo de archivo, solo para que la lista se lea rápido.
const iconoDe = (nombre) => {
  const extension = nombre.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "📕";
  if (extension === "docx") return "📘";
  if (extension === "csv") return "📊";
  return "📄";
};

// Documentos que el docente marcó como refuerzo para este curso. El
// backend ya filtra por curso y visibilidad; aquí solo se listan. Si no
// hay ninguno, la sección no se muestra (ver PanelEstudiante).
export default function MaterialesEstudiante({ onUnauthorized, onCargados }) {
  const [documentos, setDocumentos] = useState([]);
  const [error, setError] = useState(null);
  const [descargando, setDescargando] = useState(null);

  useEffect(() => {
    let activo = true;
    apiFetch("/documentos/mios", { onUnauthorized })
      .then((datos) => {
        if (!activo) return;
        setDocumentos(datos);
        onCargados?.(datos.length);
      })
      .catch((err) => activo && setError(err.message));
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const descargar = async (doc) => {
    setDescargando(doc.id);
    setError(null);
    try {
      await apiDescargar(`/documentos/${doc.id}/descargar`, doc.nombre);
    } catch {
      setError("No se pudo descargar el archivo. Avísale a tu profe.");
    } finally {
      setDescargando(null);
    }
  };

  if (error) {
    return (
      <p className="ls-body text-sm rounded-2xl px-5 py-4" style={{ background: C.coralSuave, color: "#C2453B" }}>
        {error}
      </p>
    );
  }

  if (documentos.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {documentos.map((doc) => (
        <div
          key={doc.id}
          className="ls-card rounded-2xl p-5 flex items-start gap-4"
          style={{ background: "#fff", border: `2px solid ${C.borde}` }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
            style={{ background: C.azulSuave }}
          >
            {iconoDe(doc.nombre)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="ls-display font-bold break-words" style={{ color: C.tinta }}>
              {doc.nombre}
            </p>
            {doc.descripcion && (
              <p className="ls-body text-sm mt-0.5" style={{ color: C.gris }}>
                {doc.descripcion}
              </p>
            )}
            <p className="ls-body text-xs mt-1" style={{ color: C.gris }}>
              {formatearTamano(doc.tamano)} · {formatearFecha(doc.createdAt)}
            </p>
            <button
              onClick={() => descargar(doc)}
              disabled={descargando === doc.id}
              className="ls-btn ls-body text-xs font-bold px-4 py-2 rounded-full mt-3"
              style={{ background: C.azul, color: "#fff" }}
            >
              {descargando === doc.id ? "Descargando…" : "⬇️ Descargar"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
