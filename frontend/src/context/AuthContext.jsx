import { createContext, useContext, useMemo, useState } from "react";
import { setToken } from "../api/client";

const SESSION_KEY = "lectosmart_session";

const AuthContext = createContext(null);

function leerSesionGuardada() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => {
    const guardada = leerSesionGuardada();
    if (guardada) setToken(guardada.token);
    return guardada;
  });

  const iniciarSesion = ({ token, rol, perfil }) => {
    const nuevaSesion = { token, rol, perfil };
    setToken(token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(nuevaSesion));
    setSesion(nuevaSesion);
  };

  const cerrarSesion = () => {
    setToken(null);
    localStorage.removeItem(SESSION_KEY);
    setSesion(null);
  };

  const value = useMemo(
    () => ({
      sesion,
      rol: sesion?.rol ?? null,
      perfil: sesion?.perfil ?? null,
      estaAutenticado: Boolean(sesion?.token),
      iniciarSesion,
      cerrarSesion,
    }),
    [sesion]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
