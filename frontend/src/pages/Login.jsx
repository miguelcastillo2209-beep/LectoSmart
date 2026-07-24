import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { C } from "../theme/colors";
import { Leo } from "../components/Leo";
import { AppHeader } from "../components/AppHeader";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

// No hay registro público: las cuentas de estudiante las crea el docente
// desde su panel (o un administrador). Esta pantalla solo inicia sesión.
export default function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const data = await apiFetch("/auth/estudiantes/login", {
        method: "POST",
        body: { usuario, password },
      });
      iniciarSesion({ token: data.token, rol: "estudiante", perfil: data.estudiante });
      navigate("/panel");
    } catch (err) {
      setError(err.message || "Ocurrió un error, intenta de nuevo");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <AppHeader right={null} />
      <div className="max-w-md mx-auto px-6 pt-6 pb-20">
        <div className="flex justify-center mb-4"><Leo size={90} /></div>
        <h1 className="ls-display text-3xl font-extrabold text-center" style={{ color: C.tinta }}>
          ¡Hola de nuevo!
        </h1>
        <p className="ls-body text-center text-sm mt-2 mb-6" style={{ color: C.gris }}>
          Ingresa para continuar tu aventura lectora.
        </p>

        <form onSubmit={enviar} className="rounded-3xl p-6" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
          <label className="block mb-4">
            <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Usuario</span>
            <input
              className="ls-body mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none"
              placeholder="tu_usuario"
              style={{ border: `2px solid ${C.borde}`, background: C.fondo }}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
            />
          </label>
          <label className="block mb-4">
            <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Contraseña</span>
            <input
              type="password"
              className="ls-body mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none"
              placeholder="••••••••"
              style={{ border: `2px solid ${C.borde}`, background: C.fondo }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && (
            <p className="ls-body text-sm font-semibold rounded-xl px-4 py-3 mb-4" style={{ background: C.coralSuave, color: "#C2453B" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="ls-btn ls-display w-full text-lg font-bold py-3.5 rounded-2xl mt-2 disabled:opacity-60"
            style={{ background: C.azul, color: "#fff", boxShadow: "0 5px 0 #3D57D6" }}
          >
            {cargando ? "Un momento…" : "Entrar"}
          </button>
        </form>

        <div className="rounded-2xl px-5 py-4 mt-6" style={{ background: C.azulSuave }}>
          <p className="ls-body text-sm" style={{ color: C.tinta }}>
            <strong>¿Todavía no tienes cuenta?</strong> Pídesela a tu profesor o
            profesora: ellos crean las cuentas y te entregan tu usuario y tu
            contraseña. Si olvidaste tu contraseña, también pueden darte una nueva.
          </p>
        </div>

        <p className="ls-body text-center text-sm mt-6" style={{ color: C.gris }}>
          ¿Eres docente? <Link to="/ingreso-docente" style={{ color: C.azul, fontWeight: 600 }}>Ingresa aquí</Link>
        </p>
        <p className="ls-body text-center text-sm mt-2" style={{ color: C.gris }}>
          ¿Eres administrador? <Link to="/ingreso-admin" style={{ color: C.azul, fontWeight: 600 }}>Ingresa aquí</Link>
        </p>
      </div>
    </div>
  );
}
