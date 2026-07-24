import { C } from "../theme/colors";
import { AppHeader } from "./AppHeader";

// Pantalla que se muestra cuando el estudiante se queda sin corazones
// en una lección (reutilizada por los tres módulos de actividades).
// Si se pasa `onRepasar`, ofrece recuperar un corazón repasando una
// pregunta que ya falló, en vez de solo volver al panel.
export function SinCorazones({ onVolver, onRepasar }) {
  return (
    <div>
      <AppHeader right={null} />
      <div className="max-w-md mx-auto mt-16 text-center rounded-3xl p-8" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
        <p className="text-5xl">💔</p>
        <h2 className="ls-display text-xl font-extrabold mt-3" style={{ color: C.tinta }}>
          Te quedaste sin corazones
        </h2>
        <p className="ls-body text-sm mt-2" style={{ color: C.gris }}>
          No te preocupes, tu progreso en las actividades que ya resolviste bien queda guardado.
          {onRepasar
            ? " Puedes repasar una de las que fallaste para recuperar un corazón y seguir."
            : " Puedes volver a intentar esta lección cuando quieras."}
        </p>
        <div className="flex flex-col gap-2 mt-5">
          {onRepasar && (
            <button
              onClick={onRepasar}
              className="ls-btn ls-display font-bold px-6 py-3 rounded-2xl"
              style={{ background: C.verde, color: "#fff" }}
            >
              💚 Repasar y recuperar un corazón
            </button>
          )}
          <button
            onClick={onVolver}
            className="ls-btn ls-display font-bold px-6 py-3 rounded-2xl"
            style={onRepasar ? { background: "#fff", color: C.gris, border: `2px solid ${C.borde}` } : { background: C.tinta, color: "#fff" }}
          >
            Volver al panel
          </button>
        </div>
      </div>
    </div>
  );
}
