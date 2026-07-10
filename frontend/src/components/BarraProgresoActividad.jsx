import { C } from "../theme/colors";

export function BarraProgresoActividad({ posicion, total, vidas }) {
  const pct = total > 0 ? Math.round((posicion / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="flex-1 h-3.5 rounded-full overflow-hidden" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: C.verde }} />
      </div>
      <span className="ls-body text-sm font-bold" style={{ color: C.gris }}>{posicion} / {total}</span>
      <span className="ls-body text-sm font-bold px-3 py-1 rounded-full" style={{ background: C.coralSuave, color: C.coral }}>
        ❤ {vidas}
      </span>
    </div>
  );
}
