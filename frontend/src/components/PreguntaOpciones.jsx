import { C } from "../theme/colors";

const LETRAS = ["A", "B", "C", "D", "E"];

// Grid de opciones de una pregunta + panel de retroalimentación, reutilizado
// por los módulos de Palabras, Ortografía y Comprensión (misma mecánica:
// elegir una opción, ver si es correcta, avanzar o reintentar).
//
// Las opciones entran escalonadas y tienen relieve (borde inferior grueso
// que se hunde al pulsar). Al responder, la elegida rebota si acertó o
// niega con la cabeza si falló, y el panel de explicación sube desde abajo.
export function PreguntaOpciones({ opciones, resultado, onElegir, deshabilitado, onContinuar }) {
  return (
    <div>
      <div className="grid gap-3">
        {opciones.map((op, i) => {
          const elegida = resultado?.seleccionada === op.valor;
          const esCorrecta = resultado ? op.valor === resultado.respuestaCorrecta : false;
          let bg = "#fff", bd = C.borde, col = C.tinta;
          if (resultado && elegida && esCorrecta) { bg = C.verdeSuave; bd = C.verde; col = "#1B7A5B"; }
          if (resultado && elegida && !esCorrecta) { bg = C.coralSuave; bd = C.coral; col = "#C2453B"; }
          if (resultado && !elegida && esCorrecta) { bg = C.verdeSuave; bd = C.verde; col = "#1B7A5B"; }

          // Solo se anima la opción que el estudiante tocó: animar también
          // la correcta cuando falló daría a entender que acertó.
          const reaccion = elegida ? (esCorrecta ? "ls-acierto" : "ls-fallo") : "";

          return (
            <button
              key={op.valor}
              type="button"
              disabled={deshabilitado || Boolean(resultado)}
              onClick={() => onElegir(op.valor)}
              className={`ls-opcion ls-entra ${reaccion} ls-body text-left text-[15px] font-semibold px-5 py-4 rounded-2xl flex items-center gap-3 disabled:cursor-default`}
              style={{
                background: bg,
                border: `2px solid ${bd}`,
                color: col,
                "--retraso": `${i * 60}ms`,
              }}
            >
              <span
                className="ls-display w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0"
                style={{
                  background: elegida || (resultado && esCorrecta) ? bd : C.fondo,
                  color: elegida || (resultado && esCorrecta) ? "#fff" : C.gris,
                  transition: "background .15s ease, color .15s ease",
                }}
              >
                {LETRAS[i]}
              </span>
              {op.etiqueta}
            </button>
          );
        })}
      </div>

      {resultado && (
        <div
          className="ls-sube mt-5 rounded-2xl px-5 py-4"
          style={{ background: resultado.correcto ? C.verdeSuave : C.coralSuave, border: `2px solid ${resultado.correcto ? C.verde : C.coral}` }}
        >
          <p className="ls-display font-bold flex items-start gap-2" style={{ color: resultado.correcto ? "#1B7A5B" : "#C2453B" }}>
            <span className="ls-celebra text-xl leading-tight shrink-0">{resultado.correcto ? "🎉" : "💡"}</span>
            <span>
              {resultado.correcto
                ? `¡Muy bien! +${resultado.puntosGanados} puntos ⭐`
                : `No era esa. La respuesta correcta es: "${resultado.respuestaCorrecta}"`}
            </span>
          </p>
          {resultado.explicacion && (
            <p className="ls-body text-sm mt-2 leading-relaxed" style={{ color: resultado.correcto ? "#1B7A5B" : "#C2453B" }}>
              {resultado.explicacion}
            </p>
          )}
          <div className="flex justify-end mt-3">
            <button
              onClick={onContinuar}
              className="ls-opcion ls-body text-sm font-bold px-6 py-2.5 rounded-full"
              style={{
                background: resultado.correcto ? C.verde : C.coral,
                color: "#fff",
                border: `2px solid ${resultado.correcto ? "#26A87C" : "#E05A4E"}`,
              }}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
