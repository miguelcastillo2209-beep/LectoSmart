import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { C } from "../theme/colors";
import { AppHeader } from "../components/AppHeader";
import { BarraProgresoActividad } from "../components/BarraProgresoActividad";
import { SinCorazones } from "../components/SinCorazones";
import { apiFetch } from "../api/client";

const CORAZONES_INICIALES = 2;

function blobABase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// "antes" -> "leyendo" -> "resultado"
export default function ModuloFluidez() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [actividad, setActividad] = useState(null);
  const [lista, setLista] = useState([]);
  const [estado, setEstado] = useState("antes");
  const [segundos, setSegundos] = useState(0);
  const [resultado, setResultado] = useState(null);
  const [vidas, setVidas] = useState(CORAZONES_INICIALES);
  const [sinCorazones, setSinCorazones] = useState(false);
  const [enRepaso, setEnRepaso] = useState(false);
  const [error, setError] = useState(null);

  // Verificación de voz opcional (ver consentimiento en la UI): nunca
  // afecta corazones ni puntos, es solo retroalimentación extra.
  const [audioHabilitado, setAudioHabilitado] = useState(false);
  const [grabando, setGrabando] = useState(false);
  const [permisoAudioError, setPermisoAudioError] = useState(null);
  const [verificandoAudio, setVerificandoAudio] = useState(false);
  const [verificacionAudio, setVerificacionAudio] = useState(null);

  const inicioRef = useRef(null);
  const intervaloRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const irAIngreso = useCallback(() => navigate("/ingreso"), [navigate]);

  useEffect(() => {
    let activo = true;
    setEstado("antes");
    setResultado(null);
    setSegundos(0);
    // Los corazones NO se reinician al pasar de lectura: se comparten
    // durante toda la lección (se restablecen solo si el componente se
    // vuelve a montar, es decir, si el estudiante sale y reingresa).
    setError(null);
    setAudioHabilitado(false);
    setGrabando(false);
    setVerificacionAudio(null);
    setPermisoAudioError(null);

    async function cargar() {
      try {
        const [detalle, actividades] = await Promise.all([
          apiFetch(`/actividades/${id}`, { onUnauthorized: irAIngreso }),
          apiFetch("/modulos/FLUIDEZ/actividades", { onUnauthorized: irAIngreso }),
        ]);
        if (!activo) return;
        setActividad(detalle);
        setLista(actividades);
      } catch (err) {
        if (activo) setError(err.message || "No se pudo cargar la actividad");
      }
    }
    cargar();
    return () => {
      activo = false;
      clearInterval(intervaloRef.current);
    };
  }, [id, irAIngreso]);

  const empezar = async () => {
    setVerificacionAudio(null);
    if (audioHabilitado) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : MediaRecorder.isTypeSupported("audio/ogg")
          ? "audio/ogg"
          : "";
        const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        chunksRef.current = [];
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        mr.start();
        mediaRecorderRef.current = mr;
        setGrabando(true);
        setPermisoAudioError(null);
      } catch {
        setPermisoAudioError("No se pudo acceder al micrófono. Puedes continuar sin verificación por voz.");
      }
    }

    inicioRef.current = Date.now();
    setSegundos(0);
    setEstado("leyendo");
    intervaloRef.current = setInterval(() => {
      setSegundos(Math.round((Date.now() - inicioRef.current) / 1000));
    }, 250);
  };

  const terminar = async () => {
    clearInterval(intervaloRef.current);
    const tiempoSegundos = Math.max(1, Math.round((Date.now() - inicioRef.current) / 1000));
    setEstado("resultado");

    let audioBlob = null;
    const mimeType = mediaRecorderRef.current?.mimeType;
    if (mediaRecorderRef.current && grabando) {
      const mr = mediaRecorderRef.current;
      audioBlob = await new Promise((resolve) => {
        mr.onstop = () => resolve(new Blob(chunksRef.current, { type: mimeType }));
        mr.stop();
        mr.stream.getTracks().forEach((t) => t.stop());
      });
      setGrabando(false);
    }

    try {
      const data = await apiFetch(`/actividades/${id}/intentos`, {
        method: "POST",
        body: { tiempoSegundos },
        onUnauthorized: irAIngreso,
      });
      if (!data.correcto) setVidas((v) => Math.max(0, v - 1));
      const metadata = JSON.parse(data.metadata ?? "null");
      setResultado({ ...data, tiempoSegundos, ppm: metadata?.ppm });
    } catch (err) {
      setError(err.message || "No se pudo registrar tu lectura");
      return;
    }

    if (audioBlob && audioBlob.size > 0) {
      setVerificandoAudio(true);
      try {
        const audioBase64 = await blobABase64(audioBlob);
        const resAudio = await apiFetch(`/actividades/${id}/verificar-audio`, {
          method: "POST",
          body: { audioBase64, mimeType },
          onUnauthorized: irAIngreso,
        });
        setVerificacionAudio(resAudio);
      } catch (err) {
        setVerificacionAudio({ error: err.message || "No se pudo verificar el audio" });
      } finally {
        setVerificandoAudio(false);
      }
    }
  };

  // Sin reintentos: cada lectura se hace una sola vez y siempre se
  // avanza a la siguiente, salvo que se acaben los corazones.
  const continuar = () => {
    if (vidas <= 0) {
      setSinCorazones(true);
      return;
    }
    const siguiente = lista.find((a) => a.orden > actividad.orden);
    if (siguiente) navigate(`/fluidez/${siguiente.id}`);
    else navigate("/panel");
  };

  // Repaso (recuperar corazón): vuelve a leer el MISMO texto una vez
  // más — a diferencia del flujo normal, aquí sí se permite reintentar.
  const volverALeer = () => {
    setResultado(null);
    setEstado("antes");
  };

  const corazonRecuperado = () => {
    setVidas(1);
    setEnRepaso(false);
    setSinCorazones(false);
    const siguiente = lista.find((a) => a.orden > actividad.orden);
    if (siguiente) navigate(`/fluidez/${siguiente.id}`);
    else navigate("/panel");
  };

  if (error) {
    return (
      <div>
        <AppHeader right={null} />
        <div className="max-w-md mx-auto mt-10 rounded-2xl px-5 py-4 text-center" style={{ background: C.coralSuave, color: "#C2453B" }}>
          {error}
        </div>
      </div>
    );
  }

  if (!actividad) {
    return (
      <div>
        <AppHeader right={null} />
        <p className="ls-body text-center mt-10" style={{ color: C.gris }}>Cargando actividad…</p>
      </div>
    );
  }

  if (sinCorazones) {
    return (
      <SinCorazones
        onVolver={() => navigate("/panel")}
        onRepasar={() => {
          setSinCorazones(false);
          setEnRepaso(true);
          setEstado("antes");
          setResultado(null);
        }}
      />
    );
  }

  const { texto, ppmObjetivo } = actividad.contenido;

  return (
    <div>
      <AppHeader
        right={
          <button onClick={() => navigate("/panel")} className="ls-btn ls-body text-sm font-semibold px-4 py-2 rounded-full"
            style={{ background: "#fff", color: C.tinta, border: `2px solid ${C.borde}` }}>
            ← Salir
          </button>
        }
      />
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <BarraProgresoActividad posicion={actividad.orden} total={lista.length || 1} vidas={vidas} />

        <div className="rounded-3xl p-6 md:p-8" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="ls-body text-xs font-bold uppercase tracking-widest" style={{ color: C.morado }}>
              {enRepaso ? "💚 Repaso — recupera un corazón" : "Lectura cronometrada"}
            </span>
            <div className="flex items-center gap-2">
              {estado === "leyendo" && grabando && (
                <span className="ls-body text-xs font-bold px-3 py-1 rounded-full" style={{ background: C.coralSuave, color: "#C2453B" }}>
                  🔴 Grabando
                </span>
              )}
              {estado === "leyendo" && (
                <span className="ls-display text-lg font-bold px-3 py-1 rounded-full" style={{ background: C.moradoSuave, color: C.morado }}>
                  ⏱️ {segundos}s
                </span>
              )}
            </div>
          </div>
          <h1 className="ls-display text-2xl font-extrabold mt-2" style={{ color: C.tinta }}>{actividad.titulo}</h1>
          <p className="ls-body mt-4 leading-loose" style={{ color: C.tinta, fontSize: 17 }}>{texto}</p>
        </div>

        {permisoAudioError && (
          <p className="ls-body text-xs mt-3" style={{ color: "#C2453B" }}>⚠️ {permisoAudioError}</p>
        )}

        <div className="mt-6">
          {estado === "antes" && (
            <>
              <label
                className="flex items-start gap-2 rounded-2xl px-4 py-3 mb-3 cursor-pointer"
                style={{ background: C.moradoSuave, border: `2px solid ${C.morado}` }}
              >
                <input
                  type="checkbox"
                  checked={audioHabilitado}
                  onChange={(e) => setAudioHabilitado(e.target.checked)}
                  className="mt-1"
                />
                <span className="ls-body text-sm" style={{ color: C.tinta }}>
                  🎙️ <strong>Opcional:</strong> grabar mi voz mientras leo para que la IA revise qué tan bien
                  leí en voz alta. El audio se envía una sola vez para transcribirlo y no se guarda en el
                  servidor.
                </span>
              </label>
              <button
                onClick={empezar}
                className="ls-btn ls-display w-full text-lg font-bold py-3.5 rounded-2xl"
                style={{ background: C.morado, color: "#fff", boxShadow: "0 5px 0 #6D3FD1" }}
              >
                Estoy listo, ¡a leer! →
              </button>
            </>
          )}

          {estado === "leyendo" && (
            <button
              onClick={terminar}
              className="ls-btn ls-display w-full text-lg font-bold py-3.5 rounded-2xl"
              style={{ background: C.verde, color: "#fff", boxShadow: "0 5px 0 #1F9B72" }}
            >
              Terminé de leer ✅
            </button>
          )}

          {estado === "resultado" && resultado && (
            <div
              className="rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3"
              style={{ background: resultado.correcto ? C.verdeSuave : C.coralSuave, border: `2px solid ${resultado.correcto ? C.verde : C.coral}` }}
            >
              <div>
                <p className="ls-display font-bold" style={{ color: resultado.correcto ? "#1B7A5B" : "#C2453B" }}>
                  {resultado.correcto
                    ? enRepaso
                      ? "¡Recuperaste un corazón! 💚"
                      : `¡Muy bien! +${resultado.puntosGanados} puntos ⭐`
                    : "Casi… no alcanzaste la meta 💪"}
                </p>
                <p className="ls-body text-sm mt-1" style={{ color: resultado.correcto ? "#1B7A5B" : "#C2453B" }}>
                  Leíste a {resultado.ppm ?? "—"} palabras por minuto (meta: {ppmObjetivo} ppm) en {resultado.tiempoSegundos}s.
                </p>
                {verificandoAudio && (
                  <p className="ls-body text-xs mt-2" style={{ color: C.gris }}>🎙️ Verificando tu voz con IA…</p>
                )}
                {verificacionAudio && !verificacionAudio.error && !verificacionAudio.sinVoz && (
                  <p className="ls-body text-xs mt-2" style={{ color: resultado.correcto ? "#1B7A5B" : "#C2453B" }}>
                    🎙️ La IA reconoció {verificacionAudio.porcentaje}% de las palabras leídas correctamente (
                    {verificacionAudio.palabrasCorrectas}/{verificacionAudio.palabrasTotal}).
                  </p>
                )}
                {verificacionAudio?.sinVoz && (
                  <p className="ls-body text-xs mt-2" style={{ color: C.gris }}>🎙️ No se detectó voz en la grabación.</p>
                )}
                {verificacionAudio?.error && (
                  <p className="ls-body text-xs mt-2" style={{ color: C.gris }}>🎙️ {verificacionAudio.error}</p>
                )}
              </div>
              {enRepaso ? (
                <button
                  onClick={resultado.correcto ? corazonRecuperado : volverALeer}
                  className="ls-btn ls-body text-sm font-bold px-5 py-2.5 rounded-full"
                  style={{ background: resultado.correcto ? C.verde : C.coral, color: "#fff" }}
                >
                  {resultado.correcto ? "Continuar la lección →" : "Volver a leer"}
                </button>
              ) : (
                <button
                  onClick={continuar}
                  className="ls-btn ls-body text-sm font-bold px-5 py-2.5 rounded-full"
                  style={{ background: resultado.correcto ? C.verde : C.coral, color: "#fff" }}
                >
                  Siguiente →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
