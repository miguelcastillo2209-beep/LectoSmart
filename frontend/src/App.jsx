import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { C } from "./theme/colors";
import { AuthProvider } from "./context/AuthContext";
import { RutaPrivada } from "./components/RutaPrivada";
import Inicio from "./pages/Inicio";
import Login from "./pages/Login";

// Solo Inicio y el login de estudiante van en el paquete inicial: es lo
// primero que ve cualquiera y lo que más pesa en el internet del colegio.
// El resto (paneles del docente y del administrador, que traen tablas,
// PDF y el asistente IA) se descarga cuando de verdad se necesita.
const LoginDocente = lazy(() => import("./pages/LoginDocente"));
const LoginAdmin = lazy(() => import("./pages/LoginAdmin"));
const PanelEstudiante = lazy(() => import("./pages/PanelEstudiante"));
const Ranking = lazy(() => import("./pages/Ranking"));
const PanelDocente = lazy(() => import("./pages/PanelDocente"));
const PanelAdmin = lazy(() => import("./pages/PanelAdmin"));
const ModuloPalabras = lazy(() => import("./pages/ModuloPalabras"));
const ModuloOrtografia = lazy(() => import("./pages/ModuloOrtografia"));
const ModuloComprension = lazy(() => import("./pages/ModuloComprension"));
const ModuloFluidez = lazy(() => import("./pages/ModuloFluidez"));

function Cargando() {
  return (
    <p className="ls-body text-center mt-16" style={{ color: C.gris }}>
      Cargando…
    </p>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen ls-body" style={{ background: C.fondo }}>
          <Suspense fallback={<Cargando />}>
            <Routes>
              <Route path="/" element={<Inicio />} />
              <Route path="/ingreso" element={<Login />} />
              <Route path="/ingreso-docente" element={<LoginDocente />} />
              <Route path="/ingreso-admin" element={<LoginAdmin />} />
              <Route
                path="/panel"
                element={
                  <RutaPrivada rol="estudiante">
                    <PanelEstudiante />
                  </RutaPrivada>
                }
              />
              <Route
                path="/ranking"
                element={
                  <RutaPrivada rol="estudiante">
                    <Ranking />
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
                path="/ortografia/:id"
                element={
                  <RutaPrivada rol="estudiante">
                    <ModuloOrtografia />
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
                  <RutaPrivada rol={["docente", "administrador"]}>
                    <PanelDocente />
                  </RutaPrivada>
                }
              />
              <Route
                path="/admin"
                element={
                  <RutaPrivada rol="administrador">
                    <PanelAdmin />
                  </RutaPrivada>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
