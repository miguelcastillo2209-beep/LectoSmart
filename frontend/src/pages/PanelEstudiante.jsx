import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../theme/colors";
import { Leo } from "../components/Leo";
import { AppHeader } from "../components/AppHeader";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import MaterialesEstudiante from "../components/MaterialesEstudiante";

// El orden de este objeto es el orden de las tarjetas y el de las
// peticiones que se hacen al cargar el panel.
const MODULOS_INFO = {
  PALABRAS: { titulo: "Reconocer palabras", icono: "🔤", color: C.azul, suave: C.azulSuave, ruta: "palabras" },
  ORTOGRAFIA: { titulo: "Escribir sin errores", icono: "✍️", color: C.coral, suave: C.coralSuave, ruta: "ortografia" },
  COMPRENSION: { titulo: "Comprensión lectora", icono: "📖", color: C.verde, suave: C.verdeSuave, ruta: "comprension" },
  FLUIDEZ: { titulo: "Fluidez lectora", icono: "⏱️", color: C.morado, suave: C.moradoSuave, ruta: "fluidez" },
};

// Siguiente actividad pendiente. Si ya están todas completadas, se
// devuelve la PRIMERA: el botón de la tarjeta dice "Repasar" y lo que se
// espera es rehacer la lección entera, no caer en la última pregunta.
function elegirSiguiente(lista) {
  return lista.find((a) => !a.completada) ?? lista[0];
}

export default function PanelEstudiante() {
  const { cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [siguientePorModulo, setSiguientePorModulo] = useState({});
  const [totalMateriales, setTotalMateriales] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const irAIngreso = () => navigate("/ingreso");
        const modulos = Object.keys(MODULOS_INFO);
        const [me, ...listas] = await Promise.all([
          apiFetch("/estudiantes/me", { onUnauthorized: irAIngreso }),
          ...modulos.map((modulo) =>
            apiFetch(`/modulos/${modulo}/actividades`, { onUnauthorized: irAIngreso })
          ),
        ]);
        if (!activo) return;
        setDatos(me);
        setSiguientePorModulo(
          Object.fromEntries(modulos.map((modulo, i) => [modulo, elegirSiguiente(listas[i])]))
        );
      } catch (err) {
        if (activo) setError(err.message || "No se pudo cargar tu progreso");
      } finally {
        if (activo) setCargando(false);
      }
    }
    cargar();
    return () => {
      activo = false;
    };
  }, [navigate]);

  const salir = () => {
    cerrarSesion();
    navigate("/");
  };

  if (cargando) {
    return (
      <div>
        <AppHeader right={null} />
        <p className="ls-body text-center mt-10" style={{ color: C.gris }}>Cargando tu progreso…</p>
      </div>
    );
  }

  if (error || !datos) {
    return (
      <div>
        <AppHeader right={null} />
        <div className="max-w-md mx-auto mt-10 rounded-2xl px-5 py-4 text-center" style={{ background: C.coralSuave, color: "#C2453B" }}>
          {error || "No se pudo cargar tu progreso"}
        </div>
      </div>
    );
  }

  const pctNivel = datos.metaNivel > 0 ? Math.round((datos.puntosEnNivel / datos.metaNivel) * 100) : 0;

  return (
    <div>
      <AppHeader
        right={
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => navigate("/ranking")}
              className="ls-btn ls-body text-xs sm:text-sm font-bold px-2.5 sm:px-4 py-2 rounded-full whitespace-nowrap"
              style={{ background: "#fff", color: C.tinta, border: `2px solid ${C.borde}` }}
            >
              🏆 Ranking
            </button>
            <div className="ls-body text-xs sm:text-sm font-bold px-2.5 sm:px-4 py-2 rounded-full flex items-center gap-1 sm:gap-1.5 whitespace-nowrap" style={{ background: C.resaltador, color: C.tinta }}>
              ⭐ {datos.puntos} pts
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ls-display font-bold shrink-0" style={{ background: C.morado, color: "#fff" }}>
              {datos.nombre?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <button onClick={salir} className="ls-btn ls-body text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-full whitespace-nowrap" style={{ background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }}>
              Salir
            </button>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center" style={{ background: C.tinta }}>
          <div>
            <h1 className="ls-display text-3xl font-extrabold text-white">¡Hola, {datos.nombre}! 👋</h1>
            <p className="ls-body text-sm mt-1" style={{ color: "#B9C6EA" }}>
              {datos.racha > 0 ? (
                <>Llevas <strong style={{ color: C.resaltador }}>{datos.racha} día{datos.racha === 1 ? "" : "s"} seguidos</strong> practicando. ¡No rompas la racha!</>
              ) : (
                "Aún no has practicado. ¡Empieza tu primer reto hoy!"
              )}
            </p>
            <div className="mt-5">
              <div className="flex justify-between ls-body text-xs font-semibold mb-1.5" style={{ color: "#B9C6EA" }}>
                <span>Nivel {datos.nivel}</span>
                <span>{datos.puntosEnNivel} / {datos.metaNivel} pts</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.15)" }}>
                <div className="h-full rounded-full" style={{ width: `${pctNivel}%`, background: `linear-gradient(90deg, ${C.verde}, ${C.resaltador})` }} />
              </div>
            </div>
          </div>
          <div className="hidden md:block"><Leo size={110} /></div>
        </div>

        <h2 className="ls-display text-2xl font-bold mt-10 mb-5" style={{ color: C.tinta }}>Tus actividades</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {datos.progresoPorModulo.filter((m) => MODULOS_INFO[m.modulo]).map((m) => {
            const info = MODULOS_INFO[m.modulo];
            const siguiente = siguientePorModulo[m.modulo];
            const estado = m.completadas === 0 ? "Aún sin empezar" : `${m.completadas} de ${m.total} completadas`;
            return (
              <button
                key={m.modulo}
                onClick={() => siguiente && navigate(`/${info.ruta}/${siguiente.id}`)}
                disabled={!siguiente}
                className="ls-card rounded-3xl p-6 text-left"
                style={{ background: "#fff", border: `2px solid ${info.color}` }}
              >
                <div className="flex items-center justify-between">
                  <div className="w-13 h-13 rounded-2xl flex items-center justify-center text-3xl p-2" style={{ background: info.suave }}>{info.icono}</div>
                  <span className="ls-body text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: info.color, color: "#fff" }}>
                    {m.completadas === m.total ? "Repasar →" : "Continuar →"}
                  </span>
                </div>
                <h3 className="ls-display text-xl font-bold mt-4" style={{ color: C.tinta }}>{info.titulo}</h3>
                <p className="ls-body text-xs mt-1" style={{ color: C.gris }}>{estado}</p>
                <div className="h-2.5 rounded-full mt-3 overflow-hidden" style={{ background: C.fondo }}>
                  <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: info.color }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Solo aparece si el docente publicó algún archivo para este curso. */}
        <h2
          className="ls-display text-2xl font-bold mt-10 mb-5"
          style={{ color: C.tinta, display: totalMateriales > 0 ? undefined : "none" }}
        >
          Material de refuerzo
        </h2>
        <MaterialesEstudiante
          onUnauthorized={() => navigate("/ingreso")}
          onCargados={setTotalMateriales}
        />

        <h2 className="ls-display text-2xl font-bold mt-10 mb-5" style={{ color: C.tinta }}>Tus logros</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {datos.logros.map((l) => (
            <div key={l.codigo} className="rounded-2xl p-4 text-center" style={{ background: "#fff", border: `2px solid ${C.borde}`, opacity: l.conseguido ? 1 : 0.45 }}>
              <div className="text-3xl">{l.icono}</div>
              <p className="ls-body text-xs font-semibold mt-2" style={{ color: C.tinta }}>{l.nombre}</p>
              <p className="ls-body text-[10px] mt-0.5" style={{ color: l.conseguido ? C.verde : C.gris }}>
                {l.conseguido ? "¡Conseguido!" : "Bloqueado"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
