const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const docentes = [
  { nombre: "Martha Bernal", usuario: "mbernal", password: "docente123" },
];

// El usuario/contraseña del administrador se toman de variables de
// entorno (ADMIN_USUARIO/ADMIN_PASSWORD) para no dejar una contraseña
// real escrita en el código. En producción (Render) se definen con un
// valor real; el valor por defecto de aquí abajo solo aplica si no están
// definidas (desarrollo local).
const administradores = [
  {
    nombre: "Administrador",
    usuario: process.env.ADMIN_USUARIO || "admin",
    password: process.env.ADMIN_PASSWORD || "R0CK3T",
  },
];

const logros = [
  {
    codigo: "primera_lectura",
    nombre: "Primera lectura",
    icono: "🏅",
    descripcion: "Completa tu primera actividad",
    criterio: JSON.stringify({ tipo: "intentos_completados", valor: 1 }),
  },
  {
    codigo: "racha_3_dias",
    nombre: "Racha de 3 días",
    icono: "🔥",
    descripcion: "Practica 3 días seguidos",
    criterio: JSON.stringify({ tipo: "racha", valor: 3 }),
  },
  {
    codigo: "diez_actividades",
    nombre: "10 actividades",
    icono: "🚀",
    descripcion: "Completa 10 actividades",
    criterio: JSON.stringify({ tipo: "intentos_completados", valor: 10 }),
  },
  {
    codigo: "nivel_5",
    nombre: "Nivel 5",
    icono: "👑",
    descripcion: "Alcanza el nivel 5",
    criterio: JSON.stringify({ tipo: "nivel", valor: 5 }),
  },
];

/* ============================================================
   BANCO DE CONTENIDO POR GRADO (6° a 11°)
   ------------------------------------------------------------
   Redactado con asistencia de IA a partir de los Estándares
   Básicos de Competencias del Lenguaje (MEN) para secundaria.
   Debe revisarse/ajustarse por las autoras o la docente antes
   de usarse en un salón real (ver CLAUDE.md).

   PALABRAS:    { instruccion, opciones: [string], respuesta: string }
   COMPRENSION: { texto, pregunta, opciones: [string], respuesta: number }
   FLUIDEZ:     { texto, palabras: number, ppmObjetivo: number }
   ============================================================ */

const BANCO = {
  "6°": {
    PALABRAS: [
      {
        titulo: "Sinónimo de 'veloz'",
        contenido: {
          instruccion: "¿Cuál es un sinónimo de 'veloz'?",
          opciones: ["rápido", "lento", "tranquilo"],
          respuesta: "rápido",
        },
      },
      {
        titulo: "Ortografía: exhausto",
        contenido: {
          instruccion: "¿Cuál palabra está bien escrita?",
          opciones: ["exhausto", "esausto", "exsausto"],
          respuesta: "exhausto",
        },
      },
      {
        titulo: "Antónimo de 'generoso'",
        contenido: {
          instruccion: "¿Cuál es un antónimo de 'generoso'?",
          opciones: ["tacaño", "amable", "alegre"],
          respuesta: "tacaño",
        },
      },
      {
        titulo: "Ortografía: excavación",
        contenido: {
          instruccion: "¿Cuál palabra está bien escrita?",
          opciones: ["escavación", "exkavación", "excavación"],
          respuesta: "excavación",
        },
      },
    ],
    COMPRENSION: [
      {
        titulo: "El colibrí del Valle de Tenza",
        contenido: {
          texto:
            "En las montañas del Valle de Tenza vive un colibrí de plumas verdes y brillantes. Cada mañana visita las flores del jardín de doña Rosa para tomar su néctar. Los niños del pueblo lo llaman “Chispa”, porque vuela tan rápido que parece un rayo de luz entre los árboles.",
          pregunta: "¿Por qué los niños llaman “Chispa” al colibrí?",
          opciones: [
            "Porque tiene plumas de color amarillo",
            "Porque vuela muy rápido, como un rayo de luz",
            "Porque vive en la casa de doña Rosa",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "La huerta escolar",
        contenido: {
          texto:
            "En el colegio de Guateque, los estudiantes de sexto grado sembraron una huerta con lechuga, cilantro y rábanos. Cada semana se turnan para regar las plantas y quitar las malezas. La profesora Martha dice que la huerta les enseña a tener paciencia, porque las verduras no crecen de un día para otro.",
          pregunta: "¿Cuál es la idea principal del texto?",
          opciones: [
            "Los estudiantes sembraron una huerta y aprenden paciencia cuidándola",
            "Las verduras crecen en un solo día",
            "El colegio queda en Guateque",
          ],
          respuesta: 0,
        },
      },
      {
        titulo: "El perro guardián de la finca",
        contenido: {
          texto:
            "Rocco es un perro pastor que vive en una finca cerca del Valle de Tenza. Todas las noches recorre el corral y ladra si escucha algo extraño cerca de las gallinas. Una noche ahuyentó a una zorra que intentaba entrar al gallinero. Desde entonces, don Álvaro dice que Rocco vale más que cualquier cerca.",
          pregunta: "¿Por qué don Álvaro valora tanto a Rocco?",
          opciones: [
            "Porque juega con las gallinas todo el día",
            "Porque protege la finca de los animales que quieren entrar",
            "Porque es un perro muy grande",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "Un día de mercado en Guateque",
        contenido: {
          texto:
            "Los sábados, la plaza de Guateque se llena de gente desde temprano. Los campesinos llegan con canastos de papa, arracacha y frutas de clima frío. Los niños ayudan a acomodar los productos mientras los adultos negocian los precios. Al mediodía, casi todo se ha vendido y las familias regresan a sus veredas.",
          pregunta: "¿Qué sucede en la plaza de Guateque los sábados?",
          opciones: [
            "Se hace un mercado donde los campesinos venden sus productos",
            "Los niños juegan fútbol todo el día",
            "Los campesinos compran ropa nueva",
          ],
          respuesta: 0,
        },
      },
    ],
    FLUIDEZ: [
      {
        titulo: "El madrugón del ordeño",
        contenido: {
          texto:
            "Todos los días, antes de que salga el sol, don Pedro se levanta para ordeñar las vacas. Camina hasta el establo con un balde en la mano y un poncho grueso para el frío de la madrugada. Las vacas ya lo esperan, acostumbradas a su rutina. En menos de una hora, el balde está lleno de leche fresca que luego se lleva al pueblo para vender.",
          palabras: 75,
          ppmObjetivo: 95,
        },
      },
      {
        titulo: "El puesto de arepas",
        contenido: {
          texto:
            "Cada mañana, doña Consuelo instala su puesto de arepas frente a la escuela. Las hace con maíz molido a mano y las asa sobre un fogón de leña hasta que quedan doradas. Los estudiantes hacen fila antes de entrar a clase, y ella siempre tiene una palabra amable para cada uno mientras les entrega su desayuno envuelto en una hoja.",
          palabras: 68,
          ppmObjetivo: 100,
        },
      },
      {
        titulo: "La feria de animales",
        contenido: {
          texto:
            "Una vez al mes, el pueblo organiza una feria donde los campesinos venden e intercambian gallinas, cerdos y terneros. Desde temprano llegan camiones cargados de animales, y el ruido de mugidos y cacareos se mezcla con las voces de los vendedores anunciando sus precios. Para muchos niños, ir a la feria con sus padres es una de las salidas más esperadas del mes.",
          palabras: 78,
          ppmObjetivo: 105,
        },
      },
      {
        titulo: "El paseo de fin de año",
        contenido: {
          texto:
            "Al terminar el año escolar, los estudiantes de sexto grado organizaron un paseo a una quebrada cercana. Llevaron sombrillas para el sol, sancocho preparado por las mamás y un balón para jugar en la orilla. Aunque el agua estaba helada, casi todos se metieron a nadar, y al final del día regresaron cansados pero felices de haber compartido con sus compañeros.",
          palabras: 80,
          ppmObjetivo: 110,
        },
      },
    ],
  },

  "7°": {
    PALABRAS: [
      {
        titulo: "Familia de 'tierra'",
        contenido: {
          instruccion: "¿Cuál palabra pertenece a la familia de 'tierra'?",
          opciones: ["terrestre", "terrible", "tienda"],
          respuesta: "terrestre",
        },
      },
      {
        titulo: "Prefijo in-",
        contenido: {
          instruccion: "El prefijo 'in-' en la palabra 'inmóvil' significa:",
          opciones: ["no", "dentro", "muy"],
          respuesta: "no",
        },
      },
      {
        titulo: "Derivado de 'flor'",
        contenido: {
          instruccion: "¿Cuál palabra es un derivado de 'flor'?",
          opciones: ["florero", "flotar", "flauta"],
          respuesta: "florero",
        },
      },
      {
        titulo: "Sufijo -mente",
        contenido: {
          instruccion: "El sufijo '-mente' convierte un adjetivo en:",
          opciones: ["adverbio", "sustantivo", "verbo"],
          respuesta: "adverbio",
        },
      },
    ],
    COMPRENSION: [
      {
        titulo: "Un viaje en chiva",
        contenido: {
          texto:
            "Sofía subió por primera vez a una chiva para ir a visitar a su abuela. El bus, pintado de colores brillantes, subía despacio por la carretera destapada mientras sonaba música desde un parlante. Sofía sacó la cabeza por la ventana para sentir el viento fresco de la montaña.",
          pregunta: "¿Qué sintió Sofía al sacar la cabeza por la ventana?",
          opciones: ["Calor", "Viento fresco", "Sueño"],
          respuesta: 1,
        },
      },
      {
        titulo: "El apagón en la vereda",
        contenido: {
          texto:
            "Una noche de tormenta, se fue la luz en toda la vereda. Camilo buscó las velas que su abuela guardaba en la cocina y las repartió por la casa. Su hermana menor se asustó con los truenos, así que Camilo le contó historias hasta que se quedó dormida. Cuando volvió la luz, ya casi amanecía.",
          pregunta: "¿Qué se puede inferir sobre Camilo a partir del texto?",
          opciones: [
            "Que le teme a las tormentas",
            "Que cuidó a su hermana durante el apagón",
            "Que no sabía dónde estaban las velas",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "El zapatero del pueblo",
        contenido: {
          texto:
            "Don Aurelio lleva cuarenta años arreglando zapatos en su pequeño taller. Sus manos están curtidas de tanto coser cuero, pero sus ojos brillan cada vez que entrega un par de zapatos como nuevos. Aunque ya podría descansar, dice que no imagina sus días sin el olor a pegante y cuero de su taller.",
          pregunta: "¿Qué se puede inferir sobre los sentimientos de don Aurelio hacia su oficio?",
          opciones: [
            "Le disgusta su trabajo pero no tiene otra opción",
            "Siente pasión y disfruta profundamente su oficio",
            "Está pensando en cambiar de oficio pronto",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "La salida de observación",
        contenido: {
          texto:
            "En la clase de ciencias, la profesora llevó a los estudiantes al río para observar los insectos que viven cerca del agua. Daniela anotó en su cuaderno todo lo que veía, mientras que Esteban se distrajo lanzando piedras al agua. Al final, solo Daniela pudo responder las preguntas del taller.",
          pregunta: "¿Por qué crees que solo Daniela pudo responder las preguntas?",
          opciones: [
            "Porque estudió el tema antes de la salida",
            "Porque prestó atención y tomó notas durante la observación",
            "Porque la profesora le dio las respuestas",
          ],
          respuesta: 1,
        },
      },
    ],
    FLUIDEZ: [
      {
        titulo: "La cosecha de arracacha",
        contenido: {
          texto:
            "En las veredas altas del Valle de Tenza, la cosecha de arracacha empieza cuando las hojas se ponen amarillas. Los campesinos cavan con cuidado alrededor de cada mata para no dañar las raíces. Después de sacarlas, las lavan en agua fría y las cargan en costales hasta el camino, donde un camión las recoge para llevarlas al mercado. Es un trabajo que exige fuerza y paciencia, sobre todo cuando el terreno es empinado.",
          palabras: 90,
          ppmObjetivo: 110,
        },
      },
      {
        titulo: "El puente colgante",
        contenido: {
          texto:
            "Cerca de la vereda El Roble hay un puente colgante que cruza una quebrada profunda. Los estudiantes lo atraviesan todos los días para llegar a la escuela, sintiendo cómo se mece un poco con cada paso. Los mayores cuentan que el puente tiene más de treinta años y que antes cruzaban la quebrada en canoa, algo mucho más peligroso en época de lluvias.",
          palabras: 85,
          ppmObjetivo: 113,
        },
      },
      {
        titulo: "El taller de tejidos",
        contenido: {
          texto:
            "En un pequeño taller del pueblo, doña Inés enseña a tejer ruanas de lana a un grupo de jóvenes los fines de semana. Primero les explica cómo hilar la lana cruda, luego cómo escoger los colores y finalmente cómo armar el telar. Algunos estudiantes pensaban que tejer era solo cosa de personas mayores, pero después de unas semanas ya tenían sus propias ruanas a medio terminar.",
          palabras: 90,
          ppmObjetivo: 117,
        },
      },
      {
        titulo: "Una tarde de pesca",
        contenido: {
          texto:
            "Santiago y su tío fueron a pescar a la quebrada una tarde de vacaciones. Llevaron cañas hechas a mano y una lata con lombrices como carnada. Esperaron en silencio durante casi una hora sin que picara ningún pez, hasta que finalmente algo tiró fuerte del anzuelo. Santiago luchó por sacar el pez mientras su tío lo animaba desde la orilla.",
          palabras: 88,
          ppmObjetivo: 120,
        },
      },
    ],
  },

  "8°": {
    PALABRAS: [
      {
        titulo: "Conector: pero",
        contenido: {
          instruccion: "Completa: 'Quería salir a jugar, ___ estaba lloviendo muy fuerte.'",
          opciones: ["pero", "además", "porque"],
          respuesta: "pero",
        },
      },
      {
        titulo: "Homófona: echar",
        contenido: {
          instruccion: "Elige la palabra correcta: 'Voy a ___ la carta antes de enviarla.'",
          opciones: ["echar", "hechar", "hechal"],
          respuesta: "echar",
        },
      },
      {
        titulo: "Conector: porque",
        contenido: {
          instruccion: "Completa: 'Llegó tarde a clase ___ el bus se dañó en el camino.'",
          opciones: ["porque", "sin embargo", "además"],
          respuesta: "porque",
        },
      },
      {
        titulo: "Homófona: valla",
        contenido: {
          instruccion: "Elige la palabra correcta: 'La ___ de madera separa los dos terrenos.'",
          opciones: ["valla", "vaya", "baya"],
          respuesta: "valla",
        },
      },
    ],
    COMPRENSION: [
      {
        titulo: "¿Por qué llueve más en las montañas?",
        contenido: {
          texto:
            "Cuando el viento húmedo que viene del valle choca contra una montaña, se ve obligado a subir. Al subir, el aire se enfría, y el vapor de agua que lleva se condensa formando nubes. Por eso, en zonas montañosas como el Valle de Tenza, suele llover con más frecuencia que en terrenos planos cercanos, incluso en la misma época del año.",
          pregunta: "Según el texto, ¿por qué llueve más en las montañas?",
          opciones: [
            "Porque las montañas atraen los rayos",
            "Porque el aire húmedo sube, se enfría y forma nubes",
            "Porque el viento no llega a las zonas planas",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "El impacto de la sequía en los cultivos",
        contenido: {
          texto:
            "Cuando una región pasa varias semanas sin lluvia, la tierra pierde la humedad que las plantas necesitan para absorber nutrientes. Como consecuencia, las hojas de los cultivos empiezan a marchitarse y el crecimiento se detiene. Si la sequía continúa, los agricultores pueden perder gran parte de la cosecha, lo que afecta directamente sus ingresos.",
          pregunta: "¿Cuál es la consecuencia directa de que la tierra pierda humedad?",
          opciones: [
            "Los precios bajan inmediatamente",
            "Las plantas absorben más nutrientes",
            "Las hojas se marchitan y el crecimiento se detiene",
          ],
          respuesta: 2,
        },
      },
      {
        titulo: "¿Por qué se erosiona el suelo?",
        contenido: {
          texto:
            "Cuando se talan los árboles de una ladera, las raíces que sostenían la tierra desaparecen. Sin esa red de raíces, la lluvia arrastra la capa fértil del suelo hacia los ríos, dejando terrenos pobres y difíciles de cultivar. Este proceso, llamado erosión, es una de las razones por las que muchas comunidades rurales promueven la siembra de árboles.",
          pregunta: "¿Qué provoca la erosión del suelo según el texto?",
          opciones: [
            "El exceso de siembra de árboles",
            "La tala de árboles que sostenían la tierra con sus raíces",
            "La construcción de cuencas artificiales",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "El efecto de dormir poco en el aprendizaje",
        contenido: {
          texto:
            "Diversos estudios muestran que los adolescentes que duermen menos de siete horas tienen más dificultad para concentrarse en clase y para recordar lo que estudiaron el día anterior. Esto ocurre porque, durante el sueño profundo, el cerebro organiza y consolida la información nueva. Por esta razón, muchos colegios recomiendan horarios de sueño regulares.",
          pregunta: "¿Por qué dormir poco afecta el aprendizaje, según el texto?",
          opciones: [
            "Porque el cuerpo necesita más comida",
            "Porque el cerebro no logra organizar y consolidar la información durante el sueño",
            "Porque los exámenes son más difíciles en la noche",
          ],
          respuesta: 1,
        },
      },
    ],
    FLUIDEZ: [
      {
        titulo: "El oficio del panadero",
        contenido: {
          texto:
            "Desde las cuatro de la mañana, el panadero del pueblo enciende el horno de leña para que esté listo cuando llegue la masa. Amasa la harina con agua, sal y levadura, y deja reposar cada bola de pan el tiempo justo antes de hornearla. El calor del horno llena toda la cuadra de un olor que despierta a los vecinos incluso antes de que suene su despertador. Para las seis de la mañana, ya hay clientes haciendo fila por el pan caliente.",
          palabras: 100,
          ppmObjetivo: 120,
        },
      },
      {
        titulo: "La biblioteca ambulante",
        contenido: {
          texto:
            "Cada quince días, una camioneta cargada de libros recorre las veredas más alejadas del municipio. El bibliotecario instala una mesa bajo un árbol y deja que los niños escojan los libros que más les llamen la atención. Para algunos estudiantes, esa camioneta es la única forma de acceder a cuentos e historias distintas a las que ya conocen, porque en sus casas no hay internet ni librerías cercanas.",
          palabras: 95,
          ppmObjetivo: 124,
        },
      },
      {
        titulo: "El reciclaje en la escuela",
        contenido: {
          texto:
            "Este año, la escuela del pueblo puso en marcha un proyecto de reciclaje liderado por los estudiantes de octavo grado. Cada salón tiene tres canecas de colores distintos para separar el papel, el plástico y los residuos orgánicos. Una vez al mes, los estudiantes pesan lo recolectado y lo entregan a una fundación que transforma el plástico en materiales de construcción. Al principio muchos olvidaban separar bien la basura, pero con el tiempo casi todo el colegio se acostumbró.",
          palabras: 105,
          ppmObjetivo: 127,
        },
      },
      {
        titulo: "El festival de las cometas gigantes",
        contenido: {
          texto:
            "Todos los años, en agosto, el pueblo organiza un festival donde los jóvenes compiten construyendo las cometas más grandes y coloridas. Algunas alcanzan más de dos metros de ancho y necesitan varias personas para sostenerlas mientras el viento las levanta. Los jueces evalúan no solo el diseño, sino también cuánto tiempo logra mantenerse la cometa en el aire sin caer. El año pasado, un grupo de octavo grado ganó el primer lugar con una cometa en forma de cóndor.",
          palabras: 108,
          ppmObjetivo: 130,
        },
      },
    ],
  },

  "9°": {
    PALABRAS: [
      {
        titulo: "Conector: en consecuencia",
        contenido: {
          instruccion: "La expresión 'en consecuencia' se usa para introducir:",
          opciones: ["un resultado", "una comparación", "una duda"],
          respuesta: "un resultado",
        },
      },
      {
        titulo: "Sinónimo de 'refutar'",
        contenido: {
          instruccion: "¿Cuál es un sinónimo de 'refutar'?",
          opciones: ["contradecir", "confirmar", "ignorar"],
          respuesta: "contradecir",
        },
      },
      {
        titulo: "Conector: no obstante",
        contenido: {
          instruccion: "'No obstante' equivale a:",
          opciones: ["sin embargo", "por lo tanto", "es decir"],
          respuesta: "sin embargo",
        },
      },
      {
        titulo: "Vocabulario: hipótesis",
        contenido: {
          instruccion: "En un texto científico, 'hipótesis' significa:",
          opciones: [
            "una suposición que se debe comprobar",
            "un resultado ya confirmado",
            "una ley universal",
          ],
          respuesta: "una suposición que se debe comprobar",
        },
      },
    ],
    COMPRENSION: [
      {
        titulo: "¿Deberían los celulares estar prohibidos en el colegio?",
        contenido: {
          texto:
            "Algunos docentes proponen prohibir el uso de celulares durante toda la jornada escolar, argumentando que distraen a los estudiantes y afectan su concentración en clase. Sin embargo, otros consideran que el problema no es el celular en sí, sino la falta de acuerdos claros sobre cuándo usarlo. Prohibirlo por completo podría impedir su uso en actividades educativas, como buscar información o resolver ejercicios interactivos.",
          pregunta: "¿Cuál es la tesis principal que defiende el autor del texto?",
          opciones: [
            "Los celulares deben prohibirse sin excepción",
            "El problema es la falta de acuerdos claros sobre su uso, no el celular en sí",
            "Los celulares solo sirven para distraer",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "La importancia de separar la basura",
        contenido: {
          texto:
            "Separar los residuos en la fuente es una de las acciones más simples que una familia puede hacer para reducir su impacto ambiental. Aunque tomar cinco minutos al día para clasificar la basura parece poco, multiplicado por miles de hogares representa toneladas de material que pueden reciclarse. Por eso, más que una obligación impuesta por la ley, debería entenderse como una responsabilidad compartida.",
          pregunta: "¿Qué opinión defiende el autor sobre separar la basura?",
          opciones: [
            "Que es una pérdida de tiempo innecesaria",
            "Que debería verse como una responsabilidad compartida, no solo una obligación legal",
            "Que solo las fábricas deben separar sus residuos",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "¿Es necesario el uniforme escolar?",
        contenido: {
          texto:
            "Quienes defienden el uniforme escolar argumentan que reduce la desigualdad visible entre estudiantes de distintos recursos económicos. Los que se oponen sostienen que limita la expresión individual de los jóvenes en una etapa clave de su desarrollo. Ambas posturas coinciden, sin embargo, en que el verdadero objetivo debería ser garantizar un ambiente escolar respetuoso, más allá de lo que cada estudiante lleve puesto.",
          pregunta: "¿En qué coinciden ambas posturas presentadas en el texto?",
          opciones: [
            "En que el uniforme debe eliminarse ya",
            "En que el objetivo real es un ambiente escolar respetuoso, sin importar el vestuario",
            "En que la ropa define el rendimiento académico",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "El valor de aprender un segundo idioma",
        contenido: {
          texto:
            "Aprender un segundo idioma no solo abre puertas laborales, sino que también entrena la mente para pensar de formas distintas, ya que cada idioma organiza las ideas de manera diferente. Algunos estudiantes creen que solo vale la pena si planean viajar, pero investigadores señalan beneficios cognitivos incluso para quienes nunca salen de su país, como una mejor memoria y mayor flexibilidad para resolver problemas.",
          pregunta: "Según el texto, ¿cuál es un beneficio de aprender un idioma que no depende de viajar?",
          opciones: [
            "Ninguno, solo sirve para viajar",
            "Mejora la memoria y la flexibilidad para resolver problemas",
            "Solo sirve para conseguir empleo",
          ],
          respuesta: 1,
        },
      },
    ],
    FLUIDEZ: [
      {
        titulo: "El café de la región",
        contenido: {
          texto:
            "El Valle de Tenza no es una zona cafetera tradicional, pero en las últimas décadas algunos caficultores han empezado a sembrar variedades adaptadas a la altura de la región. El proceso empieza con la selección de las semillas, sigue con meses de cuidado de los almácigos, y termina con la recolección manual de los granos maduros, uno por uno, para garantizar un café de buena calidad. Aunque el volumen de producción es pequeño, varios caficultores locales han logrado vender su café directamente a compradores que valoran su origen particular.",
          palabras: 115,
          ppmObjetivo: 130,
        },
      },
      {
        titulo: "La radio comunitaria",
        contenido: {
          texto:
            "Desde hace más de veinte años, una emisora comunitaria transmite noticias, música y avisos parroquiales para varias veredas del municipio. A diferencia de las grandes cadenas nacionales, sus locutores son vecinos del pueblo que conocen personalmente a buena parte de su audiencia, lo que les permite anunciar desde una vaca perdida hasta la fecha de una minga comunitaria. En época de emergencias, la radio se convierte en el medio más confiable para que la información llegue rápido a las zonas más apartadas.",
          palabras: 118,
          ppmObjetivo: 134,
        },
      },
      {
        titulo: "El regreso de las aves migratorias",
        contenido: {
          texto:
            "Cada año, entre septiembre y octubre, cientos de aves migratorias que vienen desde Norteamérica pasan por los humedales cercanos al Valle de Tenza en su camino hacia el sur del continente. Los observadores de aves de la región aprovechan esta temporada para registrar las especies que ven, información que luego se comparte con investigadores interesados en entender cómo el cambio climático está modificando las rutas migratorias tradicionales.",
          palabras: 105,
          ppmObjetivo: 137,
        },
      },
      {
        titulo: "El taller de robótica rural",
        contenido: {
          texto:
            "Un grupo de estudiantes de noveno grado, junto con un profesor de tecnología, empezó un taller de robótica usando materiales reciclados y piezas económicas conseguidas por internet. Al principio, muchos dudaban de que fuera posible construir robots funcionales sin un laboratorio especializado, pero con paciencia y varios intentos fallidos, lograron armar un pequeño brazo mecánico capaz de mover objetos livianos. El proyecto llamó la atención de otros colegios de la región.",
          palabras: 110,
          ppmObjetivo: 140,
        },
      },
    ],
  },

  "10°": {
    PALABRAS: [
      {
        titulo: "Metáfora",
        contenido: {
          instruccion: "'Sus palabras eran dagas que herían sin tocar la piel' es un ejemplo de:",
          opciones: ["metáfora", "comparación explícita", "onomatopeya"],
          respuesta: "metáfora",
        },
      },
      {
        titulo: "Hipérbole",
        contenido: {
          instruccion: "'Lloré un río de lágrimas toda la noche' es un ejemplo de:",
          opciones: ["hipérbole", "metonimia", "aliteración"],
          respuesta: "hipérbole",
        },
      },
      {
        titulo: "Connotación: invierno",
        contenido: {
          instruccion: "En un poema triste, la palabra 'invierno' probablemente tiene un sentido connotativo relacionado con:",
          opciones: ["la vejez o la tristeza", "la temperatura exacta", "un mes del calendario"],
          respuesta: "la vejez o la tristeza",
        },
      },
      {
        titulo: "Símil",
        contenido: {
          instruccion: "'Corría tan rápido como el viento' es un ejemplo de:",
          opciones: ["símil o comparación", "metáfora pura", "personificación"],
          respuesta: "símil o comparación",
        },
      },
    ],
    COMPRENSION: [
      {
        titulo: "El silencio también comunica",
        contenido: {
          texto:
            "En muchas conversaciones, damos por hecho que el sentido está solo en las palabras que se dicen, mientras ignoramos lo que se calla deliberadamente. Un silencio prolongado ante una pregunta incómoda puede comunicar tanto —o más— que una respuesta elaborada. Los buenos negociadores y los actores de teatro lo saben: una pausa bien calculada transmite duda, desacuerdo o incluso una negativa, sin necesidad de pronunciar una sola palabra.",
          pregunta: "¿Qué se puede inferir sobre la postura del autor frente al silencio en la comunicación?",
          opciones: [
            "Considera que el silencio no tiene ningún valor comunicativo",
            "Sostiene que el silencio puede ser tan significativo como las palabras",
            "Cree que solo los actores deben usar el silencio",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "La trampa de la comparación constante",
        contenido: {
          texto:
            "Las redes sociales muestran, casi siempre, la versión más editada de la vida de los demás: el viaje, el logro, la foto perfecta. Compararse con esas versiones incompletas puede generar una insatisfacción difícil de justificar, porque no se está comparando una vida completa con otra, sino un momento cuidadosamente seleccionado con la totalidad de la propia experiencia, incluidos los días comunes y las dificultades que nadie publica.",
          pregunta: "¿Qué se puede inferir como causa principal de la insatisfacción que describe el autor?",
          opciones: [
            "Comparar una vida completa con otra vida completa",
            "Comparar momentos editados ajenos con la propia vida completa, incluidos sus días difíciles",
            "La falta de logros personales reales",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "Aprender del error en lugar de temerle",
        contenido: {
          texto:
            "En muchos entornos educativos, el error todavía se percibe como algo que debe evitarse a toda costa, penalizado con una nota baja. Sin embargo, en campos como la ciencia o el diseño, el error es una fuente constante de información: un experimento fallido revela tanto como uno exitoso, siempre que se analice con atención. La diferencia entre estudiantes que avanzan rápido y los que se estancan no suele estar en la cantidad de errores que cometen, sino en lo que deciden hacer después de cometerlos.",
          pregunta: "Según el texto, ¿qué distingue realmente a los estudiantes que avanzan más rápido?",
          opciones: [
            "Cometer menos errores que los demás",
            "Lo que hacen después de cometer un error, no la cantidad de errores",
            "Evitar por completo situaciones de riesgo",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "El costo invisible de la prisa",
        contenido: {
          texto:
            "Vivir apurados se ha vuelto tan común que rara vez nos detenemos a calcular su costo real. No se trata solo del cansancio físico, sino de decisiones tomadas sin suficiente reflexión: un mensaje enviado sin releer, una compra hecha sin comparar, una discusión resuelta con la primera respuesta que viene a la mente. La prisa no ahorra tanto tiempo como promete, porque muchas de esas decisiones apresuradas terminan exigiendo tiempo adicional para corregirlas.",
          pregunta: "¿Cuál es la idea central que defiende el autor sobre la prisa?",
          opciones: [
            "Que ahorra tiempo de forma efectiva siempre",
            "Que genera decisiones apresuradas que después requieren tiempo extra para corregirse",
            "Que solo afecta el cansancio físico",
          ],
          respuesta: 1,
        },
      },
    ],
    FLUIDEZ: [
      {
        titulo: "El agua que no se ve",
        contenido: {
          texto:
            "Cuando hablamos de cuidar el agua, casi siempre pensamos en cerrar la llave mientras nos cepillamos los dientes o en tomar duchas más cortas. Sin embargo, gran parte del agua que consumimos no la vemos directamente, sino que está oculta en lo que llamamos agua virtual: la cantidad necesaria para producir los alimentos y objetos que usamos a diario. Fabricar una camiseta de algodón, por ejemplo, puede requerir miles de litros de agua durante el cultivo, procesamiento y teñido de la tela, mucho más de lo que cualquiera imaginaría al comprarla en una tienda.",
          palabras: 125,
          ppmObjetivo: 140,
        },
      },
      {
        titulo: "Las decisiones que no tomamos",
        contenido: {
          texto:
            "Solemos analizar con cuidado las decisiones que finalmente tomamos, pero rara vez reflexionamos sobre aquellas que descartamos casi sin pensar. Cada camino de vida que elegimos implica, al mismo tiempo, decenas de caminos que dejamos de explorar, y esa elección invisible influye tanto en quiénes somos como las decisiones que sí llevamos a cabo. Los psicólogos que estudian la toma de decisiones señalan que revisar conscientemente las opciones descartadas puede ayudarnos a entender mejor nuestros propios valores.",
          palabras: 122,
          ppmObjetivo: 144,
        },
      },
      {
        titulo: "La memoria de los objetos",
        contenido: {
          texto:
            "Existen objetos cotidianos que, sin tener ningún valor económico especial, guardan un significado enorme para quien los conserva: una libreta con anotaciones de la infancia, una herramienta heredada de un abuelo, una taza descascarada que nadie más usaría. Estos objetos funcionan como anclas de memoria, capaces de traer de vuelta recuerdos completos con solo tocarlos o mirarlos. Los antropólogos han estudiado este fenómeno para entender por qué las personas se resisten a deshacerse de cosas aparentemente inútiles.",
          palabras: 128,
          ppmObjetivo: 148,
        },
      },
      {
        titulo: "El precio real de lo gratuito",
        contenido: {
          texto:
            "Muchos servicios digitales que usamos a diario se presentan como gratuitos, pero rara vez lo son en un sentido estricto. Cuando no pagamos con dinero por un producto, es común que estemos pagando con algo distinto: nuestros datos personales, nuestra atención constante o el tiempo que dedicamos a ver publicidad. Entender esta lógica no significa dejar de usar esos servicios, sino tomar decisiones más informadas sobre qué compartimos, con quién y a cambio de qué beneficio real recibimos.",
          palabras: 125,
          ppmObjetivo: 150,
        },
      },
    ],
  },

  "11°": {
    PALABRAS: [
      {
        titulo: "Polisemia: banco",
        contenido: {
          instruccion: "En la oración 'Se sentó en el banco del parque', la palabra 'banco' se refiere a:",
          opciones: ["un asiento público", "una entidad financiera", "un grupo de peces"],
          respuesta: "un asiento público",
        },
      },
      {
        titulo: "Sinónimo académico: analizar",
        contenido: {
          instruccion: "¿Cuál es un sinónimo académico apropiado de 'analizar'?",
          opciones: ["examinar", "ignorar", "resumir"],
          respuesta: "examinar",
        },
      },
      {
        titulo: "Significado de 'ambiguo'",
        contenido: {
          instruccion: "Una palabra o expresión 'ambigua' es aquella que:",
          opciones: [
            "se puede interpretar de más de una forma",
            "es siempre falsa",
            "no tiene significado",
          ],
          respuesta: "se puede interpretar de más de una forma",
        },
      },
      {
        titulo: "Vocabulario académico: inferir",
        contenido: {
          instruccion: "En un contexto académico, 'inferir' significa:",
          opciones: [
            "deducir algo a partir de datos o pistas",
            "copiar un texto textualmente",
            "memorizar información sin analizarla",
          ],
          respuesta: "deducir algo a partir de datos o pistas",
        },
      },
    ],
    COMPRENSION: [
      {
        titulo: "¿Correlación o causalidad?",
        contenido: {
          texto:
            "Un estudio encontró que, en cierta ciudad, los meses con mayor venta de helados coinciden con los meses de mayor número de ahogamientos en piscinas. Sería un error concluir que comer helado provoca ahogamientos: ambos fenómenos están relacionados con una tercera variable, la temporada de calor, que aumenta tanto el consumo de helados como la asistencia a piscinas. Este ejemplo ilustra un error común al interpretar datos: confundir una simple correlación estadística con una relación de causa y efecto directa.",
          pregunta: "¿Cuál es el propósito principal del texto?",
          opciones: [
            "Advertir sobre los riesgos de comer helado en verano",
            "Explicar la diferencia entre correlación y causalidad usando un ejemplo",
            "Demostrar que las piscinas son peligrosas en temporada de calor",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "El sesgo de confirmación",
        contenido: {
          texto:
            "Cuando una persona ya tiene una opinión formada sobre un tema, tiende a prestar más atención a la información que confirma esa opinión y a ignorar o minimizar la que la contradice. Este fenómeno, conocido como sesgo de confirmación, no depende del nivel educativo de la persona, sino de un mecanismo mental común a todos los seres humanos. Ser consciente de este sesgo no lo elimina por completo, pero permite adoptar hábitos como buscar activamente fuentes que cuestionen las propias ideas.",
          pregunta: "Según el texto, ¿qué determina principalmente la presencia del sesgo de confirmación en una persona?",
          opciones: [
            "Su nivel educativo",
            "Un mecanismo mental común a todos los seres humanos",
            "La cantidad de libros que ha leído",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "Los límites de las encuestas de opinión",
        contenido: {
          texto:
            "Antes de unas elecciones, es común ver encuestas que anuncian el porcentaje de intención de voto de cada candidato. Sin embargo, estas cifras dependen de decisiones metodológicas que pocas veces se explican al público: cómo se seleccionó a los encuestados, cuántas personas respondieron realmente y qué margen de error tiene el estudio. Dos encuestas con metodologías distintas pueden arrojar resultados muy diferentes sobre el mismo fenómeno, lo que exige que el lector revise la ficha técnica antes de sacar conclusiones apresuradas.",
          pregunta: "¿Qué actitud crítica promueve el texto frente a las encuestas de opinión?",
          opciones: [
            "Confiar siempre en el primer resultado que se publique",
            "Revisar la metodología antes de sacar conclusiones sobre los resultados",
            "Ignorar por completo cualquier encuesta electoral",
          ],
          respuesta: 1,
        },
      },
      {
        titulo: "La paradoja de la elección",
        contenido: {
          texto:
            "Se suele asumir que tener más opciones siempre mejora nuestra capacidad de decidir, pero varios estudios en psicología del consumo sugieren lo contrario. Cuando las alternativas superan cierto número, muchas personas experimentan una parálisis de decisión: en lugar de elegir la mejor opción disponible, terminan posponiendo la decisión o sintiéndose insatisfechas con lo que finalmente eligieron, por temor a que otra opción hubiera sido mejor.",
          pregunta: "¿Qué cuestiona la 'paradoja de la elección' descrita en el texto?",
          opciones: [
            "Que exista alguna relación entre las opciones y la satisfacción",
            "La idea de que tener más opciones siempre genera mayor bienestar",
            "La utilidad de tomar decisiones rápidas",
          ],
          respuesta: 1,
        },
      },
    ],
    FLUIDEZ: [
      {
        titulo: "La desinformación en la era digital",
        contenido: {
          texto:
            "Nunca antes había sido tan fácil publicar información, y precisamente por eso nunca había sido tan difícil verificarla. Una noticia falsa bien diseñada puede alcanzar a millones de personas en minutos, mucho antes de que cualquier verificación de datos tenga la oportunidad de desmentirla, y para entonces buena parte de esa audiencia ya habrá formado una opinión basada en información incorrecta. Los especialistas en alfabetización mediática insisten en que la solución no es dejar de usar internet, sino desarrollar el hábito de contrastar las fuentes, revisar quién publica la información y preguntarse qué interés podría tener alguien en que una noticia particular se difunda ampliamente.",
          palabras: 145,
          ppmObjetivo: 150,
        },
      },
      {
        titulo: "El pensamiento crítico como herramienta",
        contenido: {
          texto:
            "Pensar críticamente no significa dudar de todo de manera automática, sino desarrollar la capacidad de evaluar la calidad de un argumento antes de aceptarlo o rechazarlo. Esto implica preguntarse qué evidencia respalda una afirmación, si esa evidencia proviene de una fuente confiable, y si existen explicaciones alternativas igual de razonables que no se han considerado todavía. En un entorno saturado de información, donde cualquiera puede publicar cualquier cosa con apariencia de autoridad, esta habilidad se vuelve tan importante como saber leer o escribir.",
          palabras: 138,
          ppmObjetivo: 155,
        },
      },
      {
        titulo: "El futuro del trabajo rural",
        contenido: {
          texto:
            "Durante décadas, se asumió que el desarrollo tecnológico beneficiaría principalmente a las ciudades, dejando al campo relegado a las tareas más tradicionales. Sin embargo, la llegada de conexiones a internet más estables a zonas rurales del país ha permitido que algunos agricultores accedan a información sobre precios, clima y técnicas de cultivo en tiempo real, mejorando decisiones que antes dependían solo de la experiencia acumulada. Aun así, persisten brechas importantes: mientras algunas veredas ya cuentan con conectividad razonable, otras siguen dependiendo de desplazamientos largos para realizar trámites básicos.",
          palabras: 140,
          ppmObjetivo: 158,
        },
      },
      {
        titulo: "La ciencia como proceso, no como certeza",
        contenido: {
          texto:
            "Fuera del ámbito académico, es común pensar en la ciencia como un conjunto de verdades fijas y definitivas, cuando en realidad se trata de un proceso continuo de revisión, donde las teorías se ajustan o incluso se descartan cuando aparece nueva evidencia que las contradice. Esta característica, lejos de ser una debilidad, es precisamente lo que distingue al conocimiento científico de otras formas de creencia: su disposición a cambiar frente a la evidencia, en lugar de aferrarse a una idea por tradición o autoridad.",
          palabras: 135,
          ppmObjetivo: 160,
        },
      },
    ],
  },
};

async function main() {
  for (const d of docentes) {
    const passwordHash = await bcrypt.hash(d.password, 10);
    await prisma.docente.upsert({
      where: { usuario: d.usuario },
      update: {},
      create: { nombre: d.nombre, usuario: d.usuario, passwordHash },
    });
  }

  for (const a of administradores) {
    const passwordHash = await bcrypt.hash(a.password, 10);
    await prisma.administrador.upsert({
      where: { usuario: a.usuario },
      update: {},
      create: { nombre: a.nombre, usuario: a.usuario, passwordHash },
    });
  }

  for (const l of logros) {
    await prisma.logro.upsert({
      where: { codigo: l.codigo },
      update: {
        nombre: l.nombre,
        icono: l.icono,
        descripcion: l.descripcion,
        criterio: l.criterio,
      },
      create: l,
    });
  }

  const puntosBasePorModulo = { PALABRAS: 20, COMPRENSION: 20, FLUIDEZ: 30 };

  for (const [curso, modulos] of Object.entries(BANCO)) {
    for (const [modulo, items] of Object.entries(modulos)) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const orden = i + 1;
        await prisma.actividad.upsert({
          where: { modulo_curso_orden: { modulo, curso, orden } },
          update: {
            titulo: item.titulo,
            contenido: JSON.stringify(item.contenido),
            puntosBase: puntosBasePorModulo[modulo],
          },
          create: {
            modulo,
            curso,
            titulo: item.titulo,
            orden,
            contenido: JSON.stringify(item.contenido),
            puntosBase: puntosBasePorModulo[modulo],
          },
        });
      }
    }
  }

  await crearVistasLegibles();

  console.log("Seed completado: docentes, logros y banco de actividades (6°-11°).");
}

// Vistas SQL de solo lectura, pensadas para explorar la base de datos
// (Neon SQL editor, o cualquier cliente de Postgres) con nombres en
// español en vez de los códigos internos que usa el código de la
// aplicación (PALABRAS/COMPRENSION/FLUIDEZ, booleanos, IDs). No las usa
// la app — son solo para inspección manual. Postgres es sensible a
// mayúsculas en identificadores no citados, así que las tablas/columnas
// con mayúsculas (creadas por Prisma tal cual el modelo) van entre "".
async function crearVistasLegibles() {
  const moduloLegible = (columna) => `
    CASE ${columna}
      WHEN 'PALABRAS' THEN 'Reconocer palabras'
      WHEN 'COMPRENSION' THEN 'Comprensión lectora'
      WHEN 'FLUIDEZ' THEN 'Fluidez lectora'
      ELSE ${columna}
    END`;

  await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS "ActividadesLegibles"`);
  await prisma.$executeRawUnsafe(`
    CREATE VIEW "ActividadesLegibles" AS
    SELECT
      a.id,
      a.curso AS grado,
      ${moduloLegible("a.modulo")} AS modulo,
      a.titulo,
      a.orden,
      a."puntosBase" AS puntos,
      a.contenido,
      a."createdAt" AS creada
    FROM "Actividad" a
    ORDER BY a.curso, a.modulo, a.orden
  `);

  await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS "EstudiantesLegibles"`);
  await prisma.$executeRawUnsafe(`
    CREATE VIEW "EstudiantesLegibles" AS
    SELECT
      id,
      nombre,
      usuario,
      curso AS grado,
      puntos,
      (puntos / 500) + 1 AS nivel,
      racha,
      "ultimaActividadEn" AS "ultimaActividad",
      "createdAt" AS creado
    FROM "Estudiante"
    ORDER BY puntos DESC
  `);

  await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS "IntentosLegibles"`);
  await prisma.$executeRawUnsafe(`
    CREATE VIEW "IntentosLegibles" AS
    SELECT
      i.id,
      e.nombre AS estudiante,
      e.curso AS grado,
      ${moduloLegible('act.modulo')} AS modulo,
      act.titulo AS actividad,
      CASE WHEN i.correcto THEN 'Sí' ELSE 'No' END AS correcto,
      i."puntosGanados" AS puntos,
      i."creadoEn" AS fecha
    FROM "Intento" i
    JOIN "Estudiante" e ON e.id = i."estudianteId"
    JOIN "Actividad" act ON act.id = i."actividadId"
    ORDER BY i."creadoEn" DESC
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
