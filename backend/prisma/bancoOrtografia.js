/* ============================================================
   BANCO DEL MÓDULO ORTOGRAFIA (6° a 11°) — 8 actividades por grado
   ------------------------------------------------------------
   Va en archivo aparte del BANCO de seed.js por tamaño (mismo
   patrón que nivelesComprension.js). La progresión y el reparto
   de focos por grado están justificados en
   docs/estudio-ortografia-y-gramatica.md.

   Estructura: { instruccion, opciones: [string], respuesta: string,
                 explicacion: string, foco: string }
   El "foco" distingue lo que la docente pidió separar: qué letra va
   de verdad (letras), dónde suena la fuerza de voz (tildes), cómo se
   arma la frase (gramatica) y las pausas (puntuacion).

   Redactado con asistencia de IA siguiendo la Ortografía de la lengua
   española (RAE/ASALE, 2010). DEBE revisarse con la docente de Lengua
   Castellana antes de usarse en un salón real.
   ============================================================ */

const BANCO_ORTOGRAFIA = {
  "6°": [
    {
      titulo: "La b de 'iba'",
      contenido: {
        instruccion: "¿Cómo se completa? «Mi abuela ___ al mercado de Guateque todos los sábados.»",
        opciones: ["iba", "iva", "hiba"],
        respuesta: "iba",
        explicacion: "El pasado del verbo ir se escribe con b: iba, ibas, íbamos. «Iva» no existe y a «hiba» le sobra la h.",
        foco: "letras",
      },
    },
    {
      titulo: "¿Vaca o baca?",
      contenido: {
        instruccion: "¿Cómo se completa? «En la finca de mi tío hay una ___ que da mucha leche.»",
        opciones: ["vaca", "baca", "vacca"],
        respuesta: "vaca",
        explicacion: "El animal es «vaca», con v. La «baca» con b es la parrilla que va en el techo del carro.",
        foco: "letras",
      },
    },
    {
      titulo: "La h de 'hace'",
      contenido: {
        instruccion: "¿Cómo se completa? «Hoy ___ mucho frío en el páramo.»",
        opciones: ["hace", "ase", "hase"],
        respuesta: "hace",
        explicacion: "El verbo hacer siempre lleva h: hace, hacía, hicimos. La h no suena, pero se escribe.",
        foco: "letras",
      },
    },
    {
      titulo: "¿Casa o caza?",
      contenido: {
        instruccion: "¿Cómo se completa? «Después del colegio me voy para la ___ de mi mamá.»",
        opciones: ["casa", "caza", "cassa"],
        respuesta: "casa",
        explicacion: "«Casa» con s es la vivienda; «caza» con z es perseguir animales. Suenan igual, pero significan cosas distintas.",
        foco: "letras",
      },
    },
    {
      titulo: "La tilde de 'camión'",
      contenido: {
        instruccion: "¿Cuál palabra está bien escrita?",
        opciones: ["camión", "camion", "cámion"],
        respuesta: "camión",
        explicacion: "La fuerza de voz de «camión» va en la última sílaba y la palabra termina en n, por eso lleva tilde en la o.",
        foco: "tildes",
      },
    },
    {
      titulo: "La tilde de 'lápiz'",
      contenido: {
        instruccion: "¿Cómo se completa? «Se me perdió el ___ en el salón.»",
        opciones: ["lápiz", "lapíz", "lapiz"],
        respuesta: "lápiz",
        explicacion: "En «lápiz» la fuerza de voz va en «lá» y la palabra termina en z, así que lleva tilde en la a.",
        foco: "tildes",
      },
    },
    {
      titulo: "Uno o varios: el plural completo",
      contenido: {
        instruccion: "¿Cuál oración está bien escrita?",
        opciones: [
          "Los cuadernos nuevos están en la mesa.",
          "Los cuaderno nuevo están en la mesa.",
          "Los cuadernos nuevo está en la mesa.",
        ],
        respuesta: "Los cuadernos nuevos están en la mesa.",
        explicacion: "Si lo que se nombra está en plural («los cuadernos»), el adjetivo y el verbo también van en plural: nuevos, están.",
        foco: "gramatica",
      },
    },
    {
      titulo: "Mayúscula al empezar y en los nombres",
      contenido: {
        instruccion: "¿Cuál oración está bien escrita?",
        opciones: [
          "Mi prima Laura vive en Guateque.",
          "mi prima laura vive en guateque.",
          "Mi prima laura vive en Guateque.",
        ],
        respuesta: "Mi prima Laura vive en Guateque.",
        explicacion: "Van en mayúscula la primera palabra de la oración y los nombres propios de personas y de lugares: Laura, Guateque.",
        foco: "gramatica",
      },
    },
  ],

  "7°": [
    {
      titulo: "La g de 'gente'",
      contenido: {
        instruccion: "¿Cómo se completa? «En la plaza había mucha ___ el día del mercado.»",
        opciones: ["gente", "jente", "guente"],
        respuesta: "gente",
        explicacion: "Antes de e y de i, la g y la j suenan igual, por eso toca aprender la palabra: gente, general y gigante van con g; jefe, jirafa y jinete van con j.",
        foco: "letras",
      },
    },
    {
      titulo: "La j de 'trabajo'",
      contenido: {
        instruccion: "¿Cómo se completa? «Mi papá sale temprano para el ___.»",
        opciones: ["trabajo", "trabago", "trabaho"],
        respuesta: "trabajo",
        explicacion: "«Trabajo» y toda su familia (trabajar, trabajador, trabajamos) se escriben con j.",
        foco: "letras",
      },
    },
    {
      titulo: "La h de 'hubo'",
      contenido: {
        instruccion: "¿Cómo se completa? «El año pasado ___ una feria en el colegio.»",
        opciones: ["hubo", "ubo", "huvo"],
        respuesta: "hubo",
        explicacion: "Es del verbo haber, que lleva h al principio y b en el medio: hubo, había, habrá.",
        foco: "letras",
      },
    },
    {
      titulo: "Agudas: cuándo llevan tilde",
      contenido: {
        instruccion: "¿Cuál palabra está bien escrita?",
        opciones: ["corazón", "corazon", "córazon"],
        respuesta: "corazón",
        explicacion: "«Corazón» es aguda (la fuerza va en la última sílaba) y termina en n. Las agudas llevan tilde cuando terminan en n, en s o en vocal.",
        foco: "tildes",
      },
    },
    {
      titulo: "Graves: cuándo NO llevan tilde",
      contenido: {
        instruccion: "¿Cuál palabra está bien escrita?",
        opciones: ["examen", "exámen", "examén"],
        respuesta: "examen",
        explicacion: "«Examen» es grave y termina en n, y las graves solo llevan tilde cuando NO terminan en n, s o vocal. Ojo: el plural «exámenes» sí la lleva.",
        foco: "tildes",
      },
    },
    {
      titulo: "Todas las esdrújulas llevan tilde",
      contenido: {
        instruccion: "¿Cuál palabra está bien escrita?",
        opciones: ["música", "musica", "musíca"],
        respuesta: "música",
        explicacion: "La fuerza va en la antepenúltima sílaba («mú»), y todas las esdrújulas llevan tilde, sin excepción.",
        foco: "tildes",
      },
    },
    {
      titulo: "¿Tuvo o tubo?",
      contenido: {
        instruccion: "¿Cómo se completa? «Mi hermano ___ que madrugar para llegar al colegio.»",
        opciones: ["tuvo", "tubo", "tuvó"],
        respuesta: "tuvo",
        explicacion: "«Tuvo» es del verbo tener; «tubo» con b es el objeto hueco por donde pasa el agua.",
        foco: "gramatica",
      },
    },
    {
      titulo: "El verbo concuerda con quien hace la acción",
      contenido: {
        instruccion: "¿Cuál oración está bien escrita?",
        opciones: [
          "Los estudiantes del grado séptimo llegaron temprano.",
          "Los estudiantes del grado séptimo llegó temprano.",
          "Los estudiante del grado séptimo llegaron temprano.",
        ],
        respuesta: "Los estudiantes del grado séptimo llegaron temprano.",
        explicacion: "Quienes llegan son «los estudiantes», en plural, así que el verbo va en plural: llegaron. Lo que va en medio no cambia esa concordancia.",
        foco: "gramatica",
      },
    },
  ],

  "8°": [
    {
      titulo: "¿Echar o hechar?",
      contenido: {
        instruccion: "¿Cómo se completa? «Voy a ___ la basura antes de salir.»",
        opciones: ["echar", "hechar", "echár"],
        respuesta: "echar",
        explicacion: "«Echar» (tirar, poner) nunca lleva h. «Hechar» no existe; lo que sí existe es «hecho», del verbo hacer.",
        foco: "letras",
      },
    },
    {
      titulo: "¿Hierba o hierva?",
      contenido: {
        instruccion: "¿Cómo se completa? «Las vacas comen ___ en el potrero.»",
        opciones: ["hierba", "hierva", "yerva"],
        respuesta: "hierba",
        explicacion: "«Hierba» con b es la planta; «hierva» con v es del verbo hervir (esperar a que el agua hierva).",
        foco: "letras",
      },
    },
    {
      titulo: "Tilde diacrítica: tú y tu",
      contenido: {
        instruccion: "¿Cómo se completa? «___ sabes que ___ cuaderno quedó en el salón.»",
        opciones: ["Tú / tu", "Tu / tú", "Tú / tú"],
        respuesta: "Tú / tu",
        explicacion: "«Tú» con tilde nombra a la persona (tú sabes); «tu» sin tilde indica de quién es algo (tu cuaderno).",
        foco: "tildes",
      },
    },
    {
      titulo: "Tilde diacrítica: él y el",
      contenido: {
        instruccion: "¿Cómo se completa? «___ dijo que ___ partido empieza a las tres.»",
        opciones: ["Él / el", "El / él", "Él / él"],
        respuesta: "Él / el",
        explicacion: "«Él» con tilde reemplaza a la persona; «el» sin tilde acompaña al sustantivo (el partido).",
        foco: "tildes",
      },
    },
    {
      titulo: "¿Vaya, valla o baya?",
      contenido: {
        instruccion: "¿Cómo se completa? «Ojalá ___ mucha gente a la izada de bandera.»",
        opciones: ["vaya", "valla", "baya"],
        respuesta: "vaya",
        explicacion: "«Vaya» es del verbo ir; «valla» es el cerco o el aviso publicitario, y «baya» es un fruto pequeño.",
        foco: "gramatica",
      },
    },
    {
      titulo: "¿A ver o haber?",
      contenido: {
        instruccion: "¿Cómo se completa? «Vamos ___ qué dice la profesora.»",
        opciones: ["a ver", "haber", "aver"],
        respuesta: "a ver",
        explicacion: "«A ver» va separado y funciona cuando se puede cambiar por «a mirar». «Haber» es el verbo: «debe haber alguien».",
        foco: "gramatica",
      },
    },
    {
      titulo: "Hay, ahí y ay",
      contenido: {
        instruccion: "¿Cómo se completa? «___ no ___ nadie a esta hora.»",
        opciones: ["Ahí / hay", "Hay / ahí", "Ay / hay"],
        respuesta: "Ahí / hay",
        explicacion: "«Ahí» señala un lugar, «hay» es del verbo haber (existe) y «ay» es la queja. La frase habla de un lugar y de lo que existe en él.",
        foco: "gramatica",
      },
    },
    {
      titulo: "La coma de la enumeración",
      contenido: {
        instruccion: "¿Cuál oración está bien puntuada?",
        opciones: [
          "Llevé cuaderno, lápiz, regla y borrador.",
          "Llevé cuaderno lápiz regla y borrador.",
          "Llevé cuaderno, lápiz, regla, y borrador.",
        ],
        respuesta: "Llevé cuaderno, lápiz, regla y borrador.",
        explicacion: "La coma separa los elementos de una enumeración, pero antes de la «y» que cierra la lista no se pone coma.",
        foco: "puntuacion",
      },
    },
  ],

  "9°": [
    {
      titulo: "¿Porque o por qué?",
      contenido: {
        instruccion: "¿Cómo se completa? «No vino ___ se enfermó.»",
        opciones: ["porque", "por que", "por qué"],
        respuesta: "porque",
        explicacion: "«Porque» junto y sin tilde da la causa de algo. «Por qué» separado y con tilde sirve para preguntar.",
        foco: "gramatica",
      },
    },
    {
      titulo: "El 'por qué' de la pregunta",
      contenido: {
        instruccion: "¿Cómo se completa? «¿___ no viniste ayer?»",
        opciones: ["Por qué", "Porque", "Porqué"],
        respuesta: "Por qué",
        explicacion: "En preguntas y exclamaciones va separado y con tilde. «El porqué», junto y con tilde, es un sustantivo: «no sé el porqué de su decisión».",
        foco: "tildes",
      },
    },
    {
      titulo: "¿Sino o si no?",
      contenido: {
        instruccion: "¿Cómo se completa? «No quiero ir al cine, ___ al parque.»",
        opciones: ["sino", "si no", "sinó"],
        respuesta: "sino",
        explicacion: "«Sino» junto opone dos ideas (no esto, sino aquello). «Si no» separado plantea una condición: «si no vienes, empezamos sin ti».",
        foco: "gramatica",
      },
    },
    {
      titulo: "¿También o tan bien?",
      contenido: {
        instruccion: "¿Cómo se completa? «Mi hermana ___ estudia los sábados.»",
        opciones: ["también", "tan bien", "tanbién"],
        respuesta: "también",
        explicacion: "«También» junto significa «además». «Tan bien» separado compara qué tan bien se hace algo: «canta tan bien como ella».",
        foco: "gramatica",
      },
    },
    {
      titulo: "¿Haya, halla o allá?",
      contenido: {
        instruccion: "¿Cómo se completa? «Espero que ___ suficientes sillas para todos.»",
        opciones: ["haya", "halla", "allá"],
        respuesta: "haya",
        explicacion: "«Haya» es del verbo haber; «halla» es de hallar (encontrar) y «allá» señala un lugar lejano.",
        foco: "gramatica",
      },
    },
    {
      titulo: "La tilde de la pregunta escondida",
      contenido: {
        instruccion: "¿Cuál oración está bien escrita?",
        opciones: [
          "No sé cuándo llega el bus.",
          "No sé cuando llega el bus.",
          "No se cuándo llega el bus.",
        ],
        respuesta: "No sé cuándo llega el bus.",
        explicacion: "Aunque no haya signos de interrogación, «cuándo» lleva tilde porque adentro hay una pregunta. Y «sé» del verbo saber también la lleva.",
        foco: "tildes",
      },
    },
    {
      titulo: "El conector y sus pausas",
      contenido: {
        instruccion: "¿Cuál oración está bien puntuada?",
        opciones: [
          "Llegamos tarde; por lo tanto, no entramos.",
          "Llegamos tarde por lo tanto no entramos.",
          "Llegamos tarde por lo tanto, no entramos.",
        ],
        respuesta: "Llegamos tarde; por lo tanto, no entramos.",
        explicacion: "Conectores como «por lo tanto» cierran una idea y abren otra: llevan punto y coma (o punto) antes y coma después.",
        foco: "puntuacion",
      },
    },
    {
      titulo: "La coma que llama a alguien",
      contenido: {
        instruccion: "Queremos pedirle a Ana que venga. ¿Cuál oración lo dice bien?",
        opciones: ["Ven, Ana.", "Ven Ana.", "Ven; Ana."],
        respuesta: "Ven, Ana.",
        explicacion: "Cuando llamamos a alguien por su nombre dentro de la frase, ese nombre se separa con coma. Sin la coma parece que «ven» y «Ana» fueran una sola idea.",
        foco: "puntuacion",
      },
    },
  ],

  "10°": [
    {
      titulo: "Haber que indica existencia",
      contenido: {
        instruccion: "¿Cómo se completa? «El año pasado ___ muchos problemas con el transporte.»",
        opciones: ["hubo", "hubieron", "habían"],
        respuesta: "hubo",
        explicacion: "Cuando «haber» indica que algo existe, va siempre en singular: hubo problemas, había estudiantes. «Hubieron muchos problemas» es incorrecto.",
        foco: "gramatica",
      },
    },
    {
      titulo: "Dequeísmo: el 'de' que sobra",
      contenido: {
        instruccion: "¿Cuál oración está bien escrita?",
        opciones: [
          "Pienso que la reunión será mañana.",
          "Pienso de que la reunión será mañana.",
          "Pienso a que la reunión será mañana.",
        ],
        respuesta: "Pienso que la reunión será mañana.",
        explicacion: "«Pensar» no pide «de»: se piensa algo. Para comprobarlo se pregunta ¿qué pienso?, no ¿de qué pienso?",
        foco: "gramatica",
      },
    },
    {
      titulo: "Queísmo: el 'de' que falta",
      contenido: {
        instruccion: "¿Cuál oración está bien escrita?",
        opciones: [
          "Me alegro de que hayas venido.",
          "Me alegro que hayas venido.",
          "Me alegro a que hayas venido.",
        ],
        respuesta: "Me alegro de que hayas venido.",
        explicacion: "«Alegrarse» sí pide «de»: uno se alegra DE algo. Quitarle el «de» es queísmo, el error contrario al dequeísmo.",
        foco: "gramatica",
      },
    },
    {
      titulo: "Cuyo: el dueño y lo suyo",
      contenido: {
        instruccion: "¿Cuál oración está bien escrita?",
        opciones: [
          "Es el autor cuyo libro leímos en clase.",
          "Es el autor que su libro leímos en clase.",
          "Es el autor de quien su libro leímos en clase.",
        ],
        respuesta: "Es el autor cuyo libro leímos en clase.",
        explicacion: "«Cuyo» une en una sola palabra al poseedor y a lo poseído. Cambiarlo por «que su» es un error muy frecuente al hablar que no debe pasar al texto escrito.",
        foco: "gramatica",
      },
    },
    {
      titulo: "¿Aún o aun?",
      contenido: {
        instruccion: "¿Cómo se completa? «___ no ha llegado la respuesta del rector.»",
        opciones: ["Aún", "Aun", "Aún que"],
        respuesta: "Aún",
        explicacion: "«Aún» con tilde equivale a «todavía». «Aun» sin tilde equivale a «incluso»: «aun los más rápidos se cansaron».",
        foco: "tildes",
      },
    },
    {
      titulo: "La norma actual de 'solo'",
      contenido: {
        instruccion: "¿Cuál oración sigue la recomendación actual de la RAE?",
        opciones: [
          "Solo quedaban dos cupos.",
          "Sólo quedaban dos cupos.",
          "Solo quedában dos cupos.",
        ],
        respuesta: "Solo quedaban dos cupos.",
        explicacion: "Desde 2010 la RAE recomienda escribir «solo» sin tilde en todos los casos; la tilde solo se admite si de verdad la frase queda ambigua.",
        foco: "tildes",
      },
    },
    {
      titulo: "Los dos puntos que anuncian",
      contenido: {
        instruccion: "¿Cuál oración está bien puntuada?",
        opciones: [
          "Trajo lo necesario: carpa, linterna y comida.",
          "Trajo lo necesario, carpa, linterna y comida.",
          "Trajo lo necesario; carpa, linterna y comida.",
        ],
        respuesta: "Trajo lo necesario: carpa, linterna y comida.",
        explicacion: "Los dos puntos anuncian lo que viene enseguida: una enumeración, un ejemplo o la explicación de lo que se acaba de decir.",
        foco: "puntuacion",
      },
    },
    {
      titulo: "Punto y coma entre bloques con comas",
      contenido: {
        instruccion: "¿Cuál oración está bien puntuada?",
        opciones: [
          "En la mesa había frutas, verduras y pan; en la nevera, jugo y leche.",
          "En la mesa había frutas, verduras y pan, en la nevera, jugo y leche.",
          "En la mesa había frutas verduras y pan; en la nevera jugo y leche.",
        ],
        respuesta: "En la mesa había frutas, verduras y pan; en la nevera, jugo y leche.",
        explicacion: "El punto y coma separa dos bloques que por dentro ya usan comas; así se distingue la pausa grande de las pequeñas.",
        foco: "puntuacion",
      },
    },
  ],

  "11°": [
    {
      titulo: "'A través' en el texto académico",
      contenido: {
        instruccion: "¿Cómo se completa? «La información se recogió ___ de encuestas y entrevistas.»",
        opciones: ["a través", "através", "atravez"],
        respuesta: "a través",
        explicacion: "«A través» se escribe separado y con s al final. «Através» y «atravez» no existen en español.",
        foco: "letras",
      },
    },
    {
      titulo: "Asimismo, así mismo y a sí mismo",
      contenido: {
        instruccion: "¿Cómo se completa? «El informe presenta los datos; ___, propone tres soluciones.»",
        opciones: ["asimismo", "a sí mismo", "así mimo"],
        respuesta: "asimismo",
        explicacion: "«Asimismo» junto significa «además». «A sí mismo» son tres palabras y se refiere a uno mismo: «se exige a sí mismo».",
        foco: "gramatica",
      },
    },
    {
      titulo: "'Con base en' y no 'en base a'",
      contenido: {
        instruccion: "¿Cuál forma es la adecuada en un texto formal?",
        opciones: [
          "Con base en los resultados, se concluye que…",
          "En base a los resultados, se concluye que…",
          "Con base a los resultados, se concluye que…",
        ],
        respuesta: "Con base en los resultados, se concluye que…",
        explicacion: "La forma recomendada es «con base en». «En base a» es un calco que conviene evitar en escritos académicos.",
        foco: "gramatica",
      },
    },
    {
      titulo: "Mayúsculas en cargos y materias",
      contenido: {
        instruccion: "¿Cuál oración sigue la norma?",
        opciones: [
          "El rector habló de historia y de matemáticas.",
          "El Rector habló de Historia y de Matemáticas.",
          "El rector habló de Historia y de matemáticas.",
        ],
        respuesta: "El rector habló de historia y de matemáticas.",
        explicacion: "Los cargos (rector, presidente, ministro) y los nombres de las disciplinas van en minúscula cuando no forman parte de un nombre propio, como «Facultad de Matemáticas».",
        foco: "gramatica",
      },
    },
    {
      titulo: "Los demostrativos ya no se tildan",
      contenido: {
        instruccion: "¿Cuál oración sigue la norma actual?",
        opciones: [
          "Este argumento es el más sólido de todos.",
          "Éste argumento es el más sólido de todos.",
          "Este argumento es el mas sólido de todos.",
        ],
        respuesta: "Este argumento es el más sólido de todos.",
        explicacion: "Los demostrativos (este, ese, aquel) ya no llevan tilde, ni siquiera cuando van solos. En cambio «más» de cantidad sí la lleva.",
        foco: "tildes",
      },
    },
    {
      titulo: "Cómo se marca una cita textual",
      contenido: {
        instruccion: "¿Cuál oración cita correctamente al autor?",
        opciones: [
          "El autor afirma: «la lectura crítica se enseña».",
          "El autor afirma: la lectura crítica se enseña.",
          "El autor afirma «que la lectura crítica se enseña».",
        ],
        respuesta: "El autor afirma: «la lectura crítica se enseña».",
        explicacion: "La cita textual se anuncia con dos puntos y va entre comillas. Si en cambio se parafrasea con «que», no se usan comillas.",
        foco: "puntuacion",
      },
    },
    {
      titulo: "El punto va después del paréntesis",
      contenido: {
        instruccion: "¿Cuál oración está bien puntuada?",
        opciones: [
          "El resultado fue claro (ver tabla 2).",
          "El resultado fue claro (ver tabla 2.)",
          "El resultado fue claro. (ver tabla 2)",
        ],
        respuesta: "El resultado fue claro (ver tabla 2).",
        explicacion: "El paréntesis se cierra primero y el punto va después, porque el punto cierra toda la oración, no lo que está entre paréntesis.",
        foco: "puntuacion",
      },
    },
    {
      titulo: "La coma que nunca va",
      contenido: {
        instruccion: "¿Cuál oración está bien puntuada?",
        opciones: [
          "Los estudiantes de undécimo presentaron el proyecto.",
          "Los estudiantes de undécimo, presentaron el proyecto.",
          "Los estudiantes, de undécimo presentaron el proyecto.",
        ],
        respuesta: "Los estudiantes de undécimo presentaron el proyecto.",
        explicacion: "Entre quien hace la acción y el verbo no va coma, por larga que sea la frase. Es uno de los errores más comunes en textos largos.",
        foco: "puntuacion",
      },
    },
  ],
};

module.exports = { BANCO_ORTOGRAFIA };
