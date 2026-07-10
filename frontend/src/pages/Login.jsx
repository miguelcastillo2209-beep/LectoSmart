import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../theme/colors";
import { Leo } from "../components/Leo";
import { AppHeader } from "../components/AppHeader";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";

const CURSOS = ["3°", "5°", "7°", "9°"];

export default function Login() {
  const [modo, setModo] = useState("entrar");
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [curso, setCurso] = useState(CURSOS[0]);
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const cambiarModo = (m) => {
    setModo(m);
    setError(null);
  };

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const path = modo === "entrar" ? "/auth/estudiantes/login" : "/auth/estudiantes/registro";
      const body =
        modo === "entrar"
          ? { usuario, password }
          : { nombre, usuario, password, curso };

      const data = await apiFetch(path, { method: "POST", body });
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
          {modo === "entrar" ? "¡Hola de nuevo!" : "Crea tu cuenta"}
        </h1>
        <p className="ls-body text-center text-sm mt-2 mb-6" style={{ color: C.gris }}>
          {modo === "entrar" ? "Ingresa para continuar tu aventura lectora." : "Solo necesitas tu nombre y tu curso."}
        </p>

        <div className="flex rounded-full p-1 mb-6" style={{ background: C.azulSuave }}>
          {["entrar", "registro"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => cambiarModo(m)}
              className="ls-btn ls-body flex-1 text-sm font-semibold py-2 rounded-full"
              style={{ background: modo === m ? "#fff" : "transparent", color: C.tinta, boxShadow: modo === m ? "0 2px 6px rgba(30,42,74,.10)" : "none" }}
            >
              {m === "entrar" ? "Ya tengo cuenta" : "Soy nuevo"}
            </button>
          ))}
        </div>

        <form onSubmit={enviar} className="rounded-3xl p-6" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
          {modo === "registro" && (
            <label className="block mb-4">
              <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Tu nombre</span>
              <input
                className="ls-body mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none"
                placeholder="Ej: Sofía Rodríguez"
                style={{ border: `2px solid ${C.borde}`, background: C.fondo }}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </label>
          )}
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
              minLength={4}
              required
            />
          </label>
          {modo === "registro" && (
            <label className="block mb-4">
              <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Tu curso</span>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {CURSOS.map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => setCurso(g)}
                    className="ls-btn ls-body text-center text-sm font-semibold py-2.5 rounded-xl"
                    style={{
                      background: curso === g ? C.azul : C.fondo,
                      color: curso === g ? "#fff" : C.tinta,
                      border: `2px solid ${curso === g ? C.azul : C.borde}`,
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </label>
          )}

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
            {cargando ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}
