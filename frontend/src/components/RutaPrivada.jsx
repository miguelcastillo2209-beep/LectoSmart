import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RutaPrivada = ({ rol, children }) => {
  const { estaAutenticado, rol: rolActual } = useAuth();

  if (!estaAutenticado) return <Navigate to="/ingreso" replace />;
  if (rol && rolActual !== rol) return <Navigate to="/" replace />;

  return children;
};
