# Estudio de ortografía y gramática por grado — LectoSmart

**Propósito:** fundamentar el módulo **Escribir sin errores** (`ORTOGRAFIA`),
que separa tres cosas que hasta ahora venían mezcladas dentro de "Reconocer
palabras": **qué letra va de verdad**, **dónde va la fuerza de voz (la tilde)**
y **cómo se arma la frase**. Es la petición explícita de la docente
acompañante: poder trabajar, sobre todo en los grados más bajos, la diferencia
entre la b y la v o entre la s y la c, sin que eso se confunda con el
vocabulario ni con la comprensión.

**Para quién:** las autoras del proyecto (Danna Valentina Ramírez y Aileen
Celeste Guevara) y la docente acompañante.

> ⚠️ Este estudio se elaboró con asistencia de IA a partir de los referentes
> listados al final. Antes de usarlo en un salón real debe validarse contra la
> *Ortografía de la lengua española* (RAE/ASALE) y el criterio de la docente de
> Lengua Castellana. Lo mismo aplica a las 48 actividades sembradas
> (`backend/prisma/bancoOrtografia.js`).

---

## 1. Por qué un módulo aparte y no más actividades de "Palabras"

El módulo **Reconocer palabras** trabaja el *significado*: sinónimos,
antónimos, prefijos, familias de palabras, polisemia. Ahí la pregunta siempre
es "¿qué quiere decir esta palabra?".

**Escribir sin errores** trabaja la *forma*: la pregunta es "¿cómo se escribe
esto y por qué?". Son dos habilidades distintas y se aprenden distinto —
mezclarlas tenía dos costos concretos en la plataforma:

1. El docente no podía ver **en qué está fallando el grupo**. Un 40 % de
   acierto en "Palabras" no dice si el problema es vocabulario o si es que
   media clase escribe "hechar".
2. No había forma de dosificar: la ortografía necesita **muchas repeticiones
   cortas** del mismo tipo de error, y el banco de vocabulario no da para eso.

Al separarlo, cada actividad de ortografía guarda además un **foco**, que es lo
que permite el diagnóstico fino.

## 2. Los cuatro focos

| Foco | Qué decide la respuesta | Ejemplo típico |
|------|-------------------------|----------------|
| `letras` | Qué grafía corresponde a un sonido que se confunde | b/v, s/c/z, g/j, h muda, ll/y, r/rr |
| `tildes` | Dónde suena la fuerza de voz y si se marca | camión, lápiz, música, tú/tu |
| `gramatica` | Cómo se arma la frase y qué palabra corresponde | concordancia, porque/por qué, sino/si no, dequeísmo |
| `puntuacion` | Dónde van las pausas y qué señalan | coma de enumeración, vocativo, dos puntos, punto y coma |

La docente nombró tres (letras, entonación y gramática). Se agregó
**`puntuacion`** como cuarto foco porque a partir de 8° la coma y el punto son
parte del mismo problema de escritura y no caben con honestidad en ninguno de
los otros tres: no son una letra, no son una tilde y no son concordancia.

Sobre el nombre "entonación": lo que la tilde marca es la **sílaba tónica** —
dónde carga la voz al pronunciar. En la plataforma el foco se llama `tildes`
para no confundirlo con la prosodia (la entonación expresiva de la lectura en
voz alta), que se trabaja en el módulo de **Fluidez**.

## 3. Referentes

### 3.1 Estándares Básicos de Competencias del Lenguaje (MEN, 2006)

El factor **"Producción textual"** pide, ya desde el ciclo de 6°–7°, que el
estudiante *"aplique las normas del lenguaje escrito"* en lo que produce. La
ortografía en los estándares nunca es un fin en sí misma: aparece como
condición para que el texto propio se entienda. De ahí el criterio de redacción
número 1 de la sección 5: la palabra siempre va **dentro de una oración**.

### 3.2 Derechos Básicos de Aprendizaje — Lenguaje v2 (MEN, 2016)

Los DBA de producción escrita van en escalera:

- **6°–7°:** producir textos con la estructura y la ortografía básicas del
  español, revisando lo escrito antes de entregarlo.
- **8°–9°:** usar los recursos de cohesión (conectores, puntuación,
  referencias) para que el texto se lea como una unidad.
- **10°–11°:** producir textos formales con el registro, la puntuación y la
  norma que exige un lector académico.

Esa escalera es la que se refleja en el reparto de focos: **la letra pesa
abajo, la sintaxis y la puntuación pesan arriba.**

### 3.3 Ortografía de la lengua española (RAE/ASALE, 2010)

Es la norma de referencia. Dos decisiones de la edición de 2010 aparecen
explícitamente en el banco de 10° y 11°, porque son las que más confusión
generan entre docentes y estudiantes que aprendieron la norma anterior:

- **`solo`** se recomienda escribirlo **sin tilde** en todos los casos.
- Los **demostrativos** (este, ese, aquel) **ya no llevan tilde**, ni siquiera
  cuando funcionan como pronombres.

## 4. Qué trabaja cada grado

El reparto por grado busca que ningún grado quede sin practicar la tilde (es la
falta más transversal), pero que el peso se mueva de la letra hacia la sintaxis
a medida que se sube.

| Grado | letras | tildes | gramática | puntuación |
|-------|--------|--------|-----------|------------|
| 6°    | 4 | 2 | 2 | — |
| 7°    | 3 | 3 | 2 | — |
| 8°    | 2 | 2 | 3 | 1 |
| 9°    | — | 2 | 4 | 2 |
| 10°   | — | 2 | 4 | 2 |
| 11°   | 1 | 1 | 3 | 3 |

### 6° — La letra que va

**Perfil:** llegan de primaria escribiendo como oyen. Prioridad absoluta: los
pares de letras que suenan igual y la idea de que la tilde marca la fuerza de
voz.

- **Letras:** b/v en el pasado de *ir* (iba), v/b en pares reales
  (vaca/baca), h muda en el verbo *hacer*, s/z en pares con significado
  distinto (casa/caza).
- **Tildes:** reconocer dónde carga la voz en palabras agudas terminadas en n
  (camión) y graves terminadas en z (lápiz). Todavía no se pide recitar la
  regla, se pide reconocer la palabra bien escrita.
- **Gramática:** concordancia de número dentro de la frase completa
  (los cuadernos nuevos **están**) y mayúscula inicial y de nombre propio.

### 7° — La regla de acentuación, ya explícita

**Perfil:** ya distinguen los pares básicos; es el momento de nombrar la regla.

- **Letras:** g/j ante e/i (gente vs. jirafa — se enseña como palabra que se
  aprende, no como regla mecánica), j en la familia de *trabajo*, h en el verbo
  *haber* (hubo).
- **Tildes:** las tres reglas completas — agudas con tilde si terminan en n, s
  o vocal; graves con tilde si NO; esdrújulas siempre.
- **Gramática:** primer homófono que depende del verbo (tuvo/tubo) y
  concordancia cuando hay una frase larga entre el sujeto y el verbo, que es
  donde se rompe.

### 8° — Homófonos y tilde diacrítica

**Perfil:** transición al texto académico. Aparece la primera puntuación.

- **Letras:** echar/hechar (la h que sobra) y hierba/hierva.
- **Tildes:** tilde diacrítica en los pares más frecuentes (tú/tu, él/el),
  que es la primera vez que la tilde no depende de la sílaba sino de la
  **función** de la palabra.
- **Gramática:** vaya/valla/baya, a ver/haber, hay/ahí/ay.
- **Puntuación:** coma de enumeración, incluida la regla de que antes de la
  «y» final no va coma.

### 9° — La palabra que cambia según su función

**Perfil:** cierre de la básica. El estudiante ya no elige una letra: elige
entre dos escrituras que dependen de lo que la frase significa.

- **Tildes:** por qué / porque / porqué, y la tilde del interrogativo
  indirecto (*no sé cuándo llega*), que es la que más se pierde.
- **Gramática:** sino/si no, también/tan bien, haya/halla/allá.
- **Puntuación:** conectores con punto y coma antes y coma después, y la coma
  del vocativo (*Ven, Ana*), que muestra que la coma cambia el sentido.

### 10° — Sintaxis: los errores que vienen del habla

**Perfil:** media académica. El foco pasa a los errores que el estudiante no
oye como errores porque los dice todos los días.

- **Gramática:** *haber* impersonal siempre en singular (hubo problemas, no
  "hubieron"), dequeísmo (*pienso de que*), queísmo (*me alegro que*) y *cuyo*
  frente al *que su* del habla.
- **Tildes:** aún/aun y la norma actual de *solo*.
- **Puntuación:** dos puntos que anuncian y punto y coma entre bloques que ya
  usan comas.

### 11° — Registro formal y puntuación del texto largo

**Perfil:** escribe para un lector académico (y presenta Saber 11).

- **Letras/léxico:** ortografía del vocabulario académico (*a través*).
- **Gramática:** asimismo / a sí mismo, *con base en* frente al calco *en base
  a*, mayúsculas en cargos y disciplinas.
- **Tildes:** demostrativos sin tilde (norma 2010).
- **Puntuación:** comillas y dos puntos para la cita textual, punto después
  del paréntesis, y la coma que **nunca** va entre el sujeto y el verbo.

## 5. Criterios para redactar actividades nuevas

1. **Siempre en contexto.** La palabra va dentro de una oración que obligue a
   decidir por el sentido, no por memoria visual. "«Mi abuela ___ al mercado»"
   enseña; "¿iba o iva?" solo evalúa.
2. **Un solo foco por actividad.** Si la respuesta depende a la vez de una
   letra y de una tilde, la estadística del docente deja de servir.
3. **Distractores reales.** Las opciones incorrectas deben ser la falta que un
   estudiante comete de verdad (hechar, aver, hubieron), nunca palabras
   inventadas que se descartan sin pensar.
4. **La explicación enseña la regla, no repite la respuesta.** Debe decir por
   qué, en una o dos frases, y cuando existe el par confuso, decir también qué
   significa la otra opción ("«baca» es la parrilla del carro").
5. **Contexto cercano en 6°–8°** (vereda, mercado, colegio, Valle de Tenza);
   en 9°–11° se amplía a contextos académicos y formales, que es donde esas
   normas se aplican de verdad.
6. **Progresión dentro del grado:** el campo `orden` va de lo más mecánico a lo
   que exige más razonamiento.

## 6. Fuentes

- [Estándares Básicos de Competencias (MEN — documento completo, PDF)](https://www.mineducacion.gov.co/1759/articles-340021_recurso_1.pdf)
- [Derechos Básicos de Aprendizaje — Lenguaje v2 (Colombia Aprende, PDF oficial)](https://www.colombiaaprende.edu.co/sites/default/files/files_public/2022-06/DBA_Lenguaje-min.pdf)
- [Ortografía de la lengua española (RAE/ASALE) — presentación oficial](https://www.rae.es/obras-academicas/ortografia/ortografia-2010)
- [Diccionario panhispánico de dudas (RAE) — dequeísmo, queísmo, haber impersonal](https://www.rae.es/dpd/)
- [Estudio de contenidos por grado de LectoSmart](estudio-contenidos-por-grado.md) — el equivalente para los otros tres módulos
