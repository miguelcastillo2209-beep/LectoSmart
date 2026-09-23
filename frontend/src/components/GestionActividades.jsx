import { useEffect, useState } from "react";
import { C } from "../theme/colors";
import { apiFetch } from "../api/client";

const MODULOS = [
  { valor: "PALABRAS", etiqueta: "Reconocer palabras" },
  { valor: "ORTOGRAFIA", etiqueta: "Escribir sin errores" },
  { valor: "COMPRENSION", etiqueta: "Comprensión lectora" },
  { valor: "FLUIDEZ", etiqueta: "Fluidez lectora" },
];

const NIVELES = ["literal", "inferencial", "critico"];

// Mismos valores que backend/src/lib/focosOrtografia.js — si cambian
// allá, actualizar aquí (el backend rechaza cualquier otro).
const FOCOS = [
  { valor: "letras", etiqueta: "Letras (b/v, s/c/z, g/j, h)" },
  { valor: "tildes", etiqueta: "Tildes y acentuación" },
  { valor: "gramatica", etiqueta: "Gramática y concordancia" },
  { valor: "puntuacion", etiqueta: "Puntuación" },
];

const etiquetaFoco = (valor) => FOCOS.find((f) => f.valor === valor)?.etiqueta ?? valor;

// Los módulos de opción múltiple comparten formulario (instrucción +
// opciones + explicación); COMPRENSION añade texto/pregunta/nivel y
// ORTOGRAFIA añade el foco.
const esOpcionMultiple = (modulo) => modulo !== "FLUIDEZ";

// Creación, edición, reordenamiento y eliminación de actividades
// publicadas — exclusivo de docente/admin. A diferencia de las
// propuestas de IA (que pasan por revisión), lo que se crea aquí llega
// de una vez a los estudiantes del curso.
export default function GestionActividades({ onUnauthorized, cursosDisponibles }) {
  const [curso, setCurso] = useState(cursosDisponibles[0] || "");
  const [modulo, setModulo] = useState("PALABRAS");
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [creando, setCreando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const cargar = () => {
    if (!curso) return;
    setCargando(true);
    apiFetch(`/actividades-gestion?curso=${encodeURIComponent(curso)}&modulo=${modulo}`, { onUnauthorized })
      .then(setActividades)
      .catch((err) => setMensaje({ tipo: "error", texto: err.message }))
      .finally(() => setCargando(false));
  };

  useEffect(cargar, [curso, modulo]); // eslint-disable-line react-hooks/exhaustive-deps

  const mover = async (id, direccion) => {
    try {
      await apiFetch(`/actividades-gestion/${id}/mover`, { method: "POST", body: { direccion }, onUnauthorized });
      cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  const eliminar = async (act) => {
    if (!window.confirm(`¿Eliminar "${act.titulo}"? Esto borra también el historial de intentos de los estudiantes en esta actividad.`)) return;
    try {
      await apiFetch(`/actividades-gestion/${act.id}`, { method: "DELETE", onUnauthorized });
      cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  const guardar = async (id, datos) => {
    try {
      await apiFetch(`/actividades-gestion/${id}`, { method: "PUT", body: datos, onUnauthorized });
      setEditandoId(null);
      setMensaje({ tipo: "ok", texto: "Actividad actualizada." });
      cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  // La actividad nueva queda de última en la lista del módulo/curso; se
  // reordena con las flechas si debe ir antes.
  const crear = async (datos) => {
    try {
      await apiFetch("/actividades-gestion", {
        method: "POST",
        body: { ...datos, curso, modulo },
        onUnauthorized,
      });
      setCreando(false);
      setMensaje({ tipo: "ok", texto: "Actividad creada y publicada para el curso." });
      cargar();
    } catch (err) {
      setMensaje({ tipo: "error", texto: err.message });
    }
  };

  if (cursosDisponibles.length === 0) {
    return (
      <div className="mt-6 rounded-3xl p-8 text-center" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
        <p className="ls-display font-bold" style={{ color: C.tinta }}>No tienes cursos asignados</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Curso</label>
          <select value={curso} onChange={(e) => { setCurso(e.target.value); setCreando(false); setEditandoId(null); }} className="ls-body text-sm px-3 py-2 rounded-full outline-none block mt-1" style={{ background: "#fff", border: `2px solid ${C.borde}`, color: C.tinta }}>
            {cursosDisponibles.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Módulo</label>
          <select value={modulo} onChange={(e) => { setModulo(e.target.value); setEditandoId(null); setCreando(false); }} className="ls-body text-sm px-3 py-2 rounded-full outline-none block mt-1" style={{ background: "#fff", border: `2px solid ${C.borde}`, color: C.tinta }}>
            {MODULOS.map((m) => <option key={m.valor} value={m.valor}>{m.etiqueta}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setCreando((v) => !v); setEditandoId(null); setMensaje(null); }}
          className="ls-btn ls-body text-sm font-bold px-5 py-2.5 rounded-full"
          style={creando ? { background: "#fff", color: C.gris, border: `2px solid ${C.borde}` } : { background: C.azul, color: "#fff" }}
        >
          {creando ? "Cancelar" : "+ Nueva actividad"}
        </button>
      </div>

      {mensaje && (
        <p className="ls-body text-sm font-semibold rounded-xl px-4 py-3 mt-4" style={mensaje.tipo === "ok" ? { background: "#E7F6EC", color: "#2E7D46" } : { background: C.coralSuave, color: "#C2453B" }}>
          {mensaje.texto}
        </p>
      )}

      {creando && (
        <div className="mt-4">
          <FormularioActividad
            modulo={modulo}
            onCancelar={() => setCreando(false)}
            onGuardar={crear}
          />
        </div>
      )}

      <div className="mt-4 grid gap-3">
        {cargando ? (
          <p className="ls-body text-sm" style={{ color: C.gris }}>Cargando…</p>
        ) : actividades.length === 0 ? (
          <p className="ls-body text-sm rounded-2xl px-5 py-4" style={{ background: "#fff", border: `2px solid ${C.borde}`, color: C.gris }}>
            No hay actividades para este curso y módulo. Crea la primera con “+ Nueva actividad”.
          </p>
        ) : (
          actividades.map((act, i) => (
            <TarjetaActividad
              key={act.id}
              actividad={act}
              modulo={modulo}
              esPrimera={i === 0}
              esUltima={i === actividades.length - 1}
              editando={editandoId === act.id}
              onEditar={() => { setEditandoId(act.id); setCreando(false); }}
              onCancelar={() => setEditandoId(null)}
              onGuardar={(datos) => guardar(act.id, datos)}
              onMover={(direccion) => mover(act.id, direccion)}
              onEliminar={() => eliminar(act)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TarjetaActividad({ actividad, modulo, esPrimera, esUltima, editando, onEditar, onCancelar, onGuardar, onMover, onEliminar }) {
  const c = actividad.contenido;

  if (editando) {
    return <FormularioActividad actividad={actividad} modulo={modulo} onCancelar={onCancelar} onGuardar={onGuardar} />;
  }

  return (
    <div className="rounded-2xl p-5" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <span className="ls-body text-xs font-bold" style={{ color: C.gris }}>#{actividad.orden}</span>
          <p className="ls-display font-bold" style={{ color: C.tinta }}>{actividad.titulo}</p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => onMover("arriba")} disabled={esPrimera} className="ls-btn text-xs font-bold w-8 h-8 rounded-full disabled:opacity-30" style={{ background: C.fondo, color: C.tinta }}>↑</button>
          <button onClick={() => onMover("abajo")} disabled={esUltima} className="ls-btn text-xs font-bold w-8 h-8 rounded-full disabled:opacity-30" style={{ background: C.fondo, color: C.tinta }}>↓</button>
        </div>
      </div>

      <div className="mt-2 ls-body text-sm" style={{ color: C.gris }}>
        {c.texto && <p className="line-clamp-2">{c.texto}</p>}
        {c.instruccion && <p>{c.instruccion}</p>}
        {c.pregunta && <p className="font-semibold mt-1" style={{ color: C.tinta }}>{c.pregunta}</p>}
        {c.ppmObjetivo && <p className="text-xs mt-1">{c.palabras} palabras · meta {c.ppmObjetivo} ppm</p>}
        {c.nivel && <span className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1" style={{ background: C.moradoSuave, color: C.morado }}>{c.nivel}</span>}
        {c.foco && <span className="text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1" style={{ background: C.coralSuave, color: "#C2453B" }}>{etiquetaFoco(c.foco)}</span>}
      </div>

      <div className="flex gap-2 mt-4">
        <button onClick={onEditar} className="ls-btn ls-body text-xs font-bold px-4 py-2 rounded-full" style={{ background: C.azulSuave, color: C.azul }}>✏️ Editar</button>
        <button onClick={onEliminar} className="ls-btn ls-body text-xs font-semibold px-4 py-2 rounded-full" style={{ background: C.coralSuave, color: "#C2453B" }}>🗑️ Eliminar</button>
      </div>
    </div>
  );
}

// Sirve para crear y para editar: sin `actividad` arranca en blanco y el
// contenedor decide si el guardado hace POST o PUT.
function FormularioActividad({ actividad, modulo, onCancelar, onGuardar }) {
  const c = actividad?.contenido ?? {};
  const [titulo, setTitulo] = useState(actividad?.titulo ?? "");
  const [texto, setTexto] = useState(c.texto || "");
  const [instruccion, setInstruccion] = useState(c.instruccion || "");
  const [pregunta, setPregunta] = useState(c.pregunta || "");
  const [opciones, setOpciones] = useState(c.opciones || ["", "", ""]);
  const [respuesta, setRespuesta] = useState(c.respuesta || "");
  const [explicacion, setExplicacion] = useState(c.explicacion || "");
  const [nivel, setNivel] = useState(c.nivel || "literal");
  const [foco, setFoco] = useState(c.foco || "letras");
  const [ppmObjetivo, setPpmObjetivo] = useState(c.ppmObjetivo || 120);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const esNueva = !actividad;

  const cambiarOpcion = (i, valor) => {
    const nuevas = [...opciones];
    const anterior = nuevas[i];
    nuevas[i] = valor;
    setOpciones(nuevas);
    if (respuesta === anterior) setRespuesta(valor);
  };

  const guardar = async () => {
    setError(null);
    let contenido;
    if (modulo === "PALABRAS") {
      contenido = { instruccion, opciones, respuesta, explicacion };
    } else if (modulo === "ORTOGRAFIA") {
      contenido = { instruccion, opciones, respuesta, explicacion, foco };
    } else if (modulo === "COMPRENSION") {
      contenido = { texto, pregunta, opciones, respuesta, explicacion, nivel };
    } else {
      contenido = { texto, ppmObjetivo: Number(ppmObjetivo) };
    }
    setGuardando(true);
    try {
      await onGuardar({ titulo, contenido });
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="rounded-2xl p-5" style={{ background: "#fff", border: `2px solid ${C.azul}` }}>
      {esNueva && (
        <p className="ls-display font-bold mb-3" style={{ color: C.tinta }}>
          Nueva actividad de {MODULOS.find((m) => m.valor === modulo)?.etiqueta}
        </p>
      )}

      <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Título</label>
      <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={esNueva ? "Ej: Se escribe con b o con v" : undefined} className="ls-body text-sm w-full px-3 py-2 rounded-xl outline-none mt-1 mb-3" style={{ background: C.fondo, border: `2px solid ${C.borde}` }} />

      {(modulo === "PALABRAS" || modulo === "ORTOGRAFIA") && (
        <>
          <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Instrucción</label>
          <textarea value={instruccion} onChange={(e) => setInstruccion(e.target.value)} rows={2} placeholder={modulo === "ORTOGRAFIA" ? "Ej: ¿Cómo se completa? “Mi hermano ___ a la vereda el sábado.”" : undefined} className="ls-body text-sm w-full px-3 py-2 rounded-xl outline-none mt-1 mb-3 resize-none" style={{ background: C.fondo, border: `2px solid ${C.borde}` }} />
        </>
      )}

      {modulo === "ORTOGRAFIA" && (
        <>
          <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>¿Qué practica esta actividad?</label>
          <select value={foco} onChange={(e) => setFoco(e.target.value)} className="ls-body text-sm px-3 py-2 rounded-full outline-none block mt-1 mb-3" style={{ background: C.fondo, border: `2px solid ${C.borde}` }}>
            {FOCOS.map((f) => <option key={f.valor} value={f.valor}>{f.etiqueta}</option>)}
          </select>
        </>
      )}

      {modulo === "COMPRENSION" && (
        <>
          <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Texto</label>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} className="ls-body text-sm w-full px-3 py-2 rounded-xl outline-none mt-1 mb-3 resize-none" style={{ background: C.fondo, border: `2px solid ${C.borde}` }} />
          <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Pregunta</label>
          <textarea value={pregunta} onChange={(e) => setPregunta(e.target.value)} rows={2} className="ls-body text-sm w-full px-3 py-2 rounded-xl outline-none mt-1 mb-3 resize-none" style={{ background: C.fondo, border: `2px solid ${C.borde}` }} />
        </>
      )}

      {modulo === "FLUIDEZ" && (
        <>
          <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Texto</label>
          <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={5} className="ls-body text-sm w-full px-3 py-2 rounded-xl outline-none mt-1 mb-3 resize-none" style={{ background: C.fondo, border: `2px solid ${C.borde}` }} />
          <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Meta de palabras por minuto</label>
          <input type="number" value={ppmObjetivo} onChange={(e) => setPpmObjetivo(e.target.value)} className="ls-body text-sm px-3 py-2 rounded-xl outline-none mt-1 mb-3 w-32" style={{ background: C.fondo, border: `2px solid ${C.borde}` }} />
        </>
      )}

      {esOpcionMultiple(modulo) && (
        <>
          <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Opciones (marca cuál es la correcta)</label>
          <div className="grid gap-2 mt-1 mb-3">
            {opciones.map((op, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`respuesta-${actividad?.id ?? "nueva"}`}
                  checked={op !== "" && respuesta === op}
                  onChange={() => setRespuesta(op)}
                />
                <input value={op} onChange={(e) => cambiarOpcion(i, e.target.value)} className="ls-body text-sm flex-1 px-3 py-2 rounded-xl outline-none" style={{ background: C.fondo, border: `2px solid ${C.borde}` }} />
              </div>
            ))}
          </div>
          <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Explicación (se muestra después de responder)</label>
          <textarea value={explicacion} onChange={(e) => setExplicacion(e.target.value)} rows={2} className="ls-body text-sm w-full px-3 py-2 rounded-xl outline-none mt-1 mb-3 resize-none" style={{ background: C.fondo, border: `2px solid ${C.borde}` }} />
        </>
      )}

      {modulo === "COMPRENSION" && (
        <>
          <label className="ls-body text-xs font-bold" style={{ color: C.gris }}>Nivel de lectura</label>
          <select value={nivel} onChange={(e) => setNivel(e.target.value)} className="ls-body text-sm px-3 py-2 rounded-full outline-none block mt-1 mb-3" style={{ background: C.fondo, border: `2px solid ${C.borde}` }}>
            {NIVELES.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </>
      )}

      {error && (
        <p className="ls-body text-xs font-semibold rounded-xl px-3 py-2 mb-3" style={{ background: C.coralSuave, color: "#C2453B" }}>{error}</p>
      )}

      <div className="flex gap-2">
        <button onClick={guardar} disabled={guardando} className="ls-btn ls-body text-xs font-bold px-5 py-2 rounded-full" style={{ background: guardando ? C.gris : C.verde, color: "#fff" }}>
          {guardando ? "Guardando…" : esNueva ? "Crear actividad" : "Guardar cambios"}
        </button>
        <button onClick={onCancelar} className="ls-btn ls-body text-xs font-semibold px-5 py-2 rounded-full" style={{ background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
