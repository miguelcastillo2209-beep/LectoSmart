# Estudio de contenidos por grado — LectoSmart

**Propósito:** fundamentar qué debe trabajar cada curso (6° a 11°) en los tres
módulos de la plataforma (Reconocer palabras, Comprensión lectora y Fluidez
lectora), para que el banco de actividades le sirva de verdad a cada grado y
no sea el mismo contenido con distinta etiqueta.

**Para quién:** las autoras del proyecto (Danna Valentina Ramírez y Aileen
Celeste Guevara) y la docente acompañante, como base para revisar, ajustar y
ampliar el contenido de la plataforma.

> ⚠️ Este estudio se elaboró con asistencia de IA a partir de los referentes
> oficiales listados en la sección de fuentes. Antes de usarlo en un salón
> real, debe validarse contra los documentos originales del MEN y el criterio
> de la docente de Lengua Castellana.

---

## 1. Referentes usados

### 1.1 Estándares Básicos de Competencias del Lenguaje (MEN, 2006)

El MEN organiza los estándares en **grupos de grados** (ciclos), no grado por
grado. Los que cubren la plataforma son:

| Ciclo | Grados | Estándar de Comprensión e interpretación textual |
|-------|--------|--------------------------------------------------|
| 3 | 6°–7° | "Comprendo e interpreto diversos tipos de texto, para establecer sus relaciones internas y su clasificación en una tipología textual." |
| 4 | 8°–9° | "Comprendo e interpreto textos, teniendo en cuenta el funcionamiento de la lengua en situaciones de comunicación." |
| 5 | 10°–11° | "Comprendo e interpreto textos con actitud crítica y capacidad argumentativa." |

La progresión es clara: **6°–7° clasifica e identifica → 8°–9° infiere y
relaciona con el contexto → 10°–11° critica y argumenta.** Toda actividad de
la plataforma debería poder ubicarse en esa escalera.

### 1.2 Derechos Básicos de Aprendizaje — Lenguaje v2 (MEN, 2016)

Los DBA aterrizan los estándares **grado por grado**. Su numeración se
corresponde con los factores de los estándares: los DBA 5 y 6 de cada grado
son los de **comprensión de lectura**, que es lo que más nos interesa. En
resumen (parafraseado — verificar enunciados exactos en el PDF oficial):

- **6°:** reconocer la situación comunicativa de un texto (propósito, a quién
  se dirige, tipo de lenguaje) e interpretar textos informativos, expositivos
  y narrativos identificando su contenido literal y su estructura.
- **7°:** clasificar textos según su tipología, comprender relaciones entre
  las partes de un texto (causa-efecto, comparación) y hacer **inferencias
  simples** a partir de pistas del texto.
- **8°:** reconstruir el **sentido global** de un texto, identificar cómo la
  estructura y el contexto de circulación afectan el significado, e inferir
  información implícita en textos expositivos y de opinión.
- **9°:** interpretar textos **argumentativos** identificando tesis,
  argumentos y conclusión; inferir referentes sociales y culturales; evaluar
  la intención comunicativa del autor.
- **10°:** analizar el **lenguaje figurado y connotativo**, relacionar el
  texto con su contexto de producción y asumir una posición frente a lo
  leído con argumentos propios.
- **11°:** leer **críticamente**: evaluar la validez de los argumentos,
  detectar estrategias discursivas (generalizaciones, apelaciones a la
  emoción), contrastar posturas de distintos textos y sustentar una posición
  propia. Es el perfil que evalúa la prueba Saber 11 en lectura crítica.

### 1.3 Niveles de lectura (marco ICFES / Saber)

Las pruebas Saber colombianas evalúan tres niveles, útiles para clasificar
cada pregunta del módulo de Comprensión:

1. **Literal** — lo que el texto dice explícitamente (dominante en 6°).
2. **Inferencial** — lo que el texto implica sin decirlo (centro de 7°–9°).
3. **Crítico** — evaluar la validez, la intención y la postura del autor
   (centro de 10°–11°).

### 1.4 Fluidez lectora — referencias de velocidad (palabras por minuto)

Colombia no tiene una tabla oficial de ppm para secundaria, así que se
tomaron dos referencias externas ampliamente usadas:

- **España (primaria):** 5° ≈ 115–124 ppm; 6° ≈ 125–134 ppm.
- **SEP México (secundaria, lectura en voz alta — rango "estándar"):**
  1° sec (≈ 7° CO) 135–144 ppm; 2° sec (≈ 8° CO) 145–154 ppm;
  3° sec (≈ 9° CO) 155–160 ppm.

Dos decisiones de diseño a partir de esto:

1. Los `ppmObjetivo` de la plataforma se fijan **un escalón por debajo del
   estándar pleno**, porque LectoSmart está dirigida a estudiantes que están
   *mejorando* su lectura: la meta debe ser alcanzable para motivar, no
   frustrar. La progresión adoptada por grado queda así:

   | Grado | ppmObjetivo (rango en la plataforma) | Longitud de texto sugerida |
   |-------|--------------------------------------|-----------------------------|
   | 6°  | 95–115  | 65–85 palabras |
   | 7°  | 110–125 | 85–95 palabras |
   | 8°  | 120–140 | 95–110 palabras |
   | 9°  | 130–150 | 105–120 palabras |
   | 10° | 140–160 | 120–130 palabras |
   | 11° | 150–170 | 130–150 palabras |

2. La velocidad **no es el único componente** de la fluidez (también cuentan
   la precisión y la entonación). La plataforma mide ppm porque es lo
   automatizable, pero la docente debería complementar con lectura en voz
   alta evaluando prosodia.

---

## 2. Qué debe trabajar cada módulo en cada grado

### 6° — Consolidar la base

**Perfil:** llegan de primaria con niveles muy dispares. Prioridad:
vocabulario de uso frecuente, ortografía básica y comprensión **literal** de
textos narrativos cortos con contexto conocido.

- **Palabras:** sinónimos y antónimos de uso común; ortografía de letras
  problemáticas (b/v, h, x); acentuación básica (agudas, graves, esdrújulas
  como reconocimiento); campos semánticos (agrupar/excluir palabras).
- **Comprensión:** textos narrativos e informativos de 50–90 palabras,
  ambientados en contextos cercanos (vereda, mercado, colegio). Preguntas
  literales (quién, qué, por qué pasó), secuencia de eventos e idea
  principal explícita.
- **Fluidez:** textos de 65–85 palabras, oraciones cortas, vocabulario
  concreto. Meta 95–115 ppm.

### 7° — Cómo se forman las palabras, primeras inferencias

**Perfil:** ya leen literal con solvencia; el salto es **morfología** (cómo
se construyen las palabras) e **inferencia simple** (deducir lo no dicho a
partir de pistas).

- **Palabras:** prefijos (in-, re-, des-) y sufijos (-mente, -ería, -oso);
  familias de palabras y derivación; acentuación con tilde.
- **Comprensión:** narraciones y textos cotidianos (avisos, cartas, recetas)
  donde la pregunta exige inferir sentimientos, causas o propósitos, y
  reconocer el **tipo de texto** (narrativo, instructivo, informativo).
- **Fluidez:** 85–95 palabras, aparecen oraciones subordinadas. Meta
  110–125 ppm.

### 8° — Cohesión y sentido global en textos expositivos

**Perfil:** transición al texto académico. El foco es **cómo se conectan las
ideas** (conectores, referencias) y reconstruir el sentido global de textos
**expositivos** (ciencia escolar, sociedad).

- **Palabras:** conectores (pero, porque, además, sin embargo) y su función;
  palabras homófonas (echar/hechar, valla/vaya, hierba/hierva, tubo/tuvo).
- **Comprensión:** textos expositivos de 60–90 palabras sobre fenómenos
  naturales y sociales, idealmente del entorno (páramo, represa de Chivor,
  clima de montaña). Preguntas de **causa-efecto**, función de una parte del
  texto e idea global.
- **Fluidez:** 95–110 palabras con vocabulario técnico escolar. Meta
  120–140 ppm.

### 9° — El texto argumentativo

**Perfil:** cierre de la básica secundaria. El estudiante debe **desarmar un
argumento**: qué defiende el autor (tesis), con qué razones (argumentos) y
para qué (intención).

- **Palabras:** conectores lógicos formales (en consecuencia, no obstante,
  por ende); vocabulario de la argumentación (refutar, sustentar, hipótesis,
  contraargumento); distinción hecho/opinión, objetivo/subjetivo.
- **Comprensión:** textos de opinión de 60–95 palabras sobre temas que les
  competen (celulares en el colegio, tareas, jóvenes y campo). Preguntas:
  ¿cuál es la tesis?, ¿cuál argumento usa?, ¿qué es hecho y qué es opinión?,
  ¿cuál es la intención del autor?
- **Fluidez:** 105–120 palabras, textos expositivo-argumentativos. Meta
  130–150 ppm.

### 10° — Lenguaje figurado y posición del autor

**Perfil:** media académica. Se lee **entre líneas y detrás de las líneas**:
figuras retóricas, connotación y la postura implícita del autor en ensayos
breves.

- **Palabras:** figuras literarias (metáfora, símil, hipérbole,
  personificación, ironía, metonimia); sentido denotativo vs. connotativo.
- **Comprensión:** ensayos breves de 60–95 palabras de tono reflexivo.
  Preguntas inferenciales-críticas: ¿qué actitud tiene el autor?, ¿qué
  critica?, ¿qué función cumple este ejemplo en el argumento?
- **Fluidez:** 120–130 palabras, prosa ensayística con subordinación
  compleja. Meta 140–160 ppm.

### 11° — Lectura crítica (perfil Saber 11)

**Perfil:** todo apunta a la prueba Saber 11 y a la vida adulta informada:
**evaluar** lo que se lee, no solo entenderlo.

- **Palabras:** vocabulario académico transversal (inferir, corroborar,
  premisa, implícito, ambiguo); polisemia según contexto; nombres de los
  errores de razonamiento más comunes (falacia ad hominem, generalización
  apresurada).
- **Comprensión:** textos que exigen juicio: identificar errores de
  razonamiento, evaluar la validez de un argumento (incluida publicidad),
  contrastar dos posturas sobre un mismo tema, reconocer el propósito
  retórico. Formato alineado con las preguntas de lectura crítica de Saber 11.
- **Fluidez:** 130–150 palabras, densidad informativa alta (divulgación,
  ensayo, actualidad digital). Meta 150–170 ppm.

---

## 3. Criterios transversales para redactar actividades

1. **Contexto cercano primero:** en 6°–8°, ambientar los textos en el mundo
   del estudiante (Valle de Tenza, Guateque, vereda, mercado, colegio) — la
   familiaridad libera memoria de trabajo para la comprensión. En 9°–11° se
   amplía deliberadamente a temas nacionales y universales, porque Saber 11
   no pregunta por el contexto local.
2. **Una habilidad por pregunta:** cada actividad de Comprensión evalúa un
   solo nivel (literal, inferencial o crítico). No mezclar.
3. **Distractores plausibles:** las opciones incorrectas deben ser errores
   que un lector real cometería (p. ej., un dato literal del texto que no
   responde la pregunta), nunca opciones absurdas que se descartan sin leer.
4. **Progresión dentro del grado:** el campo `orden` de cada actividad va de
   la más fácil a la más difícil; en Fluidez, el `ppmObjetivo` sube con el
   `orden`.
5. **Longitud controlada:** respetar los rangos de palabras de la tabla de
   fluidez; en Comprensión, el texto nunca debería superar ~100 palabras
   para no convertir la actividad en prueba de resistencia.

---

## 4. Fuentes

- [Estándares Básicos de Competencias (MEN — documento completo, PDF)](https://www.mineducacion.gov.co/1759/articles-340021_recurso_1.pdf)
- [Estándares de Lenguaje por grados (resumen navegable)](https://magalico.com/estandares-de-lenguaje-todos-los-estandares-del-lenguaje-por-grados/)
- [Derechos Básicos de Aprendizaje — Lenguaje v2 (Colombia Aprende, PDF oficial)](https://www.colombiaaprende.edu.co/sites/default/files/files_public/2022-06/DBA_Lenguaje-min.pdf)
- [Colección DBA — Colombia Aprende](https://www.colombiaaprende.edu.co/contenidos/coleccion/derechos-basicos-de-aprendizaje)
- [Velocidad lectora por curso — Smartick (referencias España)](https://www.smartick.es/blog/lectura/velocidad-lectora/)
- [Evaluación de la lectura en secundaria — SEP/Coahuila (tabla ppm México)](https://educacion.seducoahuila.gob.mx/wp-content/uploads/2023/08/05.eval-lec-secundaria.pdf)
- [Fluidez lectora: velocidad, precisión y prosodia — CLBE](https://clbe.wordpress.com/tag/palabras-por-minuto/)
