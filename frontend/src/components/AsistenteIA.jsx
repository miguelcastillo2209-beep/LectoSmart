import { useEffect, useRef, useState } from "react";
import { C } from "../theme/colors";
import { apiFetch } from "../api/client";

const SUGERENCIAS = [
  "¿Cómo van mis cursos en cada módulo?",
  "¿Qué estudiantes necesitan refuerzo y qué les recomiendas?",
  "Proponme 3 actividades de comprensión para mi curso más flojo",
  "Dame ideas para mejorar la fluidez lectora según los resultados",
];

// Asistente pedagógico con IA — exclusivo de docentes y administradores.
// El backend arma el contexto (resultados reales + documentos subidos);
// aquí solo se maneja la conversación.
export default function AsistenteIA({ onUnauthorized }) {
  const [configurada, setConfigurada] = useState(null);
  const [mensajes, setMensajes] = useState([]); // { rol: "usuario" | "ia", texto }
  const [pregunta, setPregunta] = useState("");
  const [pensando, setPensando] = useState(false);
  const [error, setError] = useState(null);
  const finChat = useRef(null);

  useEffect(() => {
    apiFetch("/ia/estado", { onUnauthorized })
      .then((d) => setConfigurada(d.configurada))
      .catch(() => setConfigurada(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    finChat.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, pensando]);

  const enviar = async (texto) => {
    const contenido = (texto ?? pregunta).trim();
    if (!contenido || pensando) return;

    setError(null);
    setPregunta("");
    const historial = mensajes;
    setMensajes((previos) => [...previos, { rol: "usuario", texto: contenido }]);
    setPensando(true);

    try {
      const data = await apiFetch("/ia/consultar", {
        method: "POST",
        body: { pregunta: contenido, historial },
        onUnauthorized,
      });
      setMensajes((previos) => [...previos, { rol: "ia", texto: data.respuesta }]);
    } catch (err) {
      setError(err.message);
      // Devolvemos la pregunta al cuadro para que no se pierda.
      setPregunta(contenido);
      setMensajes(historial);
    } finally {
      setPensando(false);
    }
  };

  if (configurada === false) {
    return (
      <div className="mt-6 rounded-3xl p-8 text-center" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
        <p className="ls-display font-bold" style={{ color: C.tinta }}>El asistente IA no está configurado</p>
        <p className="ls-body text-sm mt-1" style={{ color: C.gris }}>
          Falta configurar la clave del servicio de IA en el servidor (IA_API_KEY).
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-3xl overflow-hidden flex flex-col" style={{ background: "#fff", border: `2px solid ${C.borde}`, height: "calc(100vh - 260px)", minHeight: 420 }}>
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: `2px solid ${C.borde}` }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: C.moradoSuave ?? "#EFE9FB" }}>
          🦉
        </div>
        <div>
          <h2 className="ls-display text-lg font-bold" style={{ color: C.tinta }}>Asistente pedagógico</h2>
          <p className="ls-body text-xs" style={{ color: C.gris }}>
            Conoce los resultados de tus estudiantes y los documentos que subas. Solo para docentes.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {mensajes.length === 0 && (
          <div className="text-center mt-6">
            <p className="ls-body text-sm" style={{ color: C.gris }}>
              Pregúntame por el desempeño de tus cursos o pídeme ideas de actividades.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-xl mx-auto">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => enviar(s)}
                  className="ls-btn ls-body text-xs font-semibold px-3.5 py-2 rounded-full"
                  style={{ background: C.fondo, color: C.tinta, border: `2px solid ${C.borde}` }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensajes.map((m, i) => (
          <div key={i} className={`flex mt-3 ${m.rol === "usuario" ? "justify-end" : "justify-start"}`}>
            <div
              className="ls-body text-sm px-4 py-3 rounded-2xl max-w-[85%] whitespace-pre-wrap"
              style={
                m.rol === "usuario"
                  ? { background: C.azul, color: "#fff", borderBottomRightRadius: 6 }
                  : { background: C.fondo, color: C.tinta, border: `1px solid ${C.borde}`, borderBottomLeftRadius: 6 }
              }
            >
              {m.texto}
            </div>
          </div>
        ))}

        {pensando && (
          <div className="flex justify-start mt-3">
            <div className="ls-body text-sm px-4 py-3 rounded-2xl" style={{ background: C.fondo, color: C.gris, border: `1px solid ${C.borde}` }}>
              Analizando resultados… ✍️
            </div>
          </div>
        )}
        <div ref={finChat} />
      </div>

      {error && (
        <p className="ls-body text-xs font-semibold px-6 py-2" style={{ background: C.coralSuave, color: "#C2453B" }}>
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar();
        }}
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderTop: `2px solid ${C.borde}` }}
      >
        <input
          className="ls-body text-sm px-4 py-3 rounded-full outline-none flex-1"
          placeholder="Escribe tu pregunta…"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          disabled={pensando || configurada === null}
          style={{ background: C.fondo, border: `2px solid ${C.borde}` }}
        />
        <button
          type="submit"
          disabled={pensando || !pregunta.trim()}
          className="ls-btn ls-body text-sm font-bold px-6 py-3 rounded-full"
          style={{ background: pensando || !pregunta.trim() ? C.gris : C.morado, color: "#fff" }}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
