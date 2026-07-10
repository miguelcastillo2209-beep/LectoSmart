import { Link } from "react-router-dom";
import { C } from "../theme/colors";
import { Leo } from "./Leo";

export const AppHeader = ({ right }) => (
  <header className="flex items-center justify-between px-3 sm:px-6 py-4 max-w-6xl mx-auto w-full gap-2">
    <Link to="/" className="flex items-center gap-2 ls-btn shrink-0">
      <Leo size={44} />
      <span className="ls-display text-2xl font-bold" style={{ color: C.tinta }}>
        Lecto<span style={{ color: C.azul }}>Smart</span>
      </span>
    </Link>
    <div>{right}</div>
  </header>
);
