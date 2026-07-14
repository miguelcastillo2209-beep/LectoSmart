import { Link } from "react-router-dom";

export const AppHeader = ({ right }) => (
  <header className="flex items-center justify-between px-3 sm:px-6 py-4 max-w-6xl mx-auto w-full gap-2">
    <Link to="/" className="flex items-center gap-2 ls-btn shrink-0">
      <img src="/logo.jpg" alt="LectoSmart" className="h-11 w-auto rounded-lg" />
    </Link>
    <div>{right}</div>
  </header>
);
