import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { C } from "../theme/colors";
import { AppHeader } from "../components/AppHeader";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

const CURSOS = ["6°", "7°", "8°", "9°", "10°", "11°"];

const TABS = [
  { key: "estudiantes", label: "Estudiantes" },
  { key: "docentes", label: "Docentes" },
  { key: "administradores", label: "Administradores" },
];

const COLUMNAS = {
  estudiantes: ["Nombre", "Usuario", "Curso", "Puntos", "Creado"],
  docentes: ["Nombre", "Usuario", "Cursos", "Creado"],
  administradores: ["Nombre", "Usuario", "Creado"],
};

function formatFecha(iso) {
  return new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
}

function formularioVacio() {
  return { nombre: "", usuario: "", password: "", curso: CURSOS[0], cursos: [] };
}

export default function PanelAdmin() {
  const { perfil, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("estudiantes");
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState(null); // null = creando, si no = objeto que se edita
  const [form, setForm] = useState(formularioVacio());
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  const irAIngreso = () => navigate("/ingreso-admin");

  const cargar = () => {
    setCargando(true);
    setError(null);
    apiFetch(`/admin/${tab}`, { onUnauthorized: irAIngreso })
      .then(setItems)
      .catch((err) => setError(err.message || "No se pudo cargar la lista"))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargar();
    cerrarFormulario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const salir = () => {
    cerrarSesion();
    navigate("/");
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm(formularioVacio());
    setErrorForm(null);
    setFormAbierto(true);
  };

  const abrirEditar = (item) => {
    setEditando(item);
    setForm({
      nombre: item.nombre,
      usuario: item.usuario,
      password: "",
      curso: item.curso ?? CURSOS[0],
      cursos: item.cursos ?? [],
    });
    setErrorForm(null);
    setFormAbierto(true);
  };

  const alternarCurso = (c) => {
    setForm((f) => ({
      ...f,
      cursos: f.cursos.includes(c) ? f.cursos.filter((x) => x !== c) : [...f.cursos, c],
    }));
  };

  const cerrarFormulario = () => {
    setFormAbierto(false);
    setEditando(null);
    setForm(formularioVacio());
    setErrorForm(null);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorForm(null);
    try {
      const body = {
        nombre: form.nombre,
        usuario: form.usuario,
        ...(form.password && { password: form.password }),
        ...(tab === "estudiantes" && { curso: form.curso }),
        ...(tab === "docentes" && { cursos: form.cursos }),
      };

      if (editando) {
        await apiFetch(`/admin/${tab}/${editando.id}`, { method: "PUT", body, onUnauthorized: irAIngreso });
      } else {
        if (!form.password) {
          throw new Error("La contraseña es obligatoria para crear una cuenta");
        }
        await apiFetch(`/admin/${tab}`, { method: "POST", body, onUnauthorized: irAIngreso });
      }
      cerrarFormulario();
      cargar();
    } catch (err) {
      setErrorForm(err.message || "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (item) => {
    const confirmado = window.confirm(`¿Eliminar a "${item.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmado) return;
    try {
      await apiFetch(`/admin/${tab}/${item.id}`, { method: "DELETE", onUnauthorized: irAIngreso });
      cargar();
    } catch (err) {
      setError(err.message || "No se pudo eliminar");
    }
  };

  return (
    <div>
      <AppHeader
        right={
          <div className="flex items-center gap-2">
            <Link
              to="/docente"
              className="ls-btn ls-body text-xs font-semibold px-3 py-2 rounded-full"
              style={{ background: "#fff", color: C.tinta, border: `2px solid ${C.borde}` }}
            >
              Ver seguimiento
            </Link>
            <span className="ls-body text-sm font-semibold hidden md:block" style={{ color: C.gris }}>
              {perfil?.nombre}
            </span>
            <div className="w-10 h-10 rounded-full flex items-center justify-center ls-display font-bold" style={{ background: C.morado, color: "#fff" }}>
              {perfil?.nombre?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <button onClick={salir} className="ls-btn ls-body text-xs font-semibold px-3 py-2 rounded-full" style={{ background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }}>
              Salir
            </button>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <h1 className="ls-display text-3xl font-extrabold" style={{ color: C.tinta }}>Administrar usuarios</h1>
        <p className="ls-body text-sm mt-1" style={{ color: C.gris }}>
          Crea, edita y elimina cuentas de estudiantes, docentes y administradores.
        </p>

        <div className="flex rounded-full p-1 mt-6 max-w-md" style={{ background: C.azulSuave }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="ls-btn ls-body flex-1 text-sm font-semibold py-2 rounded-full"
              style={{
                background: tab === t.key ? "#fff" : "transparent",
                color: C.tinta,
                boxShadow: tab === t.key ? "0 2px 6px rgba(30,42,74,.10)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="ls-body text-sm font-semibold rounded-xl px-4 py-3 mt-4" style={{ background: C.coralSuave, color: "#C2453B" }}>
            {error}
          </p>
        )}

        {formAbierto && (
          <form onSubmit={guardar} className="rounded-3xl p-6 mt-6" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
            <h2 className="ls-display text-lg font-bold mb-4" style={{ color: C.tinta }}>
              {editando ? `Editar ${tab === "estudiantes" ? "estudiante" : tab === "docentes" ? "docente" : "administrador"}` : "Agregar nuevo"}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Nombre</span>
                <input
                  className="ls-body mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ border: `2px solid ${C.borde}`, background: C.fondo }}
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  required
                />
              </label>
              <label className="block">
                <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Usuario</span>
                <input
                  className="ls-body mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ border: `2px solid ${C.borde}`, background: C.fondo }}
                  value={form.usuario}
                  onChange={(e) => setForm((f) => ({ ...f, usuario: e.target.value }))}
                  required
                />
              </label>
              <label className="block">
                <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>
                  {editando ? "Nueva contraseña (opcional)" : "Contraseña"}
                </span>
                <input
                  type="password"
                  className="ls-body mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none"
                  placeholder={editando ? "Dejar en blanco para no cambiarla" : "••••••••"}
                  style={{ border: `2px solid ${C.borde}`, background: C.fondo }}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  minLength={4}
                />
              </label>
              {tab === "estudiantes" && (
                <label className="block">
                  <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Curso</span>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    {CURSOS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setForm((f) => ({ ...f, curso: c }))}
                        className="ls-btn ls-body text-center text-sm font-semibold py-2 rounded-xl"
                        style={{
                          background: form.curso === c ? C.azul : C.fondo,
                          color: form.curso === c ? "#fff" : C.tinta,
                          border: `2px solid ${form.curso === c ? C.azul : C.borde}`,
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </label>
              )}
              {tab === "docentes" && (
                <label className="block md:col-span-2">
                  <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>
                    Cursos a cargo (puede elegir varios)
                  </span>
                  <div className="grid grid-cols-3 gap-2 mt-1.5 max-w-sm">
                    {CURSOS.map((c) => {
                      const activo = form.cursos.includes(c);
                      return (
                        <button
                          type="button"
                          key={c}
                          onClick={() => alternarCurso(c)}
                          className="ls-btn ls-body text-center text-sm font-semibold py-2 rounded-xl"
                          style={{
                            background: activo ? C.azul : C.fondo,
                            color: activo ? "#fff" : C.tinta,
                            border: `2px solid ${activo ? C.azul : C.borde}`,
                          }}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </label>
              )}
            </div>

            {errorForm && (
              <p className="ls-body text-sm font-semibold rounded-xl px-4 py-3 mt-4" style={{ background: C.coralSuave, color: "#C2453B" }}>
                {errorForm}
              </p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                type="submit"
                disabled={guardando}
                className="ls-btn ls-display text-sm font-bold px-6 py-3 rounded-2xl disabled:opacity-60"
                style={{ background: C.azul, color: "#fff" }}
              >
                {guardando ? "Guardando…" : editando ? "Guardar cambios" : "Crear cuenta"}
              </button>
              <button
                type="button"
                onClick={cerrarFormulario}
                className="ls-btn ls-body text-sm font-semibold px-6 py-3 rounded-2xl"
                style={{ background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 rounded-3xl overflow-hidden" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `2px solid ${C.borde}` }}>
            <h2 className="ls-display text-lg font-bold" style={{ color: C.tinta }}>
              {TABS.find((t) => t.key === tab)?.label}
            </h2>
            {!formAbierto && (
              <button
                onClick={abrirCrear}
                className="ls-btn ls-body text-xs font-bold px-4 py-2 rounded-full"
                style={{ background: C.azul, color: "#fff" }}
              >
                + Agregar
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full ls-body text-sm">
              <thead>
                <tr style={{ color: C.gris }}>
                  {COLUMNAS[tab].map((h) => (
                    <th key={h} className="text-left font-semibold px-6 py-3 whitespace-nowrap" style={{ background: C.fondo }}>{h}</th>
                  ))}
                  <th className="text-left font-semibold px-6 py-3 whitespace-nowrap" style={{ background: C.fondo }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan={COLUMNAS[tab].length + 1} className="px-6 py-6 text-center" style={{ color: C.gris }}>
                      Cargando…
                    </td>
                  </tr>
                )}
                {!cargando && items.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNAS[tab].length + 1} className="px-6 py-6 text-center" style={{ color: C.gris }}>
                      No hay registros todavía.
                    </td>
                  </tr>
                )}
                {items.map((item) => (
                  <tr key={item.id} style={{ borderTop: `1px solid ${C.borde}` }}>
                    <td className="px-6 py-3.5 font-semibold whitespace-nowrap" style={{ color: C.tinta }}>{item.nombre}</td>
                    <td className="px-6 py-3.5" style={{ color: C.gris }}>{item.usuario}</td>
                    {tab === "estudiantes" && (
                      <>
                        <td className="px-6 py-3.5" style={{ color: C.gris }}>{item.curso}</td>
                        <td className="px-6 py-3.5 font-semibold" style={{ color: C.tinta }}>⭐ {item.puntos}</td>
                      </>
                    )}
                    {tab === "docentes" && (
                      <td className="px-6 py-3.5" style={{ color: item.cursos?.length ? C.tinta : C.gris }}>
                        {item.cursos?.length ? item.cursos.join(", ") : "Sin asignar"}
                      </td>
                    )}
                    <td className="px-6 py-3.5 whitespace-nowrap" style={{ color: C.gris }}>{formatFecha(item.createdAt)}</td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => abrirEditar(item)}
                        className="ls-btn ls-body text-xs font-semibold px-3 py-1.5 rounded-full mr-2"
                        style={{ background: C.azulSuave, color: C.azul }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminar(item)}
                        className="ls-btn ls-body text-xs font-semibold px-3 py-1.5 rounded-full"
                        style={{ background: C.coralSuave, color: C.coral }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
