import { useEffect, useState } from "react";
import { C } from "../theme/colors";
import { apiFetch } from "../api/client";

const MODULOS = [
  { valor: "PALABRAS", etiqueta: "Reconocer palabras" },
  { valor: "ORTOGRAFIA", etiqueta: "Escribir sin errores" },
  { valor: "COMPRENSION", etiqueta: "Comprensión lectora" },
  { valor: "FLUIDEZ", etiqueta: "Fluidez lectora" },
];

// Etiquetas de backend/src/lib/focosOrtografia.js, solo para mostrar.
const ETIQUETA_FOCO = {
  letras: "Letras (b/v, s/c/z, g/j, h)",
  tildes: "Tildes y acentuación",
  gramatica: "Gramática y concordancia",
  puntuacion: "Puntuación",
};

// Genera actividades candidatas con IA (a partir de los documentos
// subidos y el enfoque pedagógico del curso), y permite al docente
// aprobarlas, pedir ajustes con una sugerencia, o rechazarlas. Solo lo
// aprobado se publica y llega a los estudiantes.
export default function PropuestasIA({ onUnauthorized, cursosDisponibles, nombreDocente }) {
  const [curso, setCurso] = useState(cursosDisponibles[0] || "");
  const [modulo, setModulo] = useState("PALABRAS");
  const [cantidad, setCantidad] = useState(3);
  const [pendientes, setPendientes] = useState([]);
  const [generando, setGenerando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  const cargarPendientes = () => {
    if (!curso) return;
    setCargando(true);
    apiFetch(`/propuestas?estado=pendiente&curso=${encodeURIComponent(curso)}&modulo=${modulo}`, { onUnauthorized })
      .then(setPendientes)
      .catch((err) => setMensaje({ tipo: "error", texto: err.message }))
      .finally(() => setCargando(false));
  };

  useEffect(cargarPendientes, [curso, modulo]); // eslint-disable-line react-hooks/exhaustive-deps

  const generar = async () => {
    if (!curso) return;
    setGenerando(true);
    setMensaje(null);
    try {
      const creadas = await apiFetch("/propuestas/generar", {
        method: "POST",
        body: { modulo, curso, cantidad, nombreDocente },
        onUnauthorized,
      });
      setMensaje({ tipo: "ok", texto: `Se generaron ${creadas.length} propuesta(s). Revísalas antes de aprobarlas.` });
      cargarPendientes();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    } finally {
      setGenerando(false);
    }
  };

  const aprobar = async (id) => {
    try {
      await apiFetch(`/propuestas/${id}/aprobar`, { method: "POST", onUnauthorized });
      setMensaje({ tipo: "ok", texto: "Actividad publicada. Ya está disponible para los estudiantes." });
      cargarPendientes();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  const rechazar = async (id) => {
    if (!window.confirm("¿Rechazar esta propuesta? No se podrá recuperar.")) return;
    try {
      await apiFetch(`/propuestas/${id}/rechazar`, { method: "POST", onUnauthorized });
      cargarPendientes();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  if (cursosDisponibles.length === 0) {
    return (
      <div className="mt-6 rounded-3xl p-8 text-center" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
        <p className="ls-display font-bold" style={{ color: C.tinta }}>No tienes cursos asignados</p>
        <p className="ls-body text-sm mt-1" style={{ color: C.gris }}>
          Pide a un administrador que te asigne un curso para poder generar actividades.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="rounded-3xl p-6" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
        <h2 className="ls-display text-lg font-bold" style={{ color: C.tinta }}>🧪 Generar actividades con IA</h2>
        <p className="ls-body text-sm mt-1" style={{ color: C.gris }}>
          La IA propone actividades usando los documentos que hayan subido y el enfoque pedagógico del curso. Nada se publica hasta que lo apruebes.
        </p>
        <div className="flex items-end gap-3 mt-4 flex-wrap">
          <div>
            <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Curso</label>
            <select
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              className="ls-body text-sm px-3 py-2 rounded-full outline-none block mt-1"
              style={{ background: C.fondo, border: `2px solid ${C.borde}`, color: C.tinta }}
            >
              {cursosDisponibles.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Módulo</label>
            <select
              value={modulo}
              onChange={(e) => setModulo(e.target.value)}
              className="ls-body text-sm px-3 py-2 rounded-full outline-none block mt-1"
              style={{ background: C.fondo, border: `2px solid ${C.borde}`, color: C.tinta }}
            >
              {MODULOS.map((m) => <option key={m.valor} value={m.valor}>{m.etiqueta}</option>)}
            </select>
          </div>
          <div>
            <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Cuántas</label>
            <select
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="ls-body text-sm px-3 py-2 rounded-full outline-none block mt-1"
              style={{ background: C.fondo, border: `2px solid ${C.borde}`, color: C.tinta }}
            >
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <button
            onClick={generar}
            disabled={generando || !curso}
            className="ls-btn ls-body text-sm font-bold px-6 py-2.5 rounded-full"
            style={{ background: generando ? C.gris : C.morado, color: "#fff" }}
          >
            {generando ? "Generando… (puede tardar ~15s)" : "Generar con IA"}
          </button>
        </div>

        {mensaje && (
          <p
            className="ls-body text-sm font-semibold rounded-xl px-4 py-3 mt-4"
            style={mensaje.tipo === "ok" ? { background: "#E7F6EC", color: "#2E7D46" } : { background: C.coralSuave, color: "#C2453B" }}
          >
            {mensaje.texto}
          </p>
        )}
      </div>

      <div className="mt-6">
        <h3 className="ls-display text-base font-bold mb-3" style={{ color: C.tinta }}>
          Pendientes de revisión — {curso} · {MODULOS.find((m) => m.valor === modulo)?.etiqueta} ({pendientes.length})
        </h3>
        {cargando ? (
          <p className="ls-body text-sm" style={{ color: C.gris }}>Cargando…</p>
        ) : pendientes.length === 0 ? (
          <p className="ls-body text-sm rounded-2xl px-5 py-4" style={{ background: "#fff", border: `2px solid ${C.borde}`, color: C.gris }}>
            No hay propuestas pendientes para este curso y módulo. Genera algunas arriba.
          </p>
        ) : (
          <div className="grid gap-4">
            {pendientes.map((p) => (
              <TarjetaPropuesta key={p.id} propuesta={p} onAprobar={aprobar} onRechazar={rechazar} onRegenerar={cargarPendientes} onUnauthorized={onUnauthorized} onMensaje={setMensaje} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TarjetaPropuesta({ propuesta, onAprobar, onRechazar, onRegenerar, onUnauthorized, onMensaje }) {
  const [sugerenciaAbierta, setSugerenciaAbierta] = useState(false);
  const [sugerencia, setSugerencia] = useState("");
  const [regenerando, setRegenerando] = useState(false);
  const c = propuesta.contenido;

  const regenerar = async () => {
    if (!sugerencia.trim()) return;
    setRegenerando(true);
    try {
      await apiFetch(`/propuestas/${propuesta.id}/regenerar`, {
        method: "POST",
        body: { sugerencia: sugerencia.trim() },
        onUnauthorized,
      });
      setSugerenciaAbierta(false);
      setSugerencia("");
      onRegenerar();
    } catch (err) {
      onMensaje({ tipo: "error", texto: err.message });
    } finally {
      setRegenerando(false);
    }
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="ls-display font-bold" style={{ color: C.tinta }}>{propuesta.titulo}</p>
          <div className="flex items-center gap-2 mt-1">
            {propuesta.basadaEnDocumentos && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: C.azulSuave, color: C.azul }}>
                📎 puede estar basada en tus documentos
              </span>
            )}
            {c.foco && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: C.coralSuave, color: "#C2453B" }}>
                {ETIQUETA_FOCO[c.foco] ?? c.foco}
              </span>
            )}
            <span className="text-xs" style={{ color: C.gris }}>por {propuesta.creadaPor}</span>
          </div>
        </div>
      </div>

      {propuesta.sugerenciaDocente && (
        <p className="ls-body text-xs mt-2 px-3 py-2 rounded-lg" style={{ background: C.moradoSuave, color: C.morado }}>
          Última sugerencia aplicada: "{propuesta.sugerenciaDocente}"
        </p>
      )}

      <div className="mt-3 ls-body text-sm" style={{ color: C.tinta }}>
        {c.texto && <p className="leading-relaxed mb-2" style={{ color: C.gris }}>{c.texto}</p>}
        {c.instruccion && <p className="font-semibold mb-2">{c.instruccion}</p>}
        {c.pregunta && <p className="font-semibold mb-2">{c.pregunta}</p>}
        {Array.isArray(c.opciones) && (
          <ul className="grid gap-1.5">
            {c.opciones.map((op) => (
              <li
                key={op}
                className="px-3 py-1.5 rounded-lg text-sm"
                style={op === c.respuesta ? { background: "#E7F6EC", color: "#2E7D46", fontWeight: 700 } : { background: C.fondo, color: C.tinta }}
              >
                {op === c.respuesta ? "✓ " : ""}{op}
              </li>
            ))}
          </ul>
        )}
        {c.ppmObjetivo && (
          <p className="text-xs mt-1" style={{ color: C.gris }}>{c.palabras} palabras · meta {c.ppmObjetivo} ppm</p>
        )}
        {c.explicacion && (
          <p className="text-xs mt-3 px-3 py-2 rounded-lg" style={{ background: C.fondo, color: C.gris }}>
            💬 {c.explicacion}
          </p>
        )}
      </div>

      {sugerenciaAbierta ? (
        <div className="mt-4">
          <textarea
            className="ls-body text-sm w-full px-4 py-2.5 rounded-xl outline-none resize-none"
            style={{ background: C.fondo, border: `2px solid ${C.borde}` }}
            rows={2}
            placeholder="¿Qué le cambiarías? Ej: 'usa un ejemplo de la vida rural' o 'hazla más corta'"
            value={sugerencia}
            onChange={(e) => setSugerencia(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={regenerar}
              disabled={regenerando || !sugerencia.trim()}
              className="ls-btn ls-body text-xs font-bold px-4 py-2 rounded-full"
              style={{ background: regenerando ? C.gris : C.morado, color: "#fff" }}
            >
              {regenerando ? "Regenerando…" : "Regenerar con esta sugerencia"}
            </button>
            <button
              onClick={() => setSugerenciaAbierta(false)}
              className="ls-btn ls-body text-xs font-semibold px-4 py-2 rounded-full"
              style={{ background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 mt-4 flex-wrap">
          <button onClick={() => onAprobar(propuesta.id)} className="ls-btn ls-body text-xs font-bold px-4 py-2 rounded-full" style={{ background: C.verde, color: "#fff" }}>
            ✅ Aprobar y publicar
          </button>
          <button onClick={() => setSugerenciaAbierta(true)} className="ls-btn ls-body text-xs font-bold px-4 py-2 rounded-full" style={{ background: C.azulSuave, color: C.azul }}>
            ✍️ Sugerir cambios
          </button>
          <button onClick={() => onRechazar(propuesta.id)} className="ls-btn ls-body text-xs font-semibold px-4 py-2 rounded-full" style={{ background: C.coralSuave, color: "#C2453B" }}>
            ❌ Rechazar
          </button>
        </div>
      )}
    </div>
  );
}
