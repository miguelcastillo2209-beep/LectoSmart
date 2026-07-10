import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { C } from "../theme/colors";
import { AppHeader } from "../components/AppHeader";
import { BarraProgresoActividad } from "../components/BarraProgresoActividad";
import { PreguntaOpciones } from "../components/PreguntaOpciones";
import { apiFetch } from "../api/client";

export default function ModuloComprension() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actividad, setActividad] = useState(null);
  const [lista, setLista] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [vidas, setVidas] = useState(3);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  const irAIngreso = useCallback(() => navigate("/ingreso"), [navigate]);

  useEffect(() => {
    let activo = true;
    setResultado(null);
    setVidas(3);
    setError(null);

    async function cargar() {
      try {
        const [detalle, actividades] = await Promise.all([
          apiFetch(`/actividades/${id}`, { onUnauthorized: irAIngreso }),
          apiFetch("/modulos/COMPRENSION/actividades", { onUnauthorized: irAIngreso }),
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
      if (!data.correcto) setVidas((v) => Math.max(0, v - 1));
      setResultado({
        seleccionada: valor,
        correcto: data.correcto,
        puntosGanados: data.puntosGanados,
        respuestaCorrecta: data.respuestaCorrecta,
      });
    } catch (err) {
      setError(err.message || "No se pudo enviar tu respuesta");
    } finally {
      setEnviando(false);
    }
  };

  const continuar = () => {
    if (!resultado?.correcto) {
      setResultado(null);
      return;
    }
    const siguiente = lista.find((a) => a.orden > actividad.orden);
    if (siguiente) {
      navigate(`/comprension/${siguiente.id}`);
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

  const opciones = actividad.contenido.opciones.map((op, i) => ({ valor: i, etiqueta: op }));

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
          <span className="ls-body text-xs font-bold uppercase tracking-widest" style={{ color: C.verde }}>Lee con atención</span>
          <h1 className="ls-display text-2xl font-extrabold mt-2" style={{ color: C.tinta }}>{actividad.titulo}</h1>
          <p className="ls-body mt-4 leading-loose" style={{ color: C.tinta, fontSize: 17 }}>
            {actividad.contenido.texto}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="ls-display text-xl font-bold mb-4" style={{ color: C.tinta }}>
            {actividad.contenido.pregunta}
          </h2>
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
