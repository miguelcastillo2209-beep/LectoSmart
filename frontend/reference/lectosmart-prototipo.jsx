import React, { useState } from "react";

/* ============================================================
   LECTOSMART — Prototipo de diseño navegable (Fase 1)
   Proyecto de grado: Danna Valentina Ramírez · Aileen Celeste Guevara
   I.E. Técnica Valle de Tenza — Guateque, 2026
   ============================================================ */

const C = {
  fondo: "#F2F6FC",      // azul-papel de cuaderno
  tinta: "#1E2A4A",      // azul tinta profundo
  azul: "#4F6DF5",       // azul primario
  azulSuave: "#E4EAFE",
  resaltador: "#FFD84D", // amarillo marcador
  verde: "#2FBE8F",
  verdeSuave: "#DFF6ED",
  coral: "#FF6B5E",
  coralSuave: "#FFE9E7",
  morado: "#8B5CF6",
  moradoSuave: "#F0E9FE",
  blanco: "#FFFFFF",
  gris: "#6B7590",
  borde: "#E3E9F4",
};

const FontStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    .ls-display { font-family: 'Baloo 2', system-ui, sans-serif; }
    .ls-body { font-family: 'Inter', system-ui, sans-serif; }
    .ls-highlight {
      background: linear-gradient(104deg, transparent 0.5%, ${C.resaltador} 2.5%, ${C.resaltador}dd 96%, transparent 98%);
      border-radius: 4px; padding: 0 6px; box-decoration-break: clone;
    }
    .ls-card { transition: transform .15s ease, box-shadow .15s ease; }
    .ls-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(30,42,74,.10); }
    .ls-btn { transition: transform .1s ease, filter .15s ease; }
    .ls-btn:hover { filter: brightness(1.06); }
    .ls-btn:active { transform: scale(.97); }
    @media (prefers-reduced-motion: reduce) {
      .ls-card, .ls-btn { transition: none; }
    }
  `}</style>
);

/* ---------- Mascota: “Leo”, el libro lector ---------- */
const Leo = ({ size = 72 }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" aria-label="Leo, la mascota de LectoSmart">
    <ellipse cx="60" cy="108" rx="34" ry="7" fill="#1E2A4A" opacity=".08" />
    <path d="M22 34 C22 26, 30 22, 60 26 C90 22, 98 26, 98 34 L98 86 C98 94, 90 96, 60 92 C30 96, 22 94, 22 86 Z" fill={C.azul} />
    <path d="M60 26 L60 92" stroke="#3D57D6" strokeWidth="5" />
    <path d="M28 38 C40 33, 52 33, 57 36 L57 86 C52 83, 40 83, 28 87 Z" fill="#FFFFFF" />
    <path d="M92 38 C80 33, 68 33, 63 36 L63 86 C68 83, 80 83, 92 87 Z" fill="#FFFFFF" />
    <circle cx="45" cy="55" r="5.5" fill={C.tinta} />
    <circle cx="75" cy="55" r="5.5" fill={C.tinta} />
    <circle cx="46.8" cy="53.4" r="1.8" fill="#fff" />
    <circle cx="76.8" cy="53.4" r="1.8" fill="#fff" />
    <path d="M52 68 Q60 75 68 68" stroke={C.tinta} strokeWidth="4" strokeLinecap="round" fill="none" />
    <circle cx="37" cy="64" r="4" fill={C.coral} opacity=".55" />
    <circle cx="83" cy="64" r="4" fill={C.coral} opacity=".55" />
    <path d="M60 26 Q63 14 74 12" stroke={C.verde} strokeWidth="5" strokeLinecap="round" fill="none" />
    <circle cx="76" cy="11" r="5" fill={C.verde} />
  </svg>
);

/* ---------- Barra de navegación del prototipo ---------- */
const screens = [
  { id: "inicio", label: "Inicio" },
  { id: "login", label: "Ingreso" },
  { id: "panel", label: "Panel estudiante" },
  { id: "actividad", label: "Actividad" },
  { id: "docente", label: "Panel docente" },
];

const ProtoBar = ({ current, go }) => (
  <div style={{ background: C.tinta }} className="ls-body px-4 py-2 flex items-center gap-2 flex-wrap sticky top-0 z-50">
    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9FB0DC" }}>
      Prototipo · pantallas:
    </span>
    {screens.map((s) => (
      <button
        key={s.id}
        onClick={() => go(s.id)}
        className="ls-btn text-xs font-semibold px-3 py-1.5 rounded-full"
        style={{
          background: current === s.id ? C.resaltador : "rgba(255,255,255,.10)",
          color: current === s.id ? C.tinta : "#DCE4F7",
        }}
      >
        {s.label}
      </button>
    ))}
  </div>
);

/* ---------- Header de la app ---------- */
const AppHeader = ({ go, right }) => (
  <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
    <button onClick={() => go("inicio")} className="flex items-center gap-2 ls-btn">
      <Leo size={44} />
      <span className="ls-display text-2xl font-bold" style={{ color: C.tinta }}>
        Lecto<span style={{ color: C.azul }}>Smart</span>
      </span>
    </button>
    <div>{right}</div>
  </header>
);

/* ============================================================
   PANTALLA 1 — INICIO
   ============================================================ */
const Inicio = ({ go }) => (
  <div>
    <AppHeader
      go={go}
      right={
        <button
          onClick={() => go("login")}
          className="ls-btn ls-body text-sm font-semibold px-5 py-2.5 rounded-full"
          style={{ background: C.tinta, color: "#fff" }}
        >
          Ingresar
        </button>
      }
    />

    <section className="max-w-6xl mx-auto px-6 pt-10 pb-16 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <p className="ls-body text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: C.azul }}>
          I.E. Técnica Valle de Tenza · Guateque
        </p>
        <h1 className="ls-display font-extrabold leading-tight" style={{ color: C.tinta, fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}>
          Leer bien se aprende <span className="ls-highlight">jugando</span>
        </h1>
        <p className="ls-body mt-5 text-lg leading-relaxed" style={{ color: C.gris, maxWidth: 480 }}>
          LectoSmart te acompaña a mejorar tu lectura con retos, juegos y
          seguimiento de tu progreso. Practica a tu ritmo, gana puntos y
          sube de nivel.
        </p>
        <div className="mt-8 flex gap-3 flex-wrap">
          <button
            onClick={() => go("login")}
            className="ls-btn ls-display text-lg font-bold px-7 py-3.5 rounded-2xl"
            style={{ background: C.azul, color: "#fff", boxShadow: "0 6px 0 #3D57D6" }}
          >
            Soy estudiante
          </button>
          <button
            onClick={() => go("docente")}
            className="ls-btn ls-display text-lg font-bold px-7 py-3.5 rounded-2xl"
            style={{ background: "#fff", color: C.tinta, border: `2px solid ${C.borde}` }}
          >
            Soy docente
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <div
          className="rounded-3xl p-8 relative"
          style={{ background: "#fff", border: `2px solid ${C.borde}`, boxShadow: "0 20px 40px rgba(30,42,74,.08)", width: 340 }}
        >
          <div className="flex justify-center mb-4"><Leo size={130} /></div>
          <p className="ls-display text-center text-xl font-bold" style={{ color: C.tinta }}>¡Hola! Soy Leo</p>
          <p className="ls-body text-center text-sm mt-1" style={{ color: C.gris }}>
            Tu compañero de lectura. Hoy tenemos un reto nuevo esperándote.
          </p>
          <div className="mt-5 rounded-2xl px-4 py-3 flex items-center justify-between" style={{ background: C.azulSuave }}>
            <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Reto del día</span>
            <span className="ls-body text-xs font-bold px-3 py-1 rounded-full" style={{ background: C.resaltador, color: C.tinta }}>
              +50 pts
            </span>
          </div>
          <div
            className="absolute -top-3 -right-3 rounded-full px-4 py-2 ls-display font-bold text-sm"
            style={{ background: C.verde, color: "#fff", transform: "rotate(6deg)" }}
          >
            ¡Nivel 3!
          </div>
        </div>
      </div>
    </section>

    <section className="max-w-6xl mx-auto px-6 pb-20">
      <h2 className="ls-display text-2xl font-bold mb-6" style={{ color: C.tinta }}>
        ¿Qué puedes hacer en LectoSmart?
      </h2>
      <div className="grid md:grid-cols-3 gap-5">
        {[
          { icono: "🔤", titulo: "Reconocer palabras", desc: "Juegos para identificar y formar palabras cada vez más rápido.", color: C.azulSuave },
          { icono: "📖", titulo: "Comprender textos", desc: "Lee historias cortas y responde retos sobre lo que entendiste.", color: C.verdeSuave },
          { icono: "⏱️", titulo: "Ganar fluidez", desc: "Lecturas cronometradas para leer con más ritmo y seguridad.", color: C.moradoSuave },
        ].map((f) => (
          <div key={f.titulo} className="ls-card rounded-3xl p-6" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ background: f.color }}>
              {f.icono}
            </div>
            <h3 className="ls-display text-xl font-bold" style={{ color: C.tinta }}>{f.titulo}</h3>
            <p className="ls-body text-sm mt-2 leading-relaxed" style={{ color: C.gris }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    <footer className="ls-body text-center text-xs py-6" style={{ color: C.gris }}>
      LectoSmart · Proyecto de grado — Especialidad de Informática · I.E. Técnica Valle de Tenza · Guateque, 2026
    </footer>
  </div>
);

/* ============================================================
   PANTALLA 2 — INGRESO / REGISTRO
   ============================================================ */
const Login = ({ go }) => {
  const [modo, setModo] = useState("entrar");
  return (
    <div>
      <AppHeader go={go} right={null} />
      <div className="max-w-md mx-auto px-6 pt-6 pb-20">
        <div className="flex justify-center mb-4"><Leo size={90} /></div>
        <h1 className="ls-display text-3xl font-extrabold text-center" style={{ color: C.tinta }}>
          {modo === "entrar" ? "¡Hola de nuevo!" : "Crea tu cuenta"}
        </h1>
        <p className="ls-body text-center text-sm mt-2 mb-6" style={{ color: C.gris }}>
          {modo === "entrar" ? "Ingresa para continuar tu aventura lectora." : "Solo necesitas tu nombre y tu curso."}
        </p>

        <div className="flex rounded-full p-1 mb-6" style={{ background: C.azulSuave }}>
          {["entrar", "registro"].map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              className="ls-btn ls-body flex-1 text-sm font-semibold py-2 rounded-full"
              style={{ background: modo === m ? "#fff" : "transparent", color: C.tinta, boxShadow: modo === m ? "0 2px 6px rgba(30,42,74,.10)" : "none" }}
            >
              {m === "entrar" ? "Ya tengo cuenta" : "Soy nuevo"}
            </button>
          ))}
        </div>

        <div className="rounded-3xl p-6" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
          {modo === "registro" && (
            <label className="block mb-4">
              <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Tu nombre</span>
              <input className="ls-body mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none" placeholder="Ej: Sofía Rodríguez"
                style={{ border: `2px solid ${C.borde}`, background: C.fondo }} readOnly />
            </label>
          )}
          <label className="block mb-4">
            <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Usuario</span>
            <input className="ls-body mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none" placeholder="tu_usuario"
              style={{ border: `2px solid ${C.borde}`, background: C.fondo }} readOnly />
          </label>
          <label className="block mb-4">
            <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Contraseña</span>
            <input type="password" className="ls-body mt-1.5 w-full rounded-xl px-4 py-3 text-sm outline-none" placeholder="••••••••"
              style={{ border: `2px solid ${C.borde}`, background: C.fondo }} readOnly />
          </label>
          {modo === "registro" && (
            <label className="block mb-4">
              <span className="ls-body text-sm font-semibold" style={{ color: C.tinta }}>Tu curso</span>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {["3°", "5°", "7°", "9°"].map((g, i) => (
                  <div key={g} className="ls-body text-center text-sm font-semibold py-2.5 rounded-xl"
                    style={{ background: i === 1 ? C.azul : C.fondo, color: i === 1 ? "#fff" : C.tinta, border: `2px solid ${i === 1 ? C.azul : C.borde}` }}>
                    {g}
                  </div>
                ))}
              </div>
            </label>
          )}
          <button
            onClick={() => go("panel")}
            className="ls-btn ls-display w-full text-lg font-bold py-3.5 rounded-2xl mt-2"
            style={{ background: C.azul, color: "#fff", boxShadow: "0 5px 0 #3D57D6" }}
          >
            {modo === "entrar" ? "Entrar" : "Crear cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   PANTALLA 3 — PANEL DEL ESTUDIANTE
   ============================================================ */
const PanelEstudiante = ({ go }) => (
  <div>
    <AppHeader
      go={go}
      right={
        <div className="flex items-center gap-3">
          <div className="ls-body text-sm font-bold px-4 py-2 rounded-full flex items-center gap-1.5" style={{ background: C.resaltador, color: C.tinta }}>
            ⭐ 340 pts
          </div>
          <div className="w-10 h-10 rounded-full flex items-center justify-center ls-display font-bold" style={{ background: C.morado, color: "#fff" }}>
            S
          </div>
        </div>
      }
    />

    <div className="max-w-6xl mx-auto px-6 pb-20">
      {/* Saludo + progreso de nivel */}
      <div className="rounded-3xl p-6 md:p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center" style={{ background: C.tinta }}>
        <div>
          <h1 className="ls-display text-3xl font-extrabold text-white">¡Hola, Sofía! 👋</h1>
          <p className="ls-body text-sm mt-1" style={{ color: "#B9C6EA" }}>
            Llevas <strong style={{ color: C.resaltador }}>4 días seguidos</strong> practicando. ¡No rompas la racha!
          </p>
          <div className="mt-5">
            <div className="flex justify-between ls-body text-xs font-semibold mb-1.5" style={{ color: "#B9C6EA" }}>
              <span>Nivel 3 · Explorador de historias</span>
              <span>340 / 500 pts</span>
            </div>
            <div className="h-4 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.15)" }}>
              <div className="h-full rounded-full" style={{ width: "68%", background: `linear-gradient(90deg, ${C.verde}, ${C.resaltador})` }} />
            </div>
          </div>
        </div>
        <div className="hidden md:block"><Leo size={110} /></div>
      </div>

      {/* Módulos */}
      <h2 className="ls-display text-2xl font-bold mt-10 mb-5" style={{ color: C.tinta }}>Tus actividades</h2>
      <div className="grid md:grid-cols-3 gap-5">
        {[
          { icono: "🔤", titulo: "Reconocer palabras", estado: "3 de 5 completadas", pct: 60, color: C.azul, suave: C.azulSuave },
          { icono: "📖", titulo: "Comprensión lectora", estado: "1 de 5 completadas", pct: 20, color: C.verde, suave: C.verdeSuave, cta: true },
          { icono: "⏱️", titulo: "Fluidez lectora", estado: "Aún sin empezar", pct: 0, color: C.morado, suave: C.moradoSuave },
        ].map((m) => (
          <button
            key={m.titulo}
            onClick={() => m.cta && go("actividad")}
            className="ls-card rounded-3xl p-6 text-left"
            style={{ background: "#fff", border: `2px solid ${m.cta ? m.color : C.borde}` }}
          >
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl flex items-center justify-center text-3xl p-2" style={{ background: m.suave }}>{m.icono}</div>
              {m.cta && (
                <span className="ls-body text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: m.color, color: "#fff" }}>
                  Continuar →
                </span>
              )}
            </div>
            <h3 className="ls-display text-xl font-bold mt-4" style={{ color: C.tinta }}>{m.titulo}</h3>
            <p className="ls-body text-xs mt-1" style={{ color: C.gris }}>{m.estado}</p>
            <div className="h-2.5 rounded-full mt-3 overflow-hidden" style={{ background: C.fondo }}>
              <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
            </div>
          </button>
        ))}
      </div>

      {/* Logros */}
      <h2 className="ls-display text-2xl font-bold mt-10 mb-5" style={{ color: C.tinta }}>Tus logros</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icono: "🏅", nombre: "Primera lectura", listo: true },
          { icono: "🔥", nombre: "Racha de 3 días", listo: true },
          { icono: "🚀", nombre: "10 actividades", listo: false },
          { icono: "👑", nombre: "Nivel 5", listo: false },
        ].map((l) => (
          <div key={l.nombre} className="rounded-2xl p-4 text-center" style={{ background: "#fff", border: `2px solid ${C.borde}`, opacity: l.listo ? 1 : 0.45 }}>
            <div className="text-3xl">{l.icono}</div>
            <p className="ls-body text-xs font-semibold mt-2" style={{ color: C.tinta }}>{l.nombre}</p>
            <p className="ls-body text-[10px] mt-0.5" style={{ color: l.listo ? C.verde : C.gris }}>
              {l.listo ? "¡Conseguido!" : "Bloqueado"}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ============================================================
   PANTALLA 4 — ACTIVIDAD: COMPRENSIÓN LECTORA
   ============================================================ */
const Actividad = ({ go }) => {
  const [resp, setResp] = useState(null);
  const correcta = 1;
  return (
    <div>
      <AppHeader
        go={go}
        right={
          <button onClick={() => go("panel")} className="ls-btn ls-body text-sm font-semibold px-4 py-2 rounded-full"
            style={{ background: "#fff", color: C.tinta, border: `2px solid ${C.borde}` }}>
            ← Salir
          </button>
        }
      />
      <div className="max-w-3xl mx-auto px-6 pb-20">
        {/* Progreso de la actividad */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-3.5 rounded-full overflow-hidden" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
            <div className="h-full rounded-full" style={{ width: "40%", background: C.verde }} />
          </div>
          <span className="ls-body text-sm font-bold" style={{ color: C.gris }}>2 / 5</span>
          <span className="ls-body text-sm font-bold px-3 py-1 rounded-full" style={{ background: C.coralSuave, color: C.coral }}>❤ 3</span>
        </div>

        {/* Texto de lectura */}
        <div className="rounded-3xl p-6 md:p-8" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
          <span className="ls-body text-xs font-bold uppercase tracking-widest" style={{ color: C.verde }}>Lee con atención</span>
          <h1 className="ls-display text-2xl font-extrabold mt-2" style={{ color: C.tinta }}>El colibrí del Valle de Tenza</h1>
          <p className="ls-body mt-4 leading-loose" style={{ color: C.tinta, fontSize: 17 }}>
            En las montañas del Valle de Tenza vive un colibrí de plumas verdes y brillantes.
            Cada mañana visita las flores del jardín de doña Rosa para tomar su néctar.
            Los niños del pueblo lo llaman <span className="ls-highlight">“Chispa”</span>, porque
            vuela tan rápido que parece un rayo de luz entre los árboles.
          </p>
        </div>

        {/* Pregunta */}
        <div className="mt-6">
          <h2 className="ls-display text-xl font-bold mb-4" style={{ color: C.tinta }}>
            ¿Por qué los niños llaman “Chispa” al colibrí?
          </h2>
          <div className="grid gap-3">
            {[
              "Porque tiene plumas de color amarillo",
              "Porque vuela muy rápido, como un rayo de luz",
              "Porque vive en la casa de doña Rosa",
            ].map((op, i) => {
              const elegida = resp === i;
              const esCorrecta = i === correcta;
              let bg = "#fff", bd = C.borde, col = C.tinta;
              if (resp !== null && elegida && esCorrecta) { bg = C.verdeSuave; bd = C.verde; col = "#1B7A5B"; }
              if (resp !== null && elegida && !esCorrecta) { bg = C.coralSuave; bd = C.coral; col = "#C2453B"; }
              if (resp !== null && !elegida && esCorrecta) { bg = C.verdeSuave; bd = C.verde; col = "#1B7A5B"; }
              return (
                <button key={i} onClick={() => setResp(i)}
                  className="ls-btn ls-body text-left text-[15px] font-semibold px-5 py-4 rounded-2xl flex items-center gap-3"
                  style={{ background: bg, border: `2px solid ${bd}`, color: col }}>
                  <span className="ls-display w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0"
                    style={{ background: elegida || (resp !== null && esCorrecta) ? bd : C.fondo, color: elegida || (resp !== null && esCorrecta) ? "#fff" : C.gris }}>
                    {["A", "B", "C"][i]}
                  </span>
                  {op}
                </button>
              );
            })}
          </div>

          {resp !== null && (
            <div className="mt-5 rounded-2xl px-5 py-4 flex items-center justify-between flex-wrap gap-3"
              style={{ background: resp === correcta ? C.verdeSuave : C.coralSuave, border: `2px solid ${resp === correcta ? C.verde : C.coral}` }}>
              <p className="ls-display font-bold" style={{ color: resp === correcta ? "#1B7A5B" : "#C2453B" }}>
                {resp === correcta ? "¡Muy bien! +20 puntos ⭐" : "Casi… vuelve a leer el texto 💪"}
              </p>
              <button onClick={() => setResp(null)} className="ls-btn ls-body text-sm font-bold px-5 py-2.5 rounded-full"
                style={{ background: resp === correcta ? C.verde : C.coral, color: "#fff" }}>
                {resp === correcta ? "Siguiente →" : "Intentar de nuevo"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   PANTALLA 5 — PANEL DOCENTE
   ============================================================ */
const PanelDocente = ({ go }) => {
  const estudiantes = [
    { nombre: "Sofía Rodríguez", curso: "5°", nivel: 3, pts: 340, actividades: 12, comp: 78 },
    { nombre: "Andrés Pineda", curso: "5°", nivel: 2, pts: 210, actividades: 8, comp: 64 },
    { nombre: "Valentina Cruz", curso: "7°", nivel: 4, pts: 480, actividades: 17, comp: 85 },
    { nombre: "Juan D. Malagón", curso: "3°", nivel: 1, pts: 90, actividades: 4, comp: 42 },
    { nombre: "Mariana Torres", curso: "9°", nivel: 3, pts: 355, actividades: 13, comp: 71 },
  ];
  const colorComp = (v) => (v >= 70 ? C.verde : v >= 50 ? "#E8A13C" : C.coral);
  return (
    <div>
      <AppHeader
        go={go}
        right={
          <div className="flex items-center gap-2">
            <span className="ls-body text-sm font-semibold hidden md:block" style={{ color: C.gris }}>Prof. Martha Bernal</span>
            <div className="w-10 h-10 rounded-full flex items-center justify-center ls-display font-bold" style={{ background: C.tinta, color: "#fff" }}>M</div>
          </div>
        }
      />
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <h1 className="ls-display text-3xl font-extrabold" style={{ color: C.tinta }}>Seguimiento de estudiantes</h1>
        <p className="ls-body text-sm mt-1" style={{ color: C.gris }}>Progreso general del grupo en las actividades de lectura.</p>

        {/* Resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { valor: "28", etiqueta: "Estudiantes activos", color: C.azul },
            { valor: "146", etiqueta: "Actividades completadas", color: C.verde },
            { valor: "68%", etiqueta: "Comprensión promedio", color: C.morado },
            { valor: "5", etiqueta: "Necesitan refuerzo", color: C.coral },
          ].map((k) => (
            <div key={k.etiqueta} className="rounded-2xl p-5" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
              <p className="ls-display text-3xl font-extrabold" style={{ color: k.color }}>{k.valor}</p>
              <p className="ls-body text-xs font-semibold mt-1" style={{ color: C.gris }}>{k.etiqueta}</p>
            </div>
          ))}
        </div>

        {/* Tabla */}
        <div className="mt-8 rounded-3xl overflow-hidden" style={{ background: "#fff", border: `2px solid ${C.borde}` }}>
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: `2px solid ${C.borde}` }}>
            <h2 className="ls-display text-lg font-bold" style={{ color: C.tinta }}>Estudiantes</h2>
            <input className="ls-body text-sm px-4 py-2 rounded-full outline-none w-56" placeholder="Buscar estudiante…"
              style={{ background: C.fondo, border: `2px solid ${C.borde}` }} readOnly />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full ls-body text-sm">
              <thead>
                <tr style={{ color: C.gris }}>
                  {["Estudiante", "Curso", "Nivel", "Puntos", "Actividades", "Comprensión"].map((h) => (
                    <th key={h} className="text-left font-semibold px-6 py-3 whitespace-nowrap" style={{ background: C.fondo }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((e, i) => (
                  <tr key={e.nombre} style={{ borderTop: `1px solid ${C.borde}` }}>
                    <td className="px-6 py-3.5 font-semibold whitespace-nowrap" style={{ color: C.tinta }}>{e.nombre}</td>
                    <td className="px-6 py-3.5" style={{ color: C.gris }}>{e.curso}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-bold px-2.5 py-1 rounded-full text-xs" style={{ background: C.azulSuave, color: C.azul }}>Nv {e.nivel}</span>
                    </td>
                    <td className="px-6 py-3.5 font-semibold" style={{ color: C.tinta }}>⭐ {e.pts}</td>
                    <td className="px-6 py-3.5" style={{ color: C.gris }}>{e.actividades}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2.5 rounded-full overflow-hidden" style={{ background: C.fondo }}>
                          <div className="h-full rounded-full" style={{ width: `${e.comp}%`, background: colorComp(e.comp) }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: colorComp(e.comp) }}>{e.comp}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   APP
   ============================================================ */
export default function LectoSmartPrototipo() {
  const [pantalla, setPantalla] = useState("inicio");
  const go = (id) => setPantalla(id);
  return (
    <div className="min-h-screen ls-body" style={{ background: C.fondo }}>
      <FontStyles />
      <ProtoBar current={pantalla} go={go} />
      {pantalla === "inicio" && <Inicio go={go} />}
      {pantalla === "login" && <Login go={go} />}
      {pantalla === "panel" && <PanelEstudiante go={go} />}
      {pantalla === "actividad" && <Actividad go={go} />}
      {pantalla === "docente" && <PanelDocente go={go} />}
    </div>
  );
}
