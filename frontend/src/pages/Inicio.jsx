import { Link } from "react-router-dom";
import { C } from "../theme/colors";
import { Leo } from "../components/Leo";
import { AppHeader } from "../components/AppHeader";

const FUNCIONALIDADES = [
  { icono: "🔤", titulo: "Reconocer palabras", desc: "Juegos para identificar y formar palabras cada vez más rápido.", color: C.azulSuave },
  { icono: "✍️", titulo: "Escribir sin errores", desc: "La letra que va, la tilde en su sitio y frases bien armadas.", color: C.coralSuave },
  { icono: "📖", titulo: "Comprender textos", desc: "Lee historias cortas y responde retos sobre lo que entendiste.", color: C.verdeSuave },
  { icono: "⏱️", titulo: "Ganar fluidez", desc: "Lecturas cronometradas para leer con más ritmo y seguridad.", color: C.moradoSuave },
];

export default function Inicio() {
  return (
    <div>
      <AppHeader
        right={
          <Link
            to="/ingreso"
            className="ls-btn ls-body text-sm font-semibold px-5 py-2.5 rounded-full inline-block"
            style={{ background: C.tinta, color: "#fff" }}
          >
            Ingresar
          </Link>
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
            <Link
              to="/ingreso"
              className="ls-btn ls-display text-lg font-bold px-7 py-3.5 rounded-2xl inline-block"
              style={{ background: C.azul, color: "#fff", boxShadow: "0 6px 0 #3D57D6" }}
            >
              Soy estudiante
            </Link>
            <Link
              to="/ingreso-docente"
              className="ls-btn ls-display text-lg font-bold px-7 py-3.5 rounded-2xl inline-block"
              style={{ background: "#fff", color: C.tinta, border: `2px solid ${C.borde}` }}
            >
              Soy docente
            </Link>
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
              ¡Empieza hoy!
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="ls-display text-2xl font-bold mb-6" style={{ color: C.tinta }}>
          ¿Qué puedes hacer en LectoSmart?
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FUNCIONALIDADES.map((f) => (
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
}
