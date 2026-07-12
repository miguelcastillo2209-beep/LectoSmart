import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { C } from "../theme/colors";
import { AppHeader } from "../components/AppHeader";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

const CURSOS = ["6°", "7°", "8°", "9°", "10°", "11°"];

const colorComp = (v) => (v >= 70 ? C.verde : v >= 50 ? "#E8A13C" : C.coral);

export default function PanelDocente() {
  const { perfil, rol, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [resumen, setResumen] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [curso, setCurso] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const irAIngreso = () => navigate("/ingreso-docente");

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
  }, [busqueda, curso]);

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
        <h1 className="ls-display text-3xl font-extrabold" style={{ color: C.tinta }}>Seguimiento de estudiantes</h1>
        <p className="ls-body text-sm mt-1" style={{ color: C.gris }}>Progreso general del grupo en las actividades de lectura.</p>

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

        {!sinCursosAsignados && (
        <div className="mt-8 rounded-3xl overflow-hidden" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: `2px solid ${C.borde}` }}>
            <h2 className="ls-display text-lg font-bold" style={{ color: C.tinta }}>Estudiantes</h2>
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
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full ls-body text-sm">
              <thead>
                <tr style={{ color: C.gris }}>
                  {["Estudiante", "Curso", "Nivel", "Puntos", "Actividades", "Comprensión"].map((h) => (
                    <th key={h} className="text-left font-semibold px-6 py-3 whitespace-nowrap" style={{ background: C.fondo }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!cargando && estudiantes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-center" style={{ color: C.gris }}>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
