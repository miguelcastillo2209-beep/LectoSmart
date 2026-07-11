import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RutaPrivada = ({ rol, children }) => {
  const { estaAutenticado, rol: rolActual } = useAuth();

  if (!estaAutenticado) return <Navigate to="/ingreso" replace />;

  const rolesPermitidos = Array.isArray(rol) ? rol : rol ? [rol] : null;
  if (rolesPermitidos && !rolesPermitidos.includes(rolActual)) return <Navigate to="/" replace />;

  return children;
};
