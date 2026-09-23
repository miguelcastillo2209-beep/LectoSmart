import { Link } from "react-router-dom";

// El logo es la marca del proyecto: se muestra en grande a propósito
// (la docente pidió que resaltara más). Baja de tamaño en móvil para no
// pelear con los botones de la derecha, que en el panel del estudiante
// son varios.
export const AppHeader = ({ right }) => (
  <header className="flex items-center justify-between px-3 sm:px-6 py-4 max-w-6xl mx-auto w-full gap-2">
    <Link to="/" className="flex items-center gap-2 ls-btn shrink-0">
      <img
        src="/logo.jpg"
        alt="LectoSmart"
        className="h-16 sm:h-24 w-auto rounded-2xl"
        style={{ boxShadow: "0 8px 22px rgba(30,42,74,.16)" }}
      />
    </Link>
    <div>{right}</div>
  </header>
);
