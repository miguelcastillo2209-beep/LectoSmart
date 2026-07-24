// Proveedor de IA para el asistente de docentes.
//
// Diseñado para que el proveedor sea intercambiable por configuración,
// sin tocar el resto del código:
//   IA_PROVIDER = "gemini" (por defecto) — API gratuita de Google
//   IA_API_KEY  = clave del proveedor
//   IA_MODEL    = modelo a usar (por defecto "gemini-flash-latest")
// Para agregar otro proveedor (Claude, etc.) basta con implementar otra
// función consultar<Proveedor>() con la misma firma.

const PROVIDER = process.env.IA_PROVIDER || "gemini";
const API_KEY = process.env.IA_API_KEY || "";
const MODEL = process.env.IA_MODEL || "gemini-flash-latest";

// La capa gratuita de Gemini a veces congestiona un modelo puntual
// ("high demand"). Si el modelo principal falla por congestión o cuota,
// se intenta en orden con estos respaldos antes de rendirse.
const MODELOS_RESPALDO = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-lite-latest",
  "gemini-2.0-flash-lite",
];

function iaConfigurada() {
  return API_KEY.length > 0;
}

// mensajes: [{ rol: "usuario" | "ia", texto: string }, ...]
// Devuelve el texto de la respuesta o lanza un Error con mensaje legible.
async function consultarIA({ instrucciones, mensajes }) {
  if (!iaConfigurada()) {
    throw new Error("El asistente IA no está configurado en el servidor (falta IA_API_KEY)");
  }
  if (PROVIDER === "gemini") return consultarGemini({ instrucciones, mensajes });
  throw new Error(`Proveedor de IA desconocido: ${PROVIDER}`);
}

async function consultarGemini({ instrucciones, mensajes }) {
  const cuerpo = {
    system_instruction: { parts: [{ text: instrucciones }] },
    contents: mensajes.map((m) => ({
      role: m.rol === "ia" ? "model" : "user",
      parts: [{ text: m.texto }],
    })),
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2000,
    },
  };

  const modelos = [MODEL, ...MODELOS_RESPALDO.filter((m) => m !== MODEL)];
  let ultimoError = null;

  for (const modelo of modelos) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const detalle = data?.error?.message || `HTTP ${res.status}`;
      console.error(`Gemini (${modelo}):`, detalle);
      // Congestión, cuota o modelo no disponible → probar el siguiente.
      if ([429, 404, 500, 503].includes(res.status) || /high demand|overloaded/i.test(detalle)) {
        ultimoError = detalle;
        continue;
      }
      throw new Error("El servicio de IA no está disponible en este momento. Intenta de nuevo.");
    }

    const texto = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim();

    if (!texto) {
      const razon = data?.candidates?.[0]?.finishReason || data?.promptFeedback?.blockReason;
      console.error(`Gemini (${modelo}) no devolvió texto. Razón:`, razon);
      throw new Error("La IA no pudo generar una respuesta para esa consulta. Reformúlala e intenta de nuevo.");
    }

    return texto;
  }

  console.error("Todos los modelos de Gemini fallaron. Último error:", ultimoError);
  throw new Error(
    "El servicio gratuito de IA está congestionado en este momento. Intenta de nuevo en unos minutos."
  );
}

// Igual que consultarGemini, pero pidiendo salida JSON estructurada
// validada contra `schema` (dialecto de esquema de Gemini, subconjunto
// de OpenAPI). Usado para generar actividades candidatas. Devuelve el
// objeto ya parseado.
async function generarJSON({ instrucciones, prompt, schema }) {
  if (!iaConfigurada()) {
    throw new Error("El asistente IA no está configurado en el servidor (falta IA_API_KEY)");
  }
  if (PROVIDER !== "gemini") throw new Error(`Proveedor de IA desconocido: ${PROVIDER}`);

  const cuerpo = {
    system_instruction: { parts: [{ text: instrucciones }] },
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4000,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  };

  const modelos = [MODEL, ...MODELOS_RESPALDO.filter((m) => m !== MODEL)];
  let ultimoError = null;

  for (const modelo of modelos) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const detalle = data?.error?.message || `HTTP ${res.status}`;
      console.error(`Gemini JSON (${modelo}):`, detalle);
      if ([429, 404, 500, 503].includes(res.status) || /high demand|overloaded/i.test(detalle)) {
        ultimoError = detalle;
        continue;
      }
      throw new Error("El servicio de IA no está disponible en este momento. Intenta de nuevo.");
    }

    const texto = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
    if (!texto) {
      ultimoError = "respuesta vacía";
      continue;
    }
    try {
      return JSON.parse(texto);
    } catch (err) {
      console.error(`Gemini JSON (${modelo}) devolvió JSON inválido:`, err.message);
      ultimoError = "JSON inválido";
      continue;
    }
  }

  console.error("Todos los modelos de Gemini fallaron generando JSON. Último error:", ultimoError);
  throw new Error(
    "El servicio gratuito de IA está congestionado en este momento. Intenta de nuevo en unos minutos."
  );
}

// Transcribe un audio corto (base64 + mime type) usando el mismo
// modelo/respaldos que el resto del servicio. Se usa solo para la
// verificación opcional de fluidez lectora — nunca para el puntaje
// principal, que sigue calculándose por ppm sin depender de la IA.
async function transcribirAudio({ audioBase64, mimeType }) {
  if (!iaConfigurada()) {
    throw new Error("El asistente IA no está configurado en el servidor (falta IA_API_KEY)");
  }
  if (PROVIDER !== "gemini") throw new Error(`Proveedor de IA desconocido: ${PROVIDER}`);

  const instrucciones =
    "Transcribe exactamente lo que dice la persona en el audio, en español, tal como se escucha, " +
    "sin agregar comentarios ni explicaciones. Si el audio está en silencio o no contiene voz humana, " +
    "responde exactamente: SIN_VOZ";

  const cuerpo = {
    contents: [
      {
        role: "user",
        parts: [{ text: instrucciones }, { inline_data: { mime_type: mimeType, data: audioBase64 } }],
      },
    ],
    generationConfig: { temperature: 0.1, maxOutputTokens: 1000 },
  };

  const modelos = [MODEL, ...MODELOS_RESPALDO.filter((m) => m !== MODEL)];
  let ultimoError = null;

  for (const modelo of modelos) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${API_KEY}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const detalle = data?.error?.message || `HTTP ${res.status}`;
      console.error(`Gemini audio (${modelo}):`, detalle);
      if ([429, 404, 500, 503].includes(res.status) || /high demand|overloaded/i.test(detalle)) {
        ultimoError = detalle;
        continue;
      }
      throw new Error("El servicio de IA no está disponible en este momento. Intenta de nuevo.");
    }

    const texto = data?.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim();

    if (!texto) {
      ultimoError = "respuesta vacía";
      continue;
    }
    return texto;
  }

  console.error("Todos los modelos de Gemini fallaron transcribiendo audio. Último error:", ultimoError);
  throw new Error(
    "El servicio gratuito de IA está congestionado en este momento. Intenta de nuevo en unos minutos."
  );
}

module.exports = { consultarIA, generarJSON, transcribirAudio, iaConfigurada };
