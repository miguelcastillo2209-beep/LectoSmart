import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../theme/colors";
import { AppHeader } from "../components/AppHeader";
import { apiFetch } from "../api/client";

const MEDALLA = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function Ranking() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    apiFetch("/estudiantes/ranking", { onUnauthorized: () => navigate("/ingreso") })
      .then((d) => activo && setDatos(d))
      .catch((err) => activo && setError(err.message || "No se pudo cargar el ranking"));
    return () => {
      activo = false;
    };
  }, [navigate]);

  return (
    <div>
      <AppHeader
        right={
          <button
            onClick={() => navigate("/panel")}
            className="ls-btn ls-body text-sm font-semibold px-4 py-2 rounded-full"
            style={{ background: "#fff", color: C.tinta, border: `2px solid ${C.borde}` }}
          >
            ← Volver
          </button>
        }
      />
      <div className="max-w-2xl mx-auto px-6 pb-20">
        <h1 className="ls-display text-3xl font-extrabold" style={{ color: C.tinta }}>🏆 Tabla de posiciones</h1>
        <p className="ls-body text-sm mt-1" style={{ color: C.gris }}>
          {datos ? `Los mejores puntajes de ${datos.curso} — solo compites con tu propio curso.` : "Cargando…"}
        </p>

        {error && (
          <p className="ls-body text-sm font-semibold rounded-xl px-4 py-3 mt-4" style={{ background: C.coralSuave, color: "#C2453B" }}>
            {error}
          </p>
        )}

        {datos && (
          <div className="mt-6 rounded-3xl overflow-hidden" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
            {datos.top.length === 0 ? (
              <p className="ls-body text-sm px-6 py-6 text-center" style={{ color: C.gris }}>
                Todavía no hay puntajes en tu curso. ¡Sé el primero!
              </p>
            ) : (
              <ul>
                {datos.top.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between px-5 py-3.5"
                    style={{
                      borderTop: `1px solid ${C.borde}`,
                      background: e.esYo ? C.resaltador + "33" : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="ls-display text-lg font-bold w-8 text-center" style={{ color: C.gris }}>
                        {MEDALLA[e.posicion] || e.posicion}
                      </span>
                      <div>
                        <p className="ls-body text-sm font-bold" style={{ color: C.tinta }}>
                          {e.nombre}{e.esYo ? " (tú)" : ""}
                        </p>
                        <p className="ls-body text-xs" style={{ color: C.gris }}>Nivel {e.nivel}</p>
                      </div>
                    </div>
                    <span className="ls-display text-sm font-extrabold" style={{ color: C.azul }}>⭐ {e.puntos}</span>
                  </li>
                ))}
              </ul>
            )}

            {datos.yoFueraDelTop && datos.yo && (
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{ borderTop: `2px dashed ${C.borde}`, background: C.resaltador + "33" }}
              >
                <div className="flex items-center gap-3">
                  <span className="ls-display text-lg font-bold w-8 text-center" style={{ color: C.gris }}>{datos.yo.posicion}</span>
                  <div>
                    <p className="ls-body text-sm font-bold" style={{ color: C.tinta }}>{datos.yo.nombre} (tú)</p>
                    <p className="ls-body text-xs" style={{ color: C.gris }}>Nivel {datos.yo.nivel}</p>
                  </div>
                </div>
                <span className="ls-display text-sm font-extrabold" style={{ color: C.azul }}>⭐ {datos.yo.puntos}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
