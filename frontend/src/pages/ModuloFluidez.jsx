import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { C } from "../theme/colors";
import { AppHeader } from "../components/AppHeader";
import { BarraProgresoActividad } from "../components/BarraProgresoActividad";
import { apiFetch } from "../api/client";

// "antes" -> "leyendo" -> "resultado"
export default function ModuloFluidez() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actividad, setActividad] = useState(null);
  const [lista, setLista] = useState([]);
  const [estado, setEstado] = useState("antes");
  const [segundos, setSegundos] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [vidas, setVidas] = useState(3);
  const [error, setError] = useState(null);

  const inicioRef = useRef(null);
  const intervaloRef = useRef(null);

  const irAIngreso = useCallback(() => navigate("/ingreso"), [navigate]);

  useEffect(() => {
    let activo = true;
    setEstado("antes");
    setResultado(null);
    setSegundos(0);
    setVidas(3);
    setError(null);

    async function cargar() {
      try {
        const [detalle, actividades] = await Promise.all([
          apiFetch(`/actividades/${id}`, { onUnauthorized: irAIngreso }),
          apiFetch("/modulos/FLUIDEZ/actividades", { onUnauthorized: irAIngreso }),
        ]);
        if (!activo) return;
        setActividad(detalle);
        setLista(actividades);
      } catch (err) {
        if (activo) setError(err.message || "No se pudo cargar la actividad");
      }
    }
    cargar();
    return () => {
      activo = false;
      clearInterval(intervaloRef.current);
    };
  }, [id, irAIngreso]);

  const empezar = () => {
    inicioRef.current = Date.now();
    setSegundos(0);
    setEstado("leyendo");
    intervaloRef.current = setInterval(() => {
      setSegundos(Math.round((Date.now() - inicioRef.current) / 1000));
    }, 250);
  };

  const terminar = async () => {
    clearInterval(intervaloRef.current);
    const tiempoSegundos = Math.max(1, Math.round((Date.now() - inicioRef.current) / 1000));
    setEstado("resultado");
    try {
      const data = await apiFetch(`/actividades/${id}/intentos`, {
        method: "POST",
        body: { tiempoSegundos },
        onUnauthorized: irAIngreso,
      });
      if (!data.correcto) setVidas((v) => Math.max(0, v - 1));
      const metadata = JSON.parse(data.metadata ?? "null");
      setResultado({ ...data, tiempoSegundos, ppm: metadata?.ppm });
    } catch (err) {
      setError(err.message || "No se pudo registrar tu lectura");
    }
  };

  const reintentar = () => {
    setResultado(null);
    setEstado("antes");
  };

  const continuar = () => {
    const siguiente = lista.find((a) => a.orden > actividad.orden);
    if (siguiente) navigate(`/fluidez/${siguiente.id}`);
    else navigate("/panel");
  };

  if (error) {
    return (
      <div>
        <AppHeader right={null} />
        <div className="max-w-md mx-auto mt-10 rounded-2xl px-5 py-4 text-center" style={{ background: C.coralSuave, color: "#C2453B" }}>
          {error}
        </div>
      </div>
    );
  }

  if (!actividad) {
    return (
      <div>
        <AppHeader right={null} />
        <p className="ls-body text-center mt-10" style={{ color: C.gris }}>Cargando actividad…</p>
      </div>
    );
  }

  const { texto, ppmObjetivo } = actividad.contenido;

  return (
    <div>
      <AppHeader
        right={
          <button onClick={() => navigate("/panel")} className="ls-btn ls-body text-sm font-semibold px-4 py-2 rounded-full"
            style={{ background: "#fff", color: C.tinta, border: `2px solid ${C.borde}` }}>
            ← Salir
          </button>
        }
      />
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <BarraProgresoActividad posicion={actividad.orden} total={lista.length || 1} vidas={vidas} />

        <div className="rounded-3xl p-6 md:p-8" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="ls-body text-xs font-bold uppercase tracking-widest" style={{ color: C.morado }}>Lectura cronometrada</span>
            {estado === "leyendo" && (
              <span className="ls-display text-lg font-bold px-3 py-1 rounded-full" style={{ background: C.moradoSuave, color: C.morado }}>
                ⏱️ {segundos}s
              </span>
            )}
          </div>
          <h1 className="ls-display text-2xl font-extrabold mt-2" style={{ color: C.tinta }}>{actividad.titulo}</h1>
          <p className="ls-body mt-4 leading-loose" style={{ color: C.tinta, fontSize: 17 }}>{texto}</p>
        </div>

        <div className="mt-6">
          {estado === "antes" && (
            <button
              onClick={empezar}
              className="ls-btn ls-display w-full text-lg font-bold py-3.5 rounded-2xl"
              style={{ background: C.morado, color: "#fff", boxShadow: "0 5px 0 #6D3FD1" }}
            >
              Estoy listo, ¡a leer! →
            </button>
          )}

          {estado === "leyendo" && (
            <button
              onClick={terminar}
              className="ls-btn ls-display w-full text-lg font-bold py-3.5 rounded-2xl"
              style={{ background: C.verde, color: "#fff", boxShadow: "0 5px 0 #1F9B72" }}
            >
              Terminé de leer ✅
            </button>
          )}

          {estado === "resultado" && resultado && (
            <div
              className="rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3"
              style={{ background: resultado.correcto ? C.verdeSuave : C.coralSuave, border: `2px solid ${resultado.correcto ? C.verde : C.coral}` }}
            >
              <div>
                <p className="ls-display font-bold" style={{ color: resultado.correcto ? "#1B7A5B" : "#C2453B" }}>
                  {resultado.correcto ? `¡Muy bien! +${resultado.puntosGanados} puntos ⭐` : "Casi… vuelve a intentarlo 💪"}
                </p>
                <p className="ls-body text-sm mt-1" style={{ color: resultado.correcto ? "#1B7A5B" : "#C2453B" }}>
                  Leíste a {resultado.ppm ?? "—"} palabras por minuto (meta: {ppmObjetivo} ppm) en {resultado.tiempoSegundos}s.
                </p>
              </div>
              <button
                onClick={resultado.correcto ? continuar : reintentar}
                className="ls-btn ls-body text-sm font-bold px-5 py-2.5 rounded-full"
                style={{ background: resultado.correcto ? C.verde : C.coral, color: "#fff" }}
              >
                {resultado.correcto ? "Siguiente →" : "Intentar de nuevo"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
