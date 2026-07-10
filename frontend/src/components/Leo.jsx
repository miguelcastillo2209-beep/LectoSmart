import { C } from "../theme/colors";

// Mascota "Leo", el libro lector. Extraído 1:1 del prototipo aprobado.
export const Leo = ({ size = 72 }) => (
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
