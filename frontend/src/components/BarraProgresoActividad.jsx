import { useEffect, useRef, useState } from "react";
import { C } from "../theme/colors";

export function BarraProgresoActividad({ posicion, total, vidas }) {
  const pct = total > 0 ? Math.round((posicion / total) * 100) : 0;

  // El ancho se pinta directo, sin estado intermedio: al pasar de pregunta
  // el componente NO se desmonta (solo cambia el parámetro de la ruta), así
  // que la transición de CSS anima sola del valor anterior al nuevo.
  //
  // Antes esto usaba requestAnimationFrame para forzar la animación desde
  // cero, y la barra se quedaba clavada en 0% cuando la pestaña no estaba
  // visible: el navegador no ejecuta rAF en segundo plano. La animación
  // nunca debe decidir el valor que se muestra.

  // Al perder un corazón, el contador late una vez.
  const [late, setLate] = useState(false);
  const vidasPrevias = useRef(vidas);
  useEffect(() => {
    if (vidas < vidasPrevias.current) {
      setLate(true);
      const id = setTimeout(() => setLate(false), 500);
      vidasPrevias.current = vidas;
      return () => clearTimeout(id);
    }
    vidasPrevias.current = vidas;
  }, [vidas]);

  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 h-3.5 rounded-full overflow-hidden" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
        <div
          className="ls-barra-progreso h-full rounded-full"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.verde}, #6FD9B4)` }}
        />
      </div>
      <span className="ls-body text-sm font-bold" style={{ color: C.gris }}>{posicion} / {total}</span>
      <span
        className={`ls-body text-sm font-bold px-3 py-1 rounded-full inline-block ${late ? "ls-latido" : ""}`}
        style={{ background: C.coralSuave, color: C.coral }}
      >
        ❤ {vidas}
      </span>
    </div>
  );
}
