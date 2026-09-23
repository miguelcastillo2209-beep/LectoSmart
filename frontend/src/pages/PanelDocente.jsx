import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { C } from "../theme/colors";
import { AppHeader } from "../components/AppHeader";
import { apiFetch, apiDescargar } from "../api/client";
import { useAuth } from "../context/AuthContext";
import DocumentosPanel from "../components/DocumentosPanel";
import AsistenteIA from "../components/AsistenteIA";
import PropuestasIA from "../components/PropuestasIA";
import GestionActividades from "../components/GestionActividades";

const CURSOS = ["6°", "7°", "8°", "9°", "10°", "11°"];

const SECCIONES = [
  { id: "seguimiento", etiqueta: "📊 Seguimiento" },
  { id: "documentos", etiqueta: "📎 Documentos" },
  { id: "asistente", etiqueta: "🦉 Asistente IA" },
  { id: "propuestas", etiqueta: "🧪 Actividades con IA" },
  { id: "gestion", etiqueta: "✏️ Editar actividades" },
];

const colorComp = (v) => (v >= 70 ? C.verde : v >= 50 ? "#E8A13C" : C.coral);

const NIVEL_INFO = {
  literal: { etiqueta: "Literal", descripcion: "entiende lo que el texto dice" },
  inferencial: { etiqueta: "Inferencial", descripcion: "deduce lo que el texto no dice directamente" },
  critico: { etiqueta: "Crítico", descripcion: "evalúa, compara y detecta falacias" },
};

// Focos del módulo Escribir sin errores (backend/src/lib/focosOrtografia.js).
const FOCO_INFO = {
  letras: { etiqueta: "Letras", descripcion: "b/v, s/c/z, g/j, h" },
  tildes: { etiqueta: "Tildes", descripcion: "dónde va la fuerza de voz" },
  gramatica: { etiqueta: "Gramática", descripcion: "concordancia y palabras que cambian con la frase" },
  puntuacion: { etiqueta: "Puntuación", descripcion: "coma, punto y signos" },
};

export default function PanelDocente() {
  const { perfil, rol, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [seccion, setSeccion] = useState("seguimiento");
  const [resumen, setResumen] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [curso, setCurso] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [passwordGenerada, setPasswordGenerada] = useState(null); // { nombre, password }
  const [reseteando, setReseteando] = useState(null); // id del estudiante en proceso
  const [recarga, setRecarga] = useState(0); // fuerza recargar la lista tras crear
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", usuario: "", curso: "", password: "" });
  const [creando, setCreando] = useState(false);
  const [credenciales, setCredenciales] = useState(null); // { nombre, usuario, password }

  const irAIngreso = () => navigate("/ingreso-docente");

  const restablecerPassword = async (estudiante) => {
    if (!window.confirm(`¿Generar una contraseña nueva para ${estudiante.nombre}? La contraseña anterior dejará de funcionar.`)) return;
    setReseteando(estudiante.id);
    setPasswordGenerada(null);
    try {
      const data = await apiFetch(`/docente/estudiantes/${estudiante.id}/restablecer-password`, {
        method: "POST",
        onUnauthorized: irAIngreso,
      });
      setPasswordGenerada({ nombre: estudiante.nombre, password: data.password });
    } catch (err) {
      setError(err.message || "No se pudo restablecer la contraseña");
    } finally {
      setReseteando(null);
    }
  };

  // Crea la cuenta de un estudiante. Si no se escribe contraseña, el
  // servidor genera una temporal; en ambos casos se muestra una sola vez
  // para que el docente se la entregue al estudiante.
  const crearEstudiante = async (e) => {
    e.preventDefault();
    setCreando(true);
    setError(null);
    setCredenciales(null);
    try {
      const data = await apiFetch("/docente/estudiantes", {
        method: "POST",
        body: {
          nombre: nuevo.nombre,
          usuario: nuevo.usuario,
          curso: nuevo.curso,
          ...(nuevo.password ? { password: nuevo.password } : {}),
        },
        onUnauthorized: irAIngreso,
      });
      setCredenciales({ nombre: data.nombre, usuario: data.usuario, password: data.password });
      setNuevo({ nombre: "", usuario: "", curso: "", password: "" });
      setMostrarNuevo(false);
      setRecarga((n) => n + 1);
    } catch (err) {
      setError(err.message || "No se pudo crear el estudiante");
    } finally {
      setCreando(false);
    }
  };

  useEffect(() => {
    let activo = true;
    apiFetch("/docente/resumen", { onUnauthorized: irAIngreso })
      .then((data) => activo && setResumen(data))
      .catch((err) => activo && setError(err.message));
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    const params = new URLSearchParams();
    if (busqueda.trim()) params.set("q", busqueda.trim());
    if (curso) params.set("curso", curso);
    const query = params.toString() ? `?${params.toString()}` : "";

    const timeout = setTimeout(() => {
      apiFetch(`/docente/estudiantes${query}`, { onUnauthorized: irAIngreso })
        .then((data) => activo && setEstudiantes(data))
        .catch((err) => activo && setError(err.message))
        .finally(() => activo && setCargando(false));
    }, 250);

    return () => {
      activo = false;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, curso, recarga]);

  const salir = () => {
    cerrarSesion();
    navigate("/");
  };

  const cursosDisponibles = rol === "administrador" ? CURSOS : (perfil?.cursos ?? []);
  const sinCursosAsignados = rol === "docente" && cursosDisponibles.length === 0;

  const tarjetas = resumen && [
    { valor: String(resumen.estudiantesActivos), etiqueta: "Estudiantes activos", color: C.azul },
    { valor: String(resumen.actividadesCompletadas), etiqueta: "Actividades completadas", color: C.verde },
    { valor: `${resumen.comprensionPromedio}%`, etiqueta: "Comprensión promedio", color: C.morado },
    { valor: String(resumen.necesitanRefuerzo), etiqueta: "Necesitan refuerzo", color: C.coral },
  ];

  return (
    <div>
      <AppHeader
        right={
          <div className="flex items-center gap-2">
            {rol === "administrador" && (
              <Link
                to="/admin"
                className="ls-btn ls-body text-xs font-semibold px-3 py-2 rounded-full"
                style={{ background: C.morado, color: "#fff" }}
              >
                Administrar usuarios
              </Link>
            )}
            <span className="ls-body text-sm font-semibold hidden md:block" style={{ color: C.gris }}>
              {rol === "administrador" ? perfil?.nombre : `Prof. ${perfil?.nombre}`}
            </span>
            <div className="w-10 h-10 rounded-full flex items-center justify-center ls-display font-bold" style={{ background: C.tinta, color: "#fff" }}>
              {perfil?.nombre?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <button onClick={salir} className="ls-btn ls-body text-xs font-semibold px-3 py-2 rounded-full" style={{ background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }}>
              Salir
            </button>
          </div>
        }
      />
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <h1 className="ls-display text-3xl font-extrabold" style={{ color: C.tinta }}>Panel del docente</h1>
        <p className="ls-body text-sm mt-1" style={{ color: C.gris }}>Seguimiento del grupo, documentos de apoyo y asistente pedagógico.</p>

        <div className="flex gap-2 mt-5 flex-wrap">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSeccion(s.id)}
              className="ls-btn ls-body text-sm font-bold px-5 py-2.5 rounded-full"
              style={
                seccion === s.id
                  ? { background: C.tinta, color: "#fff" }
                  : { background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }
              }
            >
              {s.etiqueta}
            </button>
          ))}
        </div>

        {seccion === "documentos" && (
          <DocumentosPanel
            onUnauthorized={irAIngreso}
            nombreUsuario={perfil?.nombre}
            cursosDisponibles={cursosDisponibles}
          />
        )}
        {seccion === "asistente" && <AsistenteIA onUnauthorized={irAIngreso} />}
        {seccion === "propuestas" && (
          <PropuestasIA onUnauthorized={irAIngreso} cursosDisponibles={cursosDisponibles} nombreDocente={perfil?.nombre} />
        )}
        {seccion === "gestion" && (
          <GestionActividades onUnauthorized={irAIngreso} cursosDisponibles={cursosDisponibles} />
        )}

        {seccion === "seguimiento" && (
        <>
        {error && (
          <p className="ls-body text-sm font-semibold rounded-xl px-4 py-3 mt-4" style={{ background: C.coralSuave, color: "#C2453B" }}>
            {error}
          </p>
        )}

        {sinCursosAsignados && !error && (
          <div className="rounded-3xl p-6 mt-6 text-center" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
            <p className="ls-display font-bold" style={{ color: C.tinta }}>Tu cuenta no tiene cursos asignados todavía</p>
            <p className="ls-body text-sm mt-1" style={{ color: C.gris }}>
              Pide a un administrador que te asigne uno o más cursos desde el panel de administración.
            </p>
          </div>
        )}

        {!sinCursosAsignados && tarjetas && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {tarjetas.map((k) => (
              <div key={k.etiqueta} className="rounded-2xl p-5" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
                <p className="ls-display text-3xl font-extrabold" style={{ color: k.color }}>{k.valor}</p>
                <p className="ls-body text-xs font-semibold mt-1" style={{ color: C.gris }}>{k.etiqueta}</p>
              </div>
            ))}
          </div>
        )}

        {!sinCursosAsignados && resumen?.desglosePorNivel && (
          <div className="mt-6 rounded-3xl p-6" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
            <h2 className="ls-display text-lg font-bold" style={{ color: C.tinta }}>Comprensión por habilidad</h2>
            <p className="ls-body text-xs mt-1" style={{ color: C.gris }}>
              Aciertos en Comprensión lectora según el tipo de pregunta, no solo el promedio general.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              {resumen.desglosePorNivel.map((d) => {
                const info = NIVEL_INFO[d.nivel];
                return (
                  <div key={d.nivel} className="rounded-2xl p-4" style={{ background: C.fondo }}>
                    <div className="flex items-center justify-between">
                      <p className="ls-display text-sm font-bold" style={{ color: C.tinta }}>{info.etiqueta}</p>
                      <p className="ls-display text-xl font-extrabold" style={{ color: d.pct === null ? C.gris : colorComp(d.pct) }}>
                        {d.pct === null ? "—" : `${d.pct}%`}
                      </p>
                    </div>
                    <p className="ls-body text-xs mt-0.5" style={{ color: C.gris }}>{info.descripcion}</p>
                    <p className="ls-body text-[11px] mt-1" style={{ color: C.gris }}>{d.total} pregunta{d.total === 1 ? "" : "s"} respondida{d.total === 1 ? "" : "s"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!sinCursosAsignados && resumen?.desglosePorFoco && (
          <div className="mt-6 rounded-3xl p-6" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
            <h2 className="ls-display text-lg font-bold" style={{ color: C.tinta }}>Ortografía por foco</h2>
            <p className="ls-body text-xs mt-1" style={{ color: C.gris }}>
              Aciertos en “Escribir sin errores” separados por lo que evalúa cada actividad, para
              saber si el problema es la letra, la tilde, la gramática o la puntuación.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {resumen.desglosePorFoco.map((d) => {
                const info = FOCO_INFO[d.foco];
                return (
                  <div key={d.foco} className="rounded-2xl p-4" style={{ background: C.fondo }}>
                    <div className="flex items-center justify-between">
                      <p className="ls-display text-sm font-bold" style={{ color: C.tinta }}>{info.etiqueta}</p>
                      <p className="ls-display text-xl font-extrabold" style={{ color: d.pct === null ? C.gris : colorComp(d.pct) }}>
                        {d.pct === null ? "—" : `${d.pct}%`}
                      </p>
                    </div>
                    <p className="ls-body text-xs mt-0.5" style={{ color: C.gris }}>{info.descripcion}</p>
                    <p className="ls-body text-[11px] mt-1" style={{ color: C.gris }}>
                      {d.total} pregunta{d.total === 1 ? "" : "s"} respondida{d.total === 1 ? "" : "s"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {passwordGenerada && (
          <div className="mt-6 rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ background: "#E7F6EC", border: `2px solid ${C.verde}` }}>
            <p className="ls-body text-sm font-semibold" style={{ color: "#2E7D46" }}>
              Nueva contraseña de <strong>{passwordGenerada.nombre}</strong>: <code className="ls-display text-base font-extrabold tracking-wide">{passwordGenerada.password}</code> — apúntala, no se volverá a mostrar.
            </p>
            <button onClick={() => setPasswordGenerada(null)} className="ls-btn ls-body text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: C.verde, color: "#fff" }}>
              Entendido
            </button>
          </div>
        )}

        {credenciales && (
          <div className="mt-6 rounded-2xl px-5 py-4" style={{ background: "#E7F6EC", border: `2px solid ${C.verde}` }}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <p className="ls-display text-sm font-bold mb-1" style={{ color: "#2E7D46" }}>
                  Cuenta creada para {credenciales.nombre}
                </p>
                <p className="ls-body text-sm" style={{ color: "#2E7D46" }}>
                  Usuario: <code className="ls-display text-base font-extrabold tracking-wide">{credenciales.usuario}</code>
                  {" · "}
                  Contraseña: <code className="ls-display text-base font-extrabold tracking-wide">{credenciales.password}</code>
                </p>
                <p className="ls-body text-xs mt-1.5" style={{ color: "#2E7D46" }}>
                  Anótala y entrégasela al estudiante: no se volverá a mostrar.
                </p>
              </div>
              <button onClick={() => setCredenciales(null)} className="ls-btn ls-body text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: C.verde, color: "#fff" }}>
                Entendido
              </button>
            </div>
          </div>
        )}

        {!sinCursosAsignados && mostrarNuevo && (
          <form onSubmit={crearEstudiante} className="mt-6 rounded-3xl p-6" style={{ background: "#fff", border: `2px solid ${C.azul}` }}>
            <h3 className="ls-display text-base font-bold mb-4" style={{ color: C.tinta }}>Nuevo estudiante</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Nombre completo</span>
                <input
                  className="ls-body mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  placeholder="Ej: Sofía Rodríguez"
                  style={{ border: `2px solid ${C.borde}`, background: C.fondo }}
                  value={nuevo.nombre}
                  onChange={(ev) => setNuevo({ ...nuevo, nombre: ev.target.value })}
                  required
                />
              </label>
              <label className="block">
                <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Usuario</span>
                <input
                  className="ls-body mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  placeholder="sofia.rodriguez"
                  style={{ border: `2px solid ${C.borde}`, background: C.fondo }}
                  value={nuevo.usuario}
                  onChange={(ev) => setNuevo({ ...nuevo, usuario: ev.target.value })}
                  required
                />
              </label>
              <label className="block">
                <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Curso</span>
                <select
                  className="ls-body mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  style={{ border: `2px solid ${C.borde}`, background: C.fondo, color: C.tinta }}
                  value={nuevo.curso}
                  onChange={(ev) => setNuevo({ ...nuevo, curso: ev.target.value })}
                  required
                >
                  <option value="">Selecciona el curso…</option>
                  {cursosDisponibles.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Contraseña <span style={{ color: C.gris, fontWeight: 400 }}>(opcional)</span></span>
                <input
                  className="ls-body mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                  placeholder="Si la dejas vacía se genera sola"
                  style={{ border: `2px solid ${C.borde}`, background: C.fondo }}
                  value={nuevo.password}
                  onChange={(ev) => setNuevo({ ...nuevo, password: ev.target.value })}
                  minLength={4}
                />
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                type="submit"
                disabled={creando}
                className="ls-btn ls-display text-sm font-bold px-5 py-2.5 rounded-full disabled:opacity-60"
                style={{ background: C.azul, color: "#fff" }}
              >
                {creando ? "Creando…" : "Crear cuenta"}
              </button>
              <button
                type="button"
                onClick={() => { setMostrarNuevo(false); setError(null); }}
                className="ls-btn ls-body text-sm font-semibold px-5 py-2.5 rounded-full"
                style={{ background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {!sinCursosAsignados && (
        <div className="mt-8 rounded-3xl overflow-hidden" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: `2px solid ${C.borde}` }}>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="ls-display text-lg font-bold" style={{ color: C.tinta }}>Estudiantes</h2>
              <button
                onClick={() => { setMostrarNuevo((v) => !v); setCredenciales(null); }}
                className="ls-btn ls-body text-xs font-bold px-3.5 py-2 rounded-full"
                style={{ background: C.azul, color: "#fff" }}
              >
                + Nuevo estudiante
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={curso}
                onChange={(e) => setCurso(e.target.value)}
                className="ls-body text-sm px-3 py-2 rounded-full outline-none"
                style={{ background: C.fondo, border: `2px solid ${C.borde}`, color: C.tinta }}
              >
                <option value="">{rol === "administrador" ? "Todos los cursos" : "Todos mis cursos"}</option>
                {cursosDisponibles.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input
                className="ls-body text-sm px-4 py-2 rounded-full outline-none w-56"
                placeholder="Buscar estudiante…"
                style={{ background: C.fondo, border: `2px solid ${C.borde}` }}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <button
                onClick={() => apiDescargar(`/docente/reporte.csv${curso ? `?curso=${encodeURIComponent(curso)}` : ""}`, `reporte-lectosmart-${curso || "todos"}.csv`)}
                className="ls-btn ls-body text-xs font-semibold px-3.5 py-2 rounded-full"
                style={{ background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }}
              >
                ⬇️ CSV
              </button>
              <button
                onClick={() => apiDescargar(`/docente/reporte.pdf${curso ? `?curso=${encodeURIComponent(curso)}` : ""}`, `reporte-lectosmart-${curso || "todos"}.pdf`)}
                className="ls-btn ls-body text-xs font-semibold px-3.5 py-2 rounded-full"
                style={{ background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }}
              >
                ⬇️ PDF
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full ls-body text-sm">
              <thead>
                <tr style={{ color: C.gris }}>
                  {["Estudiante", "Curso", "Nivel", "Puntos", "Actividades", "Comprensión", ""].map((h) => (
                    <th key={h} className="text-left font-semibold px-6 py-3 whitespace-nowrap" style={{ background: C.fondo }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!cargando && estudiantes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-6 text-center" style={{ color: C.gris }}>
                      No hay estudiantes que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
                {estudiantes.map((e) => (
                  <tr key={e.id} style={{ borderTop: `1px solid ${C.borde}` }}>
                    <td className="px-6 py-3.5 font-semibold whitespace-nowrap" style={{ color: C.tinta }}>{e.nombre}</td>
                    <td className="px-6 py-3.5" style={{ color: C.gris }}>{e.curso}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold px-2.5 py-1 rounded-full text-xs" style={{ background: C.azulSuave, color: C.azul }}>Nv {e.nivel}</span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold" style={{ color: C.tinta }}>⭐ {e.puntos}</td>
                    <td className="px-6 py-3.5" style={{ color: C.gris }}>{e.actividades}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2.5 rounded-full overflow-hidden" style={{ background: C.fondo }}>
                          <div className="h-full rounded-full" style={{ width: `${e.comprension}%`, background: colorComp(e.comprension) }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: colorComp(e.comprension) }}>{e.comprension}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => restablecerPassword(e)}
                        disabled={reseteando === e.id}
                        className="ls-btn text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{ background: C.azulSuave, color: C.azul }}
                      >
                        {reseteando === e.id ? "…" : "🔑 Reset"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
