import { C } from "../theme/colors";
import { AppHeader } from "./AppHeader";
import { Leo } from "./Leo";

// Pantalla de cierre de una lección. Antes, al responder la última
// actividad se saltaba de golpe al panel y no había forma de repetir la
// lección desde el principio: había que salir y volver a entrar.
//
// `aciertos` y `total` son de ESTA pasada, no del historial: el estudiante
// puede repetir una lección ya completada y lo que importa es cómo le fue
// ahora.
export function LeccionCompletada({ modulo, aciertos, total, puntos, onRepetir, onVolver }) {
  const perfecto = total > 0 && aciertos === total;
  const pct = total > 0 ? Math.round((aciertos / total) * 100) : 0;

  const titulo = perfecto ? "¡Lección perfecta!" : "¡Lección terminada!";
  const emoji = perfecto ? "🏆" : "🎉";
  const mensaje = perfecto
    ? "Respondiste bien todas las preguntas. Así se hace."
    : pct >= 60
      ? "Buen trabajo. Repite la lección para afinar las que se te escaparon."
      : "Vas cogiendo el ritmo. Repetir la lección es la mejor forma de fijarlo.";

  return (
    <div>
      <AppHeader right={null} />
      <div
        className="ls-entra max-w-md mx-auto mt-12 text-center rounded-3xl p-8"
        style={{ background: "#fff", border: `2px solid ${C.borde}` }}
      >
        <p className="ls-celebra text-6xl">{emoji}</p>

        <h2 className="ls-display text-2xl font-extrabold mt-3" style={{ color: C.tinta }}>
          {titulo}
        </h2>
        <p className="ls-body text-sm mt-1" style={{ color: C.gris }}>{modulo}</p>

        <div className="flex justify-center my-5">
          <Leo size={92} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl px-4 py-3" style={{ background: C.verdeSuave }}>
            <p className="ls-display text-2xl font-extrabold" style={{ color: "#1B7A5B" }}>
              {aciertos} / {total}
            </p>
            <p className="ls-body text-xs font-semibold mt-0.5" style={{ color: "#1B7A5B" }}>
              respuestas correctas
            </p>
          </div>
          <div className="rounded-2xl px-4 py-3" style={{ background: "#FFF6D6" }}>
            <p className="ls-display text-2xl font-extrabold" style={{ color: "#8A6B00" }}>
              +{puntos}
            </p>
            <p className="ls-body text-xs font-semibold mt-0.5" style={{ color: "#8A6B00" }}>
              puntos en esta ronda
            </p>
          </div>
        </div>

        <p className="ls-body text-sm mt-5" style={{ color: C.gris }}>{mensaje}</p>

        <div className="flex flex-col gap-2 mt-5">
          <button
            onClick={onRepetir}
            className="ls-opcion ls-display font-bold px-6 py-3 rounded-2xl"
            style={{ background: C.verde, color: "#fff", border: `2px solid #26A87C` }}
          >
            🔄 Repetir la lección
          </button>
          <button
            onClick={onVolver}
            className="ls-opcion ls-display font-bold px-6 py-3 rounded-2xl"
            style={{ background: "#fff", color: C.gris, border: `2px solid ${C.borde}` }}
          >
            Volver al panel
          </button>
        </div>
      </div>
    </div>
  );
}
