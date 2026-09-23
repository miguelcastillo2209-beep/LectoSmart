import { Fragment, useEffect, useRef, useState } from "react";
import { C } from "../theme/colors";
import { apiFetch, apiUpload, apiDescargar } from "../api/client";

const formatearTamano = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatearFecha = (iso) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });

// Sección de documentos de apoyo. Subirlos y gestionarlos es solo de
// docentes y administradores; cada documento puede además publicarse
// como "material de refuerzo" para que los estudiantes de ciertos
// cursos lo vean y lo descarguen desde su panel.
export default function DocumentosPanel({ onUnauthorized, nombreUsuario, cursosDisponibles = [] }) {
  const [documentos, setDocumentos] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { tipo: "ok" | "error", texto }
  // Al subir: si se marca, el archivo queda visible para los cursos
  // elegidos (por defecto, todos los del docente).
  const [publicarAlSubir, setPublicarAlSubir] = useState(false);
  const [cursosAlSubir, setCursosAlSubir] = useState(cursosDisponibles);
  const [editandoVisibilidad, setEditandoVisibilidad] = useState(null); // id del documento
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
      formData.append("visibleParaEstudiantes", String(publicarAlSubir));
      formData.append("cursos", JSON.stringify(publicarAlSubir ? cursosAlSubir : []));
      const resultado = await apiUpload("/documentos", formData, { onUnauthorized });
      const notaIA = resultado.legibleParaIA
        ? "El asistente IA ya puede usarlo."
        : "El asistente IA no pudo leer su contenido.";
      setMensaje({
        tipo: "ok",
        texto: resultado.visibleParaEstudiantes
          ? `"${resultado.nombre}" subido y publicado para los estudiantes. ${notaIA}`
          : `"${resultado.nombre}" subido. ${notaIA}`,
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

  const guardarVisibilidad = async (doc, visibleParaEstudiantes, cursos) => {
    try {
      await apiFetch(`/documentos/${doc.id}/visibilidad`, {
        method: "PATCH",
        body: { visibleParaEstudiantes, cursos },
        onUnauthorized,
      });
      setEditandoVisibilidad(null);
      setMensaje({
        tipo: "ok",
        texto: visibleParaEstudiantes
          ? `"${doc.nombre}" ya lo pueden ver los estudiantes de ${cursos.join(", ")}.`
          : `"${doc.nombre}" volvió a ser solo del cuerpo docente.`,
      });
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
          Guías, planes de lectura, textos, rúbricas… Por defecto solo los ven docentes y
          administración; puedes entregar los que quieras a los estudiantes como material de
          refuerzo. Los formatos PDF, Word (.docx) y texto alimentan además al asistente IA.
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
              disabled={subiendo || (publicarAlSubir && cursosAlSubir.length === 0)}
              onChange={subir}
            />
          </label>
        </div>

        <div className="mt-4 rounded-2xl px-4 py-3" style={{ background: C.fondo }}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={publicarAlSubir}
              onChange={(e) => setPublicarAlSubir(e.target.checked)}
            />
            <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>
              Entregárselo a los estudiantes como material de refuerzo
            </span>
          </label>
          {publicarAlSubir && (
            <div className="mt-3">
              <p className="ls-body text-xs font-bold mb-1.5" style={{ color: C.gris }}>
                ¿Qué cursos lo verán?
              </p>
              <ChipsCursos
                cursos={cursosDisponibles}
                seleccionados={cursosAlSubir}
                onCambiar={setCursosAlSubir}
              />
              {cursosAlSubir.length === 0 && (
                <p className="ls-body text-xs mt-2 font-semibold" style={{ color: "#C2453B" }}>
                  Elige al menos un curso antes de subir el archivo.
                </p>
              )}
            </div>
          )}
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
                  {["Documento", "Subido por", "Fecha", "Tamaño", "IA", "Estudiantes", ""].map((h, i) => (
                    <th key={i} className="text-left font-semibold px-6 py-3 whitespace-nowrap" style={{ background: C.fondo }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {documentos.map((doc) => (
                  <Fragment key={doc.id}>
                  <tr style={{ borderTop: `1px solid ${C.borde}` }}>
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
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {doc.visibleParaEstudiantes ? (
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={{ background: "#E7F6EC", color: "#2E7D46" }}
                            title="Los estudiantes de estos cursos lo ven en su panel"
                          >
                            ✓ {doc.cursos.length > 0 ? doc.cursos.join(" · ") : "Todos"}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold" style={{ color: C.gris }}>
                            Solo docentes
                          </span>
                        )}
                        <button
                          onClick={() => setEditandoVisibilidad(editandoVisibilidad === doc.id ? null : doc.id)}
                          className="ls-btn text-xs font-semibold px-3 py-1.5 rounded-full"
                          style={{ background: C.fondo, color: C.tinta, border: `2px solid ${C.borde}` }}
                        >
                          {editandoVisibilidad === doc.id ? "Cerrar" : "Cambiar"}
                        </button>
                      </div>
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
                  {editandoVisibilidad === doc.id && (
                    <tr style={{ background: C.fondo }}>
                      <td colSpan={7} className="px-6 py-4">
                        <EditorVisibilidad
                          documento={doc}
                          cursosDisponibles={cursosDisponibles}
                          onGuardar={(visible, cursos) => guardarVisibilidad(doc, visible, cursos)}
                          onCancelar={() => setEditandoVisibilidad(null)}
                        />
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Selección múltiple de cursos con botones, igual que la asignación de
// cursos a docentes en /admin.
function ChipsCursos({ cursos, seleccionados, onCambiar }) {
  const alternar = (curso) =>
    onCambiar(
      seleccionados.includes(curso)
        ? seleccionados.filter((c) => c !== curso)
        : [...seleccionados, curso]
    );

  return (
    <div className="flex gap-1.5 flex-wrap">
      {cursos.map((curso) => {
        const activo = seleccionados.includes(curso);
        return (
          <button
            key={curso}
            type="button"
            onClick={() => alternar(curso)}
            className="ls-btn ls-body text-xs font-bold px-3.5 py-1.5 rounded-full"
            style={
              activo
                ? { background: C.azul, color: "#fff" }
                : { background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }
            }
          >
            {curso}
          </button>
        );
      })}
    </div>
  );
}

// Editor en línea de a quién llega un documento ya subido. Publicar
// exige elegir al menos un curso: así nadie publica sin querer un
// material a grados que no le corresponden.
function EditorVisibilidad({ documento, cursosDisponibles, onGuardar, onCancelar }) {
  const [cursos, setCursos] = useState(
    documento.cursos.length > 0 ? documento.cursos : cursosDisponibles
  );

  return (
    <div>
      <p className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>
        ¿Quién puede ver “{documento.nombre}”?
      </p>
      <p className="ls-body text-xs mt-0.5 mb-3" style={{ color: C.gris }}>
        Los cursos que marques verán el archivo en su panel, en “Material de refuerzo”.
      </p>
      <ChipsCursos cursos={cursosDisponibles} seleccionados={cursos} onCambiar={setCursos} />
      <div className="flex gap-2 mt-4 flex-wrap">
        <button
          onClick={() => onGuardar(true, cursos)}
          disabled={cursos.length === 0}
          className="ls-btn ls-body text-xs font-bold px-4 py-2 rounded-full disabled:opacity-40"
          style={{ background: C.verde, color: "#fff" }}
        >
          {documento.visibleParaEstudiantes ? "Guardar cursos" : "Publicar a los estudiantes"}
        </button>
        {documento.visibleParaEstudiantes && (
          <button
            onClick={() => onGuardar(false, [])}
            className="ls-btn ls-body text-xs font-semibold px-4 py-2 rounded-full"
            style={{ background: C.coralSuave, color: "#C2453B" }}
          >
            Quitar de los estudiantes
          </button>
        )}
        <button
          onClick={onCancelar}
          className="ls-btn ls-body text-xs font-semibold px-4 py-2 rounded-full"
          style={{ background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
