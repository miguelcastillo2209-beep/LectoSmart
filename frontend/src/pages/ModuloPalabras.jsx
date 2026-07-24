import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { C } from "../theme/colors";
import { AppHeader } from "../components/AppHeader";
import { BarraProgresoActividad } from "../components/BarraProgresoActividad";
import { PreguntaOpciones } from "../components/PreguntaOpciones";
import { SinCorazones } from "../components/SinCorazones";
import { RepasoPregunta } from "../components/RepasoPregunta";
import { apiFetch } from "../api/client";

const CORAZONES_INICIALES = 2;

export default function ModuloPalabras() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actividad, setActividad] = useState(null);
  const [lista, setLista] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [vidas, setVidas] = useState(CORAZONES_INICIALES);
  const [sinCorazones, setSinCorazones] = useState(false);
  const [enRepaso, setEnRepaso] = useState(false);
  const [falladas, setFalladas] = useState([]); // ids de actividades falladas en esta lección
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
          apiFetch("/modulos/PALABRAS/actividades", { onUnauthorized: irAIngreso }),
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

  // Al recuperar un corazón repasando, se sigue la lección desde la
  // actividad que estaba en pantalla cuando se acabaron los corazones.
  const corazonRecuperado = () => {
    setVidas(1);
    setSinCorazones(false);
    setEnRepaso(false);
    const siguiente = lista.find((a) => a.orden > actividad.orden);
    if (siguiente) navigate(`/palabras/${siguiente.id}`);
    else navigate("/panel");
  };

  // Sin reintentos: cada pregunta se responde una sola vez (acierte o
  // falle) y siempre se avanza a la siguiente, salvo que se acaben los
  // corazones de la lección.
  const continuar = () => {
    if (vidas <= 0) {
      setSinCorazones(true);
      return;
    }
    const siguiente = lista.find((a) => a.orden > actividad.orden);
    if (siguiente) {
      navigate(`/palabras/${siguiente.id}`);
    } else {
      navigate("/panel");
    }
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
          <span className="ls-body text-xs font-bold uppercase tracking-widest" style={{ color: C.azul }}>Reconocer palabras</span>
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
