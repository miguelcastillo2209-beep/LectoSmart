// Resumen del enfoque pedagógico por curso (ver
// docs/estudio-contenidos-por-grado.md) usado para instruir a la IA al
// generar actividades candidatas para revisión docente.
const ENFOQUE_POR_CURSO = {
  "6°": "Comprensión literal y vocabulario básico (sinónimos, antónimos, ortografía de uso frecuente). Ambienta los textos en contextos cercanos al estudiante: vereda, colegio, mercado, vida rural del Valle de Tenza.",
  "7°": "Morfología (prefijos, sufijos, familias de palabras) e inferencias simples (deducir sentimientos, causas o propósitos no dichos explícitamente). Contextos cercanos al estudiante.",
  "8°": "Conectores (pero, porque, sin embargo, además), palabras homófonas, y sentido global de textos expositivos con relaciones de causa-efecto. Contextos cercanos o regionales (naturaleza, clima, tecnología rural).",
  "9°": "Texto argumentativo: identificar tesis, argumentos y distinguir hecho de opinión. Conectores lógicos formales (en consecuencia, no obstante, por ende). Temas que le interesan a un adolescente (redes, colegio, campo vs. ciudad).",
  "10°": "Lenguaje figurado y connotación (metáfora, símil, ironía, personificación) y la postura implícita del autor en ensayos breves y reflexivos.",
  "11°": "Lectura crítica tipo Saber 11: identificar errores de razonamiento (falacias), evaluar la validez de un argumento, contrastar posturas distintas sobre un mismo tema. Vocabulario académico transversal.",
};

// Enfoque específico del módulo ORTOGRAFIA por grado (ver
// docs/estudio-ortografia-y-gramatica.md). Va aparte de ENFOQUE_POR_CURSO
// porque la progresión de la ortografía no es la misma que la de la
// comprensión: en 6°-7° pesa la letra que va, en 8°-9° la tilde y los
// homófonos, y en 10°-11° la sintaxis y la puntuación del texto largo.
const ENFOQUE_ORTOGRAFIA_POR_CURSO = {
  "6°": "Letras que se confunden al oído: b/v, s/c/z, ll/y, h muda, r/rr. Reconocer que la tilde marca dónde suena la fuerza de voz (agudas, graves, esdrújulas). Concordancia básica de número y género. Mayúscula al iniciar y en nombres propios.",
  "7°": "g/j (gente, jirafa), h en palabras frecuentes (hacer, hubo, hoy), y las reglas de acentuación aplicadas: agudas con tilde si terminan en vocal, n o s. Concordancia sujeto-verbo en frases más largas. Primeros homófonos (tubo/tuvo, hola/ola).",
  "8°": "Homófonos de uso real: echar/hechar, valla/vaya, haber/a ver, hierba/hierva, hay/ahí/ay. Tilde diacrítica (tú/tu, él/el, sí/si, más/mas). Coma que separa enumeraciones y vocativos.",
  "9°": "por qué / porqué / porque / por que; sino / si no; también / tan bien. Tilde en interrogativos y exclamativos (qué, cómo, cuándo, dónde). Coma antes de conectores (sin embargo, por lo tanto) y coma que cambia el sentido de la frase.",
  "10°": "Queísmo y dequeísmo (pienso que / me alegro de que), uso de haber impersonal (hubo muchos, no hubieron muchos), pronombres relativos (cuyo, quien). Punto y coma y dos puntos en textos expositivos. Tilde en aún/aun y solo.",
  "11°": "Registro escrito formal: mayúsculas y minúsculas según norma, uso de siglas y citas, comillas. Puntuación de textos largos (punto y coma, paréntesis, raya). Errores de concordancia en oraciones subordinadas complejas y ortografía de vocabulario académico (a través, asimismo, con base en).",
};

module.exports = { ENFOQUE_POR_CURSO, ENFOQUE_ORTOGRAFIA_POR_CURSO };
