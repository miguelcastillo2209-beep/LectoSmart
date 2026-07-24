import { useEffect, useState } from "react";
import { C } from "../theme/colors";
import { apiFetch } from "../api/client";

// Pregunta de repaso que se ofrece cuando el estudiante se queda sin
// corazones: a diferencia del flujo normal de la lección (una sola
// respuesta, sin reintentos), aquí SÍ puede intentar las veces que
// necesite — es un ejercicio remedial, no una pregunta nueva. Al
// acertar, recupera un corazón y continúa la lección.
export function RepasoPregunta({ actividadId, onUnauthorized, onRecuperado, onCancelar }) {
  const [actividad, setActividad] = useState(null);
  const [seleccionada, setSeleccionada] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    apiFetch(`/actividades/${actividadId}`, { onUnauthorized })
      .then((d) => activo && setActividad(d))
      .catch((err) => activo && setError(err.message));
    return () => {
      activo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actividadId]);

  const elegir = async (valor) => {
    setSeleccionada(valor);
    setEnviando(true);
    try {
      const data = await apiFetch(`/actividades/${actividadId}/intentos`, {
        method: "POST",
        body: { respuesta: valor },
        onUnauthorized,
      });
      setResultado(data);
    } catch (err) {
      setError(err.message || "No se pudo enviar tu respuesta");
    } finally {
      setEnviando(false);
    }
  };

  const reintentar = async () => {
    setResultado(null);
    setSeleccionada(null);
    try {
      // Nueva petición = nuevo orden aleatorio de opciones.
      const fresca = await apiFetch(`/actividades/${actividadId}`, { onUnauthorized });
      setActividad(fresca);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return <p className="ls-body text-sm rounded-2xl px-5 py-4" style={{ background: C.coralSuave, color: "#C2453B" }}>{error}</p>;
  }
  if (!actividad) {
    return <p className="ls-body text-sm text-center" style={{ color: C.gris }}>Cargando repaso…</p>;
  }

  const c = actividad.contenido;

  return (
    <div className="rounded-3xl p-6 md:p-8" style={{ background: "#fff", border: `2px solid ${C.morado}` }}>
      <span className="ls-body text-xs font-bold uppercase tracking-widest" style={{ color: C.morado }}>
        💚 Repaso — intenta las veces que necesites
      </span>
      {c.instruccion && (
        <h2 className="ls-display text-xl font-extrabold mt-2" style={{ color: C.tinta }}>{c.instruccion}</h2>
      )}
      {c.texto && (
        <>
          <p className="ls-body text-sm mt-3 leading-relaxed" style={{ color: C.gris }}>{c.texto}</p>
          <h3 className="ls-display text-lg font-bold mt-3" style={{ color: C.tinta }}>{c.pregunta}</h3>
        </>
      )}

      <div className="grid gap-3 mt-4">
        {c.opciones.map((op) => {
          const elegida = seleccionada === op;
          const esCorrecta = resultado ? op === resultado.respuestaCorrecta : false;
          let bg = "#fff", bd = C.borde, col = C.tinta;
          if (resultado && elegida && esCorrecta) { bg = C.verdeSuave; bd = C.verde; col = "#1B7A5B"; }
          if (resultado && elegida && !esCorrecta) { bg = C.coralSuave; bd = C.coral; col = "#C2453B"; }
          if (resultado && !elegida && esCorrecta) { bg = C.verdeSuave; bd = C.verde; col = "#1B7A5B"; }
          return (
            <button
              key={op}
              disabled={enviando || Boolean(resultado)}
              onClick={() => elegir(op)}
              className="ls-btn ls-body text-left text-[15px] font-semibold px-5 py-4 rounded-2xl disabled:cursor-default"
              style={{ background: bg, border: `2px solid ${bd}`, color: col }}
            >
              {op}
            </button>
          );
        })}
      </div>

      {resultado && (
        <div className="mt-5 rounded-2xl px-5 py-4" style={{ background: resultado.correcto ? C.verdeSuave : C.coralSuave }}>
          <p className="ls-display font-bold" style={{ color: resultado.correcto ? "#1B7A5B" : "#C2453B" }}>
            {resultado.correcto ? "¡Recuperaste un corazón! 💚" : `No era esa. La correcta es "${resultado.respuestaCorrecta}"`}
          </p>
          {resultado.explicacion && (
            <p className="ls-body text-sm mt-2 leading-relaxed" style={{ color: resultado.correcto ? "#1B7A5B" : "#C2453B" }}>
              {resultado.explicacion}
            </p>
          )}
          <div className="flex justify-end mt-3">
            {resultado.correcto ? (
              <button onClick={onRecuperado} className="ls-btn ls-body text-sm font-bold px-5 py-2.5 rounded-full" style={{ background: C.verde, color: "#fff" }}>
                Continuar la lección →
              </button>
            ) : (
              <button onClick={reintentar} className="ls-btn ls-body text-sm font-bold px-5 py-2.5 rounded-full" style={{ background: C.coral, color: "#fff" }}>
                Intentar de nuevo
              </button>
            )}
          </div>
        </div>
      )}

      {!resultado && (
        <button onClick={onCancelar} className="ls-btn ls-body text-xs font-semibold mt-5" style={{ color: C.gris }}>
          Cancelar y volver al panel
        </button>
      )}
    </div>
  );
}
