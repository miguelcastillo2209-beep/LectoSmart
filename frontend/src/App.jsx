import { BrowserRouter, Routes, Route } from "react-router-dom";
import { C } from "./theme/colors";
import { AuthProvider } from "./context/AuthContext";
import { RutaPrivada } from "./components/RutaPrivada";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";
import LoginDocente from "./pages/LoginDocente";
import PanelEstudiante from "./pages/PanelEstudiante";
import PanelDocente from "./pages/PanelDocente";
import ModuloPalabras from "./pages/ModuloPalabras";
import ModuloComprension from "./pages/ModuloComprension";
import ModuloFluidez from "./pages/ModuloFluidez";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen ls-body" style={{ background: C.fondo }}>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/ingreso" element={<Login />} />
            <Route path="/ingreso-docente" element={<LoginDocente />} />
            <Route
              path="/panel"
              element={
                <RutaPrivada rol="estudiante">
                  <PanelEstudiante />
                </RutaPrivada>
              }
            />
            <Route
              path="/palabras/:id"
              element={
                <RutaPrivada rol="estudiante">
                  <ModuloPalabras />
                </RutaPrivada>
              }
            />
            <Route
              path="/comprension/:id"
              element={
                <RutaPrivada rol="estudiante">
                  <ModuloComprension />
                </RutaPrivada>
              }
            />
            <Route
              path="/fluidez/:id"
              element={
                <RutaPrivada rol="estudiante">
                  <ModuloFluidez />
                </RutaPrivada>
              }
            />
            <Route
              path="/docente"
              element={
                <RutaPrivada rol="docente">
                  <PanelDocente />
                </RutaPrivada>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
