import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { C } from "../theme/colors";
import { AppHeader } from "../components/AppHeader";
import { BarraProgresoActividad } from "../components/BarraProgresoActividad";
import { PreguntaOpciones } from "../components/PreguntaOpciones";
import { SinCorazones } from "../components/SinCorazones";
import { RepasoPregunta } from "../components/RepasoPregunta";
import { LeccionCompletada } from "../components/LeccionCompletada";
import { apiFetch } from "../api/client";

const CORAZONES_INICIALES = 2;

// Qué está practicando la actividad (backend/src/lib/focosOrtografia.js).
// Al estudiante se le muestra en corto, para que sepa dónde poner la
// atención antes de responder.
const ETIQUETA_FOCO = {
  letras: "La letra que va",
  tildes: "La tilde",
  gramatica: "Cómo se arma la frase",
  puntuacion: "La puntuación",
};

// Misma mecánica que Reconocer palabras (opción múltiple, sin reintento,
// 2 corazones por lección); cambia el módulo que se consulta y el rótulo.
export default function ModuloOrtografia() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actividad, setActividad] = useState(null);
  const [lista, setLista] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [vidas, setVidas] = useState(CORAZONES_INICIALES);
  const [sinCorazones, setSinCorazones] = useState(false);
  const [enRepaso, setEnRepaso] = useState(false);
  const [falladas, setFalladas] = useState([]); // ids de actividades falladas en esta lección
  // Resultado de ESTA pasada por la lección (se reinicia al repetirla).
  const [aciertos, setAciertos] = useState(0);
  const [puntosRonda, setPuntosRonda] = useState(0);
  const [completada, setCompletada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const irAIngreso = useCallback(() => navigate("/ingreso"), [navigate]);

  useEffect(() => {
    let activo = true;
    setResultado(null);
    // Los corazones NO se reinician al pasar de pregunta: se comparten
    // durante toda la lección (se restablecen solo si el componente se
    // vuelve a montar, es decir, si el estudiante sale y reingresa).
    setError(null);

    async function cargar() {
      try {
        const [detalle, actividades] = await Promise.all([
          apiFetch(`/actividades/${id}`, { onUnauthorized: irAIngreso }),
          apiFetch("/modulos/ORTOGRAFIA/actividades", { onUnauthorized: irAIngreso }),
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
    };
  }, [id, irAIngreso]);

  const elegir = async (valor) => {
    setEnviando(true);
    try {
      const data = await apiFetch(`/actividades/${id}/intentos`, {
        method: "POST",
        body: { respuesta: valor },
        onUnauthorized: irAIngreso,
      });
      if (!data.correcto) {
        setVidas((v) => Math.max(0, v - 1));
        setFalladas((f) => [...f, id]);
      } else {
        setAciertos((a) => a + 1);
        setPuntosRonda((p) => p + data.puntosGanados);
      }
      setResultado({
        seleccionada: valor,
        correcto: data.correcto,
        puntosGanados: data.puntosGanados,
        respuestaCorrecta: data.respuestaCorrecta,
        explicacion: data.explicacion,
      });
    } catch (err) {
      setError(err.message || "No se pudo enviar tu respuesta");
    } finally {
      setEnviando(false);
    }
  };

  const corazonRecuperado = () => {
    setVidas(1);
    setSinCorazones(false);
    setEnRepaso(false);
    // Sacar de la cola la que se acaba de repasar: si vuelve a quedarse
    // sin corazones, el repaso será de OTRA pregunta fallada, no de la
    // misma.
    setFalladas((f) => f.slice(1));
    const siguiente = lista.find((a) => a.orden > actividad.orden);
    if (siguiente) navigate(`/ortografia/${siguiente.id}`);
    else setCompletada(true);
  };

  const continuar = () => {
    if (vidas <= 0) {
      setSinCorazones(true);
      return;
    }
    const siguiente = lista.find((a) => a.orden > actividad.orden);
    if (siguiente) {
      navigate(`/ortografia/${siguiente.id}`);
    } else {
      setCompletada(true);
    }
  };

  // Repetir desde la primera actividad. El componente no se desmonta al
  // cambiar de :id (solo cambia el parámetro), así que hay que reiniciar
  // a mano el marcador de la ronda.
  const repetir = () => {
    setCompletada(false);
    setVidas(CORAZONES_INICIALES);
    setFalladas([]);
    setAciertos(0);
    setPuntosRonda(0);
    setResultado(null);
    if (lista.length > 0) navigate(`/ortografia/${lista[0].id}`);
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

  if (completada) {
    return (
      <LeccionCompletada
        modulo="Escribir sin errores"
        aciertos={aciertos}
        total={lista.length}
        puntos={puntosRonda}
        onRepetir={repetir}
        onVolver={() => navigate("/panel")}
      />
    );
  }

  if (sinCorazones) {
    if (enRepaso) {
      return (
        <div>
          <AppHeader right={null} />
          <div className="max-w-3xl mx-auto px-6 pb-20 pt-6">
            <RepasoPregunta
              actividadId={falladas[0]}
              onUnauthorized={irAIngreso}
              onRecuperado={corazonRecuperado}
              onCancelar={() => navigate("/panel")}
            />
          </div>
        </div>
      );
    }
    return (
      <SinCorazones
        onVolver={() => navigate("/panel")}
        onRepasar={falladas.length > 0 ? () => setEnRepaso(true) : undefined}
      />
    );
  }

  const opciones = actividad.contenido.opciones.map((op) => ({ valor: op, etiqueta: op }));
  const foco = ETIQUETA_FOCO[actividad.contenido.foco];

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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="ls-body text-xs font-bold uppercase tracking-widest" style={{ color: C.coral }}>Escribir sin errores</span>
            {foco && (
              <span className="ls-body text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: C.coralSuave, color: "#C2453B" }}>
                {foco}
              </span>
            )}
          </div>
          <h1 className="ls-display text-2xl font-extrabold mt-2" style={{ color: C.tinta }}>{actividad.contenido.instruccion}</h1>
        </div>

        <div className="mt-6">
          <PreguntaOpciones
            opciones={opciones}
            resultado={resultado}
            onElegir={elegir}
            deshabilitado={enviando}
            onContinuar={continuar}
          />
        </div>
      </div>
    </div>
  );
}
