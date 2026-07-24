const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const { PUNTOS_BASE_POR_MODULO } = require("../src/lib/constants");

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
    "PALABRAS": [
      {
        "titulo": "Sinónimo de 'veloz'",
        "contenido": {
          "instruccion": "¿Cuál es un sinónimo de 'veloz'?",
          "opciones": [
            "rápido",
            "lento",
            "tranquilo"
          ],
          "respuesta": "rápido",
          "explicacion": "'Veloz' y 'rápido' significan lo mismo: que se mueve con gran velocidad. 'Lento' es lo contrario y 'tranquilo' habla de calma, no de velocidad."
        }
      },
      {
        "titulo": "Ortografía: exhausto",
        "contenido": {
          "instruccion": "¿Cuál palabra está bien escrita?",
          "opciones": [
            "exhausto",
            "esausto",
            "exsausto"
          ],
          "respuesta": "exhausto",
          "explicacion": "'Exhausto' (muy cansado) se escribe con h intermedia después de la x. Las otras formas no existen en español."
        }
      },
      {
        "titulo": "Antónimo de 'generoso'",
        "contenido": {
          "instruccion": "¿Cuál es un antónimo de 'generoso'?",
          "opciones": [
            "tacaño",
            "amable",
            "alegre"
          ],
          "respuesta": "tacaño",
          "explicacion": "Generoso es quien da y comparte; su contrario es 'tacaño', quien no quiere compartir. 'Amable' y 'alegre' no son opuestos de generoso."
        }
      },
      {
        "titulo": "Ortografía: excavación",
        "contenido": {
          "instruccion": "¿Cuál palabra está bien escrita?",
          "opciones": [
            "escavación",
            "exkavación",
            "excavación"
          ],
          "respuesta": "excavación",
          "explicacion": "'Excavación' se forma con el prefijo ex- más 'cavar', por eso lleva 'xc'. Las otras escrituras no existen."
        }
      },
      {
        "titulo": "Palabra esdrújula",
        "contenido": {
          "instruccion": "¿Cuál de estas palabras es esdrújula?",
          "opciones": [
            "música",
            "canción",
            "ventana"
          ],
          "respuesta": "música",
          "explicacion": "'Música' lleva la fuerza de voz en la antepenúltima sílaba (MÚ-si-ca): es esdrújula y siempre lleva tilde. 'Canción' es aguda y 'ventana' es grave."
        }
      },
      {
        "titulo": "Sinónimo de 'contento'",
        "contenido": {
          "instruccion": "¿Cuál es un sinónimo de 'contento'?",
          "opciones": [
            "alegre",
            "enojado",
            "cansado"
          ],
          "respuesta": "alegre",
          "explicacion": "'Contento' y 'alegre' expresan la misma emoción de felicidad. 'Enojado' y 'cansado' son estados muy distintos."
        }
      },
      {
        "titulo": "Ortografía: volver",
        "contenido": {
          "instruccion": "¿Cuál palabra está bien escrita?",
          "opciones": [
            "volver",
            "bolver",
            "volber"
          ],
          "respuesta": "volver",
          "explicacion": "'Volver' se escribe siempre con v. 'Bolver' y 'volber' no existen en español."
        }
      },
      {
        "titulo": "La palabra intrusa",
        "contenido": {
          "instruccion": "¿Cuál palabra NO pertenece al grupo de las frutas?",
          "opciones": [
            "papa",
            "mora",
            "curuba"
          ],
          "respuesta": "papa",
          "explicacion": "La papa no es una fruta: es un tubérculo que crece bajo tierra. La mora y la curuba sí son frutas de nuestra región."
        }
      }
    ],
    "COMPRENSION": [
      {
        "titulo": "El colibrí del Valle de Tenza",
        "contenido": {
          "texto": "En las montañas del Valle de Tenza vive un colibrí de plumas verdes y brillantes. Cada mañana visita las flores del jardín de doña Rosa para tomar su néctar. Los niños del pueblo lo llaman “Chispa”, porque vuela tan rápido que parece un rayo de luz entre los árboles.",
          "pregunta": "¿Por qué los niños llaman “Chispa” al colibrí?",
          "opciones": [
            "Porque tiene plumas de color amarillo",
            "Porque vuela muy rápido, como un rayo de luz",
            "Porque vive en la casa de doña Rosa"
          ],
          "respuesta": "Porque vuela muy rápido, como un rayo de luz",
          "explicacion": "El texto lo dice directamente: lo llaman 'Chispa' porque vuela tan rápido que parece un rayo de luz entre los árboles.",
          "nivel": "literal"
        }
      },
      {
        "titulo": "La huerta escolar",
        "contenido": {
          "texto": "En el colegio de Guateque, los estudiantes de sexto grado sembraron una huerta con lechuga, cilantro y rábanos. Cada semana se turnan para regar las plantas y quitar las malezas. La profesora Martha dice que la huerta les enseña a tener paciencia, porque las verduras no crecen de un día para otro.",
          "pregunta": "¿Cuál es la idea principal del texto?",
          "opciones": [
            "Los estudiantes sembraron una huerta y aprenden paciencia cuidándola",
            "Las verduras crecen en un solo día",
            "El colegio queda en Guateque"
          ],
          "respuesta": "Los estudiantes sembraron una huerta y aprenden paciencia cuidándola",
          "explicacion": "La idea principal resume todo el texto: sembraron una huerta y con ella aprenden paciencia. Las otras opciones son un detalle o son falsas.",
          "nivel": "literal"
        }
      },
      {
        "titulo": "El perro guardián de la finca",
        "contenido": {
          "texto": "Rocco es un perro pastor que vive en una finca cerca del Valle de Tenza. Todas las noches recorre el corral y ladra si escucha algo extraño cerca de las gallinas. Una noche ahuyentó a una zorra que intentaba entrar al gallinero. Desde entonces, don Álvaro dice que Rocco vale más que cualquier cerca.",
          "pregunta": "¿Por qué don Álvaro valora tanto a Rocco?",
          "opciones": [
            "Porque juega con las gallinas todo el día",
            "Porque protege la finca de los animales que quieren entrar",
            "Porque es un perro muy grande"
          ],
          "respuesta": "Porque protege la finca de los animales que quieren entrar",
          "explicacion": "Don Álvaro valora a Rocco porque protege la finca: el texto cuenta que ahuyentó a una zorra que quería entrar al gallinero.",
          "nivel": "literal"
        }
      },
      {
        "titulo": "Un día de mercado en Guateque",
        "contenido": {
          "texto": "Los sábados, la plaza de Guateque se llena de gente desde temprano. Los campesinos llegan con canastos de papa, arracacha y frutas de clima frío. Los niños ayudan a acomodar los productos mientras los adultos negocian los precios. Al mediodía, casi todo se ha vendido y las familias regresan a sus veredas.",
          "pregunta": "¿Qué sucede en la plaza de Guateque los sábados?",
          "opciones": [
            "Se hace un mercado donde los campesinos venden sus productos",
            "Los niños juegan fútbol todo el día",
            "Los campesinos compran ropa nueva"
          ],
          "respuesta": "Se hace un mercado donde los campesinos venden sus productos",
          "explicacion": "El texto describe el mercado de los sábados, donde los campesinos llegan con sus canastos a vender productos.",
          "nivel": "literal"
        }
      },
      {
        "titulo": "La laguna de la vereda",
        "contenido": {
          "texto": "Cerca de la vereda La Esperanza hay una laguna rodeada de juncos donde viven patos silvestres. Los abuelos cuentan que hace muchos años la laguna era más grande, pero poco a poco se ha ido secando. Por eso, los estudiantes del colegio sembraron árboles a su alrededor: las raíces ayudan a conservar el agua y dan sombra a los animales.",
          "pregunta": "¿Para qué sembraron árboles los estudiantes alrededor de la laguna?",
          "opciones": [
            "Para conservar el agua y dar sombra a los animales",
            "Para hacer una cerca de madera",
            "Para que los patos se fueran a otra laguna"
          ],
          "respuesta": "Para conservar el agua y dar sombra a los animales",
          "explicacion": "El texto explica el propósito: las raíces de los árboles ayudan a conservar el agua y dan sombra a los animales.",
          "nivel": "literal"
        }
      },
      {
        "titulo": "Las abejas del profesor",
        "contenido": {
          "texto": "El profesor Luis tiene diez cajones de abejas detrás de su casa. Las abejas visitan las flores del campo y regresan cargadas de polen para fabricar miel. Dos veces al año, el profesor cosecha la miel y la vende en frascos en el mercado del pueblo. Siempre les dice a sus estudiantes que sin abejas no habría frutas, porque ellas polinizan los cultivos.",
          "pregunta": "Según el texto, ¿por qué son importantes las abejas para los cultivos?",
          "opciones": [
            "Porque fabrican los frascos de la miel",
            "Porque polinizan las flores de los cultivos",
            "Porque viven detrás de la casa del profesor"
          ],
          "respuesta": "Porque polinizan las flores de los cultivos",
          "explicacion": "Según el texto, sin abejas no habría frutas porque ellas polinizan los cultivos al visitar las flores.",
          "nivel": "literal"
        }
      },
      {
        "titulo": "El sancocho del domingo",
        "contenido": {
          "texto": "Los domingos, la familia Ruiz prepara sancocho en fogón de leña. Primero, don Andrés enciende el fuego y pone la olla con agua. Luego, doña Elvia agrega la gallina y deja que hierva por una hora. Después añaden la yuca, el plátano y las papas. Al final, sirven el sancocho con arroz y aguacate, y almuerzan todos juntos en el patio.",
          "pregunta": "¿Qué hace la familia justo después de agregar la gallina?",
          "opciones": [
            "Sirve el sancocho con arroz y aguacate",
            "Deja que hierva por una hora",
            "Enciende el fuego del fogón"
          ],
          "respuesta": "Deja que hierva por una hora",
          "explicacion": "El orden de la receta es: encender el fuego, agregar la gallina y dejarla hervir una hora, y después añadir la yuca, el plátano y las papas.",
          "nivel": "literal"
        }
      },
      {
        "titulo": "El viaje a Bogotá",
        "contenido": {
          "texto": "Mariana viajó por primera vez a Bogotá para visitar a su tía. La flota salió de Guateque a las cinco de la mañana y tardó casi tres horas en llegar. A Mariana le sorprendió el tamaño de los edificios y la cantidad de carros, pero extrañó el silencio de su pueblo. Al regresar, les dijo a sus papás que la ciudad es bonita para visitar, pero que prefiere vivir en Guateque.",
          "pregunta": "¿Cuál es la idea principal del texto?",
          "opciones": [
            "Mariana conoció Bogotá, pero prefiere la vida de su pueblo",
            "La flota tardó tres horas en llegar a Bogotá",
            "En Bogotá hay muchos carros y edificios"
          ],
          "respuesta": "Mariana conoció Bogotá, pero prefiere la vida de su pueblo",
          "explicacion": "La idea principal reúne todo el relato: Mariana conoció Bogotá pero prefiere la vida de su pueblo. Las otras opciones son solo detalles del viaje.",
          "nivel": "literal"
        }
      }
    ],
    "FLUIDEZ": [
      {
        "titulo": "El madrugón del ordeño",
        "contenido": {
          "texto": "Todos los días, antes de que salga el sol, don Pedro se levanta para ordeñar las vacas. Camina hasta el establo con un balde en la mano y un poncho grueso para el frío de la madrugada. Las vacas ya lo esperan, acostumbradas a su rutina. En menos de una hora, el balde está lleno de leche fresca que luego se lleva al pueblo para vender.",
          "palabras": 66,
          "ppmObjetivo": 95
        }
      },
      {
        "titulo": "El puesto de arepas",
        "contenido": {
          "texto": "Cada mañana, doña Consuelo instala su puesto de arepas frente a la escuela. Las hace con maíz molido a mano y las asa sobre un fogón de leña hasta que quedan doradas. Los estudiantes hacen fila antes de entrar a clase, y ella siempre tiene una palabra amable para cada uno mientras les entrega su desayuno envuelto en una hoja.",
          "palabras": 60,
          "ppmObjetivo": 100
        }
      },
      {
        "titulo": "La feria de animales",
        "contenido": {
          "texto": "Una vez al mes, el pueblo organiza una feria donde los campesinos venden e intercambian gallinas, cerdos y terneros. Desde temprano llegan camiones cargados de animales, y el ruido de mugidos y cacareos se mezcla con las voces de los vendedores anunciando sus precios. Para muchos niños, ir a la feria con sus padres es una de las salidas más esperadas del mes.",
          "palabras": 63,
          "ppmObjetivo": 105
        }
      },
      {
        "titulo": "El paseo de fin de año",
        "contenido": {
          "texto": "Al terminar el año escolar, los estudiantes de sexto grado organizaron un paseo a una quebrada cercana. Llevaron sombrillas para el sol, sancocho preparado por las mamás y un balón para jugar en la orilla. Aunque el agua estaba helada, casi todos se metieron a nadar, y al final del día regresaron cansados pero felices de haber compartido con sus compañeros.",
          "palabras": 61,
          "ppmObjetivo": 110
        }
      },
      {
        "titulo": "La cancha del pueblo",
        "contenido": {
          "texto": "Los domingos por la tarde, la cancha del pueblo se convierte en el lugar más alegre de Guateque. Los niños juegan fútbol descalzos mientras los abuelos observan desde la sombra de los árboles. Cuando el balón se va lejos, todos corren a buscarlo entre los pastizales. Al caer la noche, los jugadores regresan a sus casas cansados, sudorosos y planeando el partido del próximo domingo.",
          "palabras": 65,
          "ppmObjetivo": 112
        }
      },
      {
        "titulo": "La neblina de la madrugada",
        "contenido": {
          "texto": "En las mañanas frías, una neblina espesa cubre las montañas del Valle de Tenza. Los estudiantes que madrugan para ir al colegio apenas pueden ver el camino, así que caminan despacio y muy juntos. Poco a poco, el sol va subiendo y la neblina se levanta como una cortina blanca. Entonces aparecen las casas, los potreros y las vacas que estuvieron ahí todo el tiempo.",
          "palabras": 65,
          "ppmObjetivo": 113
        }
      },
      {
        "titulo": "El ternero nuevo",
        "contenido": {
          "texto": "Esta semana nació un ternero en la finca de la familia Torres. Es de color café con manchas blancas y todavía camina con las patas temblorosas. Julián, el hijo menor, le lleva agua fresca todas las tardes y ya le puso nombre: Lucero, por la mancha clara que tiene en la frente. El veterinario dijo que el ternero está sano y que en pocas semanas correrá por todo el potrero.",
          "palabras": 70,
          "ppmObjetivo": 114
        }
      },
      {
        "titulo": "La tienda de don Jaime",
        "contenido": {
          "texto": "La tienda de don Jaime queda en la esquina de la plaza y vende de todo: pan, velas, cuadernos, dulces y hasta botas para el trabajo en el campo. Los vecinos no solo van a comprar, también van a conversar, porque don Jaime siempre conoce las noticias del pueblo. Dicen que su tienda tiene más de cuarenta años y que nunca ha cerrado un solo día, ni siquiera en Navidad.",
          "palabras": 70,
          "ppmObjetivo": 115
        }
      }
    ]
  },
  "7°": {
    "PALABRAS": [
      {
        "titulo": "Familia de 'tierra'",
        "contenido": {
          "instruccion": "¿Cuál palabra pertenece a la familia de 'tierra'?",
          "opciones": [
            "terrestre",
            "terrible",
            "tienda"
          ],
          "respuesta": "terrestre",
          "explicacion": "'Terrestre' comparte la raíz terr- de 'tierra'. 'Terrible' viene de terror y 'tienda' no tiene relación, aunque suenen parecido."
        }
      },
      {
        "titulo": "Prefijo in-",
        "contenido": {
          "instruccion": "El prefijo 'in-' en la palabra 'inmóvil' significa:",
          "opciones": [
            "no",
            "dentro",
            "muy"
          ],
          "respuesta": "no",
          "explicacion": "En 'inmóvil' el prefijo in- niega la palabra: significa 'que NO se mueve'. Compara: incompleto, invisible."
        }
      },
      {
        "titulo": "Derivado de 'flor'",
        "contenido": {
          "instruccion": "¿Cuál palabra es un derivado de 'flor'?",
          "opciones": [
            "florero",
            "flotar",
            "flauta"
          ],
          "respuesta": "florero",
          "explicacion": "'Florero' deriva de 'flor' (el recipiente donde se ponen flores). 'Flotar' y 'flauta' solo se parecen en las letras iniciales."
        }
      },
      {
        "titulo": "Sufijo -mente",
        "contenido": {
          "instruccion": "El sufijo '-mente' convierte un adjetivo en:",
          "opciones": [
            "adverbio",
            "sustantivo",
            "verbo"
          ],
          "respuesta": "adverbio",
          "explicacion": "El sufijo -mente convierte adjetivos en adverbios de modo: rápida → rápidamente, lenta → lentamente."
        }
      },
      {
        "titulo": "Palabra aguda",
        "contenido": {
          "instruccion": "¿Cuál de estas palabras es aguda?",
          "opciones": [
            "café",
            "mesa",
            "árbol"
          ],
          "respuesta": "café",
          "explicacion": "'Café' es aguda: la fuerza de voz cae en la última sílaba (ca-FÉ) y lleva tilde por terminar en vocal. 'Mesa' y 'árbol' son graves."
        }
      },
      {
        "titulo": "Prefijo re-",
        "contenido": {
          "instruccion": "La palabra 'releer' significa:",
          "opciones": [
            "volver a leer",
            "leer mal",
            "dejar de leer"
          ],
          "respuesta": "volver a leer",
          "explicacion": "El prefijo re- indica repetición: releer es volver a leer, igual que rehacer o repasar."
        }
      },
      {
        "titulo": "Familia de 'pan'",
        "contenido": {
          "instruccion": "¿Cuál palabra pertenece a la familia de 'pan'?",
          "opciones": [
            "panadería",
            "pantano",
            "pantalla"
          ],
          "respuesta": "panadería",
          "explicacion": "'Panadería' viene de 'pan' (lugar donde se hace y vende). 'Pantano' y 'pantalla' empiezan parecido pero no pertenecen a esta familia."
        }
      },
      {
        "titulo": "Sufijo -ería",
        "contenido": {
          "instruccion": "En la palabra 'zapatería', el sufijo '-ería' indica:",
          "opciones": [
            "un lugar o negocio",
            "un tamaño pequeño",
            "una cualidad de la persona"
          ],
          "respuesta": "un lugar o negocio",
          "explicacion": "El sufijo -ería señala el lugar o negocio donde se hace o vende algo: zapatería, panadería, papelería."
        }
      }
    ],
    "COMPRENSION": [
      {
        "titulo": "Un viaje en chiva",
        "contenido": {
          "texto": "Sofía subió por primera vez a una chiva para ir a visitar a su abuela. El bus, pintado de colores brillantes, subía despacio por la carretera destapada mientras sonaba música desde un parlante. Sofía sacó la cabeza por la ventana para sentir el viento fresco de la montaña.",
          "pregunta": "¿Qué sintió Sofía al sacar la cabeza por la ventana?",
          "opciones": [
            "Calor",
            "Viento fresco",
            "Sueño"
          ],
          "respuesta": "Viento fresco",
          "explicacion": "El texto lo dice: Sofía sacó la cabeza por la ventana 'para sentir el viento fresco de la montaña'.",
          "nivel": "literal"
        }
      },
      {
        "titulo": "El apagón en la vereda",
        "contenido": {
          "texto": "Una noche de tormenta, se fue la luz en toda la vereda. Camilo buscó las velas que su abuela guardaba en la cocina y las repartió por la casa. Su hermana menor se asustó con los truenos, así que Camilo le contó historias hasta que se quedó dormida. Cuando volvió la luz, ya casi amanecía.",
          "pregunta": "¿Qué se puede inferir sobre Camilo a partir del texto?",
          "opciones": [
            "Que le teme a las tormentas",
            "Que cuidó a su hermana durante el apagón",
            "Que no sabía dónde estaban las velas"
          ],
          "respuesta": "Que cuidó a su hermana durante el apagón",
          "explicacion": "Se infiere de sus acciones: buscó las velas y calmó a su hermana contándole historias hasta que se durmió. Eso es cuidar de ella.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "El zapatero del pueblo",
        "contenido": {
          "texto": "Don Aurelio lleva cuarenta años arreglando zapatos en su pequeño taller. Sus manos están curtidas de tanto coser cuero, pero sus ojos brillan cada vez que entrega un par de zapatos como nuevos. Aunque ya podría descansar, dice que no imagina sus días sin el olor a pegante y cuero de su taller.",
          "pregunta": "¿Qué se puede inferir sobre los sentimientos de don Aurelio hacia su oficio?",
          "opciones": [
            "Le disgusta su trabajo pero no tiene otra opción",
            "Siente pasión y disfruta profundamente su oficio",
            "Está pensando en cambiar de oficio pronto"
          ],
          "respuesta": "Siente pasión y disfruta profundamente su oficio",
          "explicacion": "Las pistas están en el texto: sus ojos 'brillan' al entregar los zapatos y no imagina sus días sin el taller. Eso revela pasión por su oficio.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "La salida de observación",
        "contenido": {
          "texto": "En la clase de ciencias, la profesora llevó a los estudiantes al río para observar los insectos que viven cerca del agua. Daniela anotó en su cuaderno todo lo que veía, mientras que Esteban se distrajo lanzando piedras al agua. Al final, solo Daniela pudo responder las preguntas del taller.",
          "pregunta": "¿Por qué crees que solo Daniela pudo responder las preguntas?",
          "opciones": [
            "Porque estudió el tema antes de la salida",
            "Porque prestó atención y tomó notas durante la observación",
            "Porque la profesora le dio las respuestas"
          ],
          "respuesta": "Porque prestó atención y tomó notas durante la observación",
          "explicacion": "Daniela prestó atención y tomó notas durante la observación; Esteban se distrajo. Por eso solo ella pudo responder el taller.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "La carta de la abuela",
        "contenido": {
          "texto": "Camila recibió una carta escrita a mano por su abuela, que vive en otra vereda. Al leerla, se enteró de que su abuela había estado enferma, aunque en la carta insistía en que ya estaba mejor y que no había motivo para preocuparse. Camila leyó dos veces la parte donde decía 'ojalá vengas pronto', y esa misma tarde le pidió a su papá que la llevara el fin de semana.",
          "pregunta": "¿Qué se puede inferir del deseo de la abuela?",
          "opciones": [
            "Que no quiere recibir visitas en su casa",
            "Que extraña a Camila y quiere verla",
            "Que está molesta con la familia"
          ],
          "respuesta": "Que extraña a Camila y quiere verla",
          "explicacion": "Aunque la abuela no lo dice directamente, el 'ojalá vengas pronto' deja ver que extraña a Camila y quiere verla.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "El aviso de la alcaldía",
        "contenido": {
          "texto": "En la cartelera del parque apareció este aviso: 'La alcaldía informa que el próximo sábado se realizará una jornada de vacunación gratuita para perros y gatos, de 8 de la mañana a 2 de la tarde, en el coliseo municipal. Se recomienda llevar las mascotas con correa o en guacal, y llegar temprano para evitar aglomeraciones.'",
          "pregunta": "¿Cuál es el propósito principal del aviso?",
          "opciones": [
            "Contar una historia sobre mascotas del pueblo",
            "Informar sobre una jornada de vacunación e indicar cómo participar",
            "Vender correas y guacales para mascotas"
          ],
          "respuesta": "Informar sobre una jornada de vacunación e indicar cómo participar",
          "explicacion": "El aviso informa sobre la jornada de vacunación (fecha, hora, lugar) y da recomendaciones para participar. Ese es su propósito.",
          "nivel": "literal"
        }
      },
      {
        "titulo": "Ruana en pleno sol",
        "contenido": {
          "texto": "Aunque el día estaba soleado, don Ernesto salió de la casa con su ruana de lana al hombro. Su nieto le preguntó por qué la llevaba si hacía calor. Don Ernesto sonrió y le respondió: 'En estas montañas el clima cambia sin avisar; el que conoce la tierra no le cree al sol de la mañana'. Efectivamente, a las cuatro de la tarde cayó un aguacero helado.",
          "pregunta": "¿Por qué don Ernesto llevó la ruana a pesar del sol?",
          "opciones": [
            "Porque sabía por experiencia que el clima podía cambiar",
            "Porque le gustaba presumir su ruana nueva",
            "Porque su nieto se lo pidió"
          ],
          "respuesta": "Porque sabía por experiencia que el clima podía cambiar",
          "explicacion": "Don Ernesto conoce el clima de la montaña por experiencia: 'el que conoce la tierra no le cree al sol de la mañana'. Y en efecto, cayó un aguacero.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "Las almojábanas de la tía",
        "contenido": {
          "texto": "Para preparar almojábanas se necesita cuajada fresca, harina de maíz, huevos y un poco de azúcar. Primero se desmenuza la cuajada y se mezcla con la harina hasta formar una masa suave. Luego se agregan los huevos y el azúcar, se arman bolitas y se llevan al horno caliente hasta que doren. Se sirven calientes, acompañadas de chocolate espumoso.",
          "pregunta": "¿Qué tipo de texto acabas de leer?",
          "opciones": [
            "Un cuento, porque narra una historia inventada",
            "Un texto instructivo, porque explica paso a paso cómo preparar algo",
            "Una noticia, porque informa sobre un hecho reciente"
          ],
          "respuesta": "Un texto instructivo, porque explica paso a paso cómo preparar algo",
          "explicacion": "Es un texto instructivo porque explica paso a paso cómo preparar algo, como toda receta: ingredientes y procedimiento en orden.",
          "nivel": "literal"
        }
      }
    ],
    "FLUIDEZ": [
      {
        "titulo": "La cosecha de arracacha",
        "contenido": {
          "texto": "En las veredas altas del Valle de Tenza, la cosecha de arracacha empieza cuando las hojas se ponen amarillas. Los campesinos cavan con cuidado alrededor de cada mata para no dañar las raíces. Después de sacarlas, las lavan en agua fría y las cargan en costales hasta el camino, donde un camión las recoge para llevarlas al mercado. Es un trabajo que exige fuerza y paciencia, sobre todo cuando el terreno es empinado.",
          "palabras": 73,
          "ppmObjetivo": 110
        }
      },
      {
        "titulo": "El puente colgante",
        "contenido": {
          "texto": "Cerca de la vereda El Roble hay un puente colgante que cruza una quebrada profunda. Los estudiantes lo atraviesan todos los días para llegar a la escuela, sintiendo cómo se mece un poco con cada paso. Los mayores cuentan que el puente tiene más de treinta años y que antes cruzaban la quebrada en canoa, algo mucho más peligroso en época de lluvias.",
          "palabras": 63,
          "ppmObjetivo": 113
        }
      },
      {
        "titulo": "El taller de tejidos",
        "contenido": {
          "texto": "En un pequeño taller del pueblo, doña Inés enseña a tejer ruanas de lana a un grupo de jóvenes los fines de semana. Primero les explica cómo hilar la lana cruda, luego cómo escoger los colores y finalmente cómo armar el telar. Algunos estudiantes pensaban que tejer era solo cosa de personas mayores, pero después de unas semanas ya tenían sus propias ruanas a medio terminar.",
          "palabras": 66,
          "ppmObjetivo": 117
        }
      },
      {
        "titulo": "Una tarde de pesca",
        "contenido": {
          "texto": "Santiago y su tío fueron a pescar a la quebrada una tarde de vacaciones. Llevaron cañas hechas a mano y una lata con lombrices como carnada. Esperaron en silencio durante casi una hora sin que picara ningún pez, hasta que finalmente algo tiró fuerte del anzuelo. Santiago luchó por sacar el pez mientras su tío lo animaba desde la orilla.",
          "palabras": 60,
          "ppmObjetivo": 120
        }
      },
      {
        "titulo": "La ruta del lechero",
        "contenido": {
          "texto": "Antes de que amanezca, el camión lechero recorre las veredas recogiendo las cantinas que los campesinos dejan a la orilla del camino. El conductor conoce cada parada de memoria y saluda a los madrugadores con un pito corto. En la parte de atrás, las cantinas de aluminio suenan como campanas con cada hueco de la carretera. Para muchas familias, esa leche que viaja al amanecer es el ingreso con el que pagan el estudio de sus hijos.",
          "palabras": 77,
          "ppmObjetivo": 122
        }
      },
      {
        "titulo": "El vivero de la vereda",
        "contenido": {
          "texto": "En el vivero de la vereda, los estudiantes de séptimo aprendieron a sembrar árboles nativos para recuperar la quebrada. Primero llenaron cientos de bolsas con tierra abonada, luego sembraron las semillas y las regaron con cuidado durante semanas. Cuando los arbolitos alcanzaron el tamaño adecuado, toda la comunidad subió a plantarlos en la ribera. El profesor les explicó que esos árboles protegerán el agua que sus propios nietos van a beber.",
          "palabras": 71,
          "ppmObjetivo": 123
        }
      },
      {
        "titulo": "El molino de la abuela",
        "contenido": {
          "texto": "En la cocina de la abuela Rosa hay un molino de hierro que lleva tres generaciones en la familia. Con él se muele el maíz para las arepas, el café tostado en callana y hasta la sal de piedra. Cuando alguien propone comprar un molino eléctrico, la abuela se niega: dice que la comida molida a mano sabe a paciencia. Los nietos se turnan para darle vuelta a la manivela, aunque terminen con el brazo adolorido.",
          "palabras": 76,
          "ppmObjetivo": 124
        }
      },
      {
        "titulo": "El campeonato intercursos",
        "contenido": {
          "texto": "El campeonato intercursos es el evento más esperado del año en el colegio. Cada curso arma su equipo, diseña su uniforme y prepara barras para animar desde las graderías. Este año, la final se jugó entre séptimo y noveno, y aunque los mayores eran favoritos, séptimo ganó en los penaltis. La celebración fue tan ruidosa que el rector tuvo que esperar diez minutos para poder entregar el trofeo.",
          "palabras": 68,
          "ppmObjetivo": 125
        }
      }
    ]
  },
  "8°": {
    "PALABRAS": [
      {
        "titulo": "Conector: pero",
        "contenido": {
          "instruccion": "Completa: 'Quería salir a jugar, ___ estaba lloviendo muy fuerte.'",
          "opciones": [
            "pero",
            "además",
            "porque"
          ],
          "respuesta": "pero",
          "explicacion": "'Pero' expresa oposición entre las dos ideas: quería salir y la lluvia lo impedía. 'Además' agrega información y 'porque' introduce una causa."
        }
      },
      {
        "titulo": "Homófona: echar",
        "contenido": {
          "instruccion": "Elige la palabra correcta: 'Voy a ___ la carta antes de enviarla.'",
          "opciones": [
            "echar",
            "hechar",
            "hechal"
          ],
          "respuesta": "echar",
          "explicacion": "'Echar' (lanzar, poner, enviar) se escribe sin h. No confundir con 'hecho', del verbo hacer, que sí lleva h."
        }
      },
      {
        "titulo": "Conector: porque",
        "contenido": {
          "instruccion": "Completa: 'Llegó tarde a clase ___ el bus se dañó en el camino.'",
          "opciones": [
            "porque",
            "sin embargo",
            "además"
          ],
          "respuesta": "porque",
          "explicacion": "'Porque' introduce la causa de lo que pasó: llegó tarde a causa de que el bus se dañó."
        }
      },
      {
        "titulo": "Homófona: valla",
        "contenido": {
          "instruccion": "Elige la palabra correcta: 'La ___ de madera separa los dos terrenos.'",
          "opciones": [
            "valla",
            "vaya",
            "baya"
          ],
          "respuesta": "valla",
          "explicacion": "'Valla' con v y ll es la cerca que separa terrenos. 'Vaya' es del verbo ir y 'baya' es un tipo de fruto."
        }
      },
      {
        "titulo": "Conector: sin embargo",
        "contenido": {
          "instruccion": "El conector 'sin embargo' introduce:",
          "opciones": [
            "una oposición o contraste",
            "una causa",
            "un ejemplo"
          ],
          "respuesta": "una oposición o contraste",
          "explicacion": "'Sin embargo' introduce una oposición o contraste con lo dicho antes, igual que 'pero' aunque más formal."
        }
      },
      {
        "titulo": "Homófona: hierba",
        "contenido": {
          "instruccion": "Elige la palabra correcta: 'El ganado come ___ fresca.'",
          "opciones": [
            "hierba",
            "hierva",
            "ierba"
          ],
          "respuesta": "hierba",
          "explicacion": "'Hierba' con b es la planta que come el ganado. 'Hierva' con v es del verbo hervir ('que hierva el agua')."
        }
      },
      {
        "titulo": "Conector: además",
        "contenido": {
          "instruccion": "El conector 'además' sirve para:",
          "opciones": [
            "agregar información",
            "negar lo anterior",
            "expresar una condición"
          ],
          "respuesta": "agregar información",
          "explicacion": "'Además' sirve para agregar información nueva a lo ya dicho, no para oponer ni para explicar causas."
        }
      },
      {
        "titulo": "Homófona: tubo",
        "contenido": {
          "instruccion": "Elige la palabra correcta: 'El agua llega a la casa por un ___ de plástico.'",
          "opciones": [
            "tubo",
            "tuvo",
            "tubó"
          ],
          "respuesta": "tubo",
          "explicacion": "'Tubo' con b es el cilindro por donde pasa el agua. 'Tuvo' con v es el pasado del verbo tener."
        }
      }
    ],
    "COMPRENSION": [
      {
        "titulo": "¿Por qué llueve más en las montañas?",
        "contenido": {
          "texto": "Cuando el viento húmedo que viene del valle choca contra una montaña, se ve obligado a subir. Al subir, el aire se enfría, y el vapor de agua que lleva se condensa formando nubes. Por eso, en zonas montañosas como el Valle de Tenza, suele llover con más frecuencia que en terrenos planos cercanos, incluso en la misma época del año.",
          "pregunta": "Según el texto, ¿por qué llueve más en las montañas?",
          "opciones": [
            "Porque las montañas atraen los rayos",
            "Porque el aire húmedo sube, se enfría y forma nubes",
            "Porque el viento no llega a las zonas planas"
          ],
          "respuesta": "Porque el aire húmedo sube, se enfría y forma nubes",
          "explicacion": "El texto explica la cadena de causas: el aire húmedo choca con la montaña, sube, se enfría y el vapor se condensa formando nubes.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "El impacto de la sequía en los cultivos",
        "contenido": {
          "texto": "Cuando una región pasa varias semanas sin lluvia, la tierra pierde la humedad que las plantas necesitan para absorber nutrientes. Como consecuencia, las hojas de los cultivos empiezan a marchitarse y el crecimiento se detiene. Si la sequía continúa, los agricultores pueden perder gran parte de la cosecha, lo que afecta directamente sus ingresos.",
          "pregunta": "¿Cuál es la consecuencia directa de que la tierra pierda humedad?",
          "opciones": [
            "Los precios bajan inmediatamente",
            "Las plantas absorben más nutrientes",
            "Las hojas se marchitan y el crecimiento se detiene"
          ],
          "respuesta": "Las hojas se marchitan y el crecimiento se detiene",
          "explicacion": "El texto señala la consecuencia directa: al perder humedad la tierra, 'las hojas empiezan a marchitarse y el crecimiento se detiene'.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "¿Por qué se erosiona el suelo?",
        "contenido": {
          "texto": "Cuando se talan los árboles de una ladera, las raíces que sostenían la tierra desaparecen. Sin esa red de raíces, la lluvia arrastra la capa fértil del suelo hacia los ríos, dejando terrenos pobres y difíciles de cultivar. Este proceso, llamado erosión, es una de las razones por las que muchas comunidades rurales promueven la siembra de árboles.",
          "pregunta": "¿Qué provoca la erosión del suelo según el texto?",
          "opciones": [
            "El exceso de siembra de árboles",
            "La tala de árboles que sostenían la tierra con sus raíces",
            "La construcción de cuencas artificiales"
          ],
          "respuesta": "La tala de árboles que sostenían la tierra con sus raíces",
          "explicacion": "La causa está en el texto: al talar los árboles desaparecen las raíces que sostenían la tierra, y la lluvia arrastra la capa fértil.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "El efecto de dormir poco en el aprendizaje",
        "contenido": {
          "texto": "Diversos estudios muestran que los adolescentes que duermen menos de siete horas tienen más dificultad para concentrarse en clase y para recordar lo que estudiaron el día anterior. Esto ocurre porque, durante el sueño profundo, el cerebro organiza y consolida la información nueva. Por esta razón, muchos colegios recomiendan horarios de sueño regulares.",
          "pregunta": "¿Por qué dormir poco afecta el aprendizaje, según el texto?",
          "opciones": [
            "Porque el cuerpo necesita más comida",
            "Porque el cerebro no logra organizar y consolidar la información durante el sueño",
            "Porque los exámenes son más difíciles en la noche"
          ],
          "respuesta": "Porque el cerebro no logra organizar y consolidar la información durante el sueño",
          "explicacion": "Según el texto, durante el sueño profundo el cerebro organiza y consolida la información nueva; dormir poco interrumpe ese proceso.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "El páramo, fábrica de agua",
        "contenido": {
          "texto": "Los páramos son ecosistemas de alta montaña únicos de los Andes tropicales. Sus plantas más famosas, los frailejones, capturan la humedad de la niebla en sus hojas peludas y la dejan escurrir lentamente hacia el suelo, que actúa como una gigantesca esponja. Esa agua alimenta los ríos y acueductos de los que dependen millones de colombianos. Por eso, dañar un páramo no afecta solo a la montaña: seca los grifos de las ciudades.",
          "pregunta": "Según el texto, ¿cómo contribuyen los frailejones al ciclo del agua?",
          "opciones": [
            "Capturan la humedad de la niebla y la llevan lentamente al suelo",
            "Absorben el agua de los ríos cercanos",
            "Impiden que llueva en la montaña"
          ],
          "respuesta": "Capturan la humedad de la niebla y la llevan lentamente al suelo",
          "explicacion": "El texto lo explica: los frailejones capturan la humedad de la niebla en sus hojas y la dejan escurrir lentamente hacia el suelo.",
          "nivel": "literal"
        }
      },
      {
        "titulo": "Oídos tapados en la carretera",
        "contenido": {
          "texto": "Al bajar en bus desde las montañas del Valle de Tenza hacia tierras más bajas, muchos pasajeros sienten los oídos tapados. Esto ocurre porque la presión del aire aumenta a medida que se desciende, mientras que el aire dentro del oído mantiene por un momento la presión de la altura. Esa diferencia empuja el tímpano y produce la molestia. Bostezar o masticar chicle ayuda a equilibrar las presiones, y el alivio llega con un pequeño 'clic'.",
          "pregunta": "¿Cuál es la causa de la molestia en los oídos durante el descenso?",
          "opciones": [
            "La velocidad del bus en las curvas",
            "La diferencia entre la presión del aire externo y la del oído",
            "El ruido del motor del bus"
          ],
          "respuesta": "La diferencia entre la presión del aire externo y la del oído",
          "explicacion": "La causa es la diferencia de presión: al descender, el aire de afuera tiene más presión que el aire dentro del oído, y esa diferencia empuja el tímpano.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "Murciélagos incomprendidos",
        "contenido": {
          "texto": "Pocas criaturas cargan con tan mala fama como los murciélagos, y pocas la merecen menos. La mayoría de las especies se alimenta de insectos: un solo murciélago puede devorar cientos de zancudos en una noche, controlando plagas que afectan cultivos y transmiten enfermedades. Otras especies se alimentan de néctar y polinizan plantas, o dispersan semillas que regeneran los bosques. Espantarlos o destruir sus refugios, lejos de protegernos, elimina a un aliado silencioso del campo.",
          "pregunta": "¿Cuál es la idea global del texto?",
          "opciones": [
            "Los murciélagos son peligrosos y deben alejarse de los cultivos",
            "Los murciélagos tienen mala fama, pero prestan servicios valiosos al campo",
            "Todos los murciélagos se alimentan de néctar"
          ],
          "respuesta": "Los murciélagos tienen mala fama, pero prestan servicios valiosos al campo",
          "explicacion": "La idea global del texto es que, a pesar de su mala fama, los murciélagos ayudan al campo: controlan plagas, polinizan y dispersan semillas.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "Energía que baja de la montaña",
        "contenido": {
          "texto": "Una hidroeléctrica aprovecha una ley simple de la física: el agua que cae desde una gran altura acumula energía de movimiento. En plantas como la del embalse cercano al Valle de Tenza, el agua se conduce por túneles inclinados hasta las turbinas, que giran con la fuerza del chorro. Ese giro mueve los generadores que producen electricidad. Cuanto mayor sea la altura de la caída, más energía se obtiene del mismo volumen de agua; por eso estas centrales se construyen en zonas montañosas.",
          "pregunta": "Según el texto, ¿por qué las hidroeléctricas se construyen en zonas montañosas?",
          "opciones": [
            "Porque allí llueve menos que en el valle",
            "Porque una mayor altura de caída produce más energía",
            "Porque las turbinas no funcionan en tierra plana"
          ],
          "respuesta": "Porque una mayor altura de caída produce más energía",
          "explicacion": "El texto lo dice al final: cuanto mayor sea la altura de la caída del agua, más energía se obtiene; por eso se construyen en zonas montañosas.",
          "nivel": "literal"
        }
      }
    ],
    "FLUIDEZ": [
      {
        "titulo": "El oficio del panadero",
        "contenido": {
          "texto": "Desde las cuatro de la mañana, el panadero del pueblo enciende el horno de leña para que esté listo cuando llegue la masa. Amasa la harina con agua, sal y levadura, y deja reposar cada bola de pan el tiempo justo antes de hornearla. El calor del horno llena toda la cuadra de un olor que despierta a los vecinos incluso antes de que suene su despertador. Para las seis de la mañana, ya hay clientes haciendo fila por el pan caliente.",
          "palabras": 82,
          "ppmObjetivo": 120
        }
      },
      {
        "titulo": "La biblioteca ambulante",
        "contenido": {
          "texto": "Cada quince días, una camioneta cargada de libros recorre las veredas más alejadas del municipio. El bibliotecario instala una mesa bajo un árbol y deja que los niños escojan los libros que más les llamen la atención. Para algunos estudiantes, esa camioneta es la única forma de acceder a cuentos e historias distintas a las que ya conocen, porque en sus casas no hay internet ni librerías cercanas.",
          "palabras": 68,
          "ppmObjetivo": 124
        }
      },
      {
        "titulo": "El reciclaje en la escuela",
        "contenido": {
          "texto": "Este año, la escuela del pueblo puso en marcha un proyecto de reciclaje liderado por los estudiantes de octavo grado. Cada salón tiene tres canecas de colores distintos para separar el papel, el plástico y los residuos orgánicos. Una vez al mes, los estudiantes pesan lo recolectado y lo entregan a una fundación que transforma el plástico en materiales de construcción. Al principio muchos olvidaban separar bien la basura, pero con el tiempo casi todo el colegio se acostumbró.",
          "palabras": 79,
          "ppmObjetivo": 127
        }
      },
      {
        "titulo": "El festival de las cometas gigantes",
        "contenido": {
          "texto": "Todos los años, en agosto, el pueblo organiza un festival donde los jóvenes compiten construyendo las cometas más grandes y coloridas. Algunas alcanzan más de dos metros de ancho y necesitan varias personas para sostenerlas mientras el viento las levanta. Los jueces evalúan no solo el diseño, sino también cuánto tiempo logra mantenerse la cometa en el aire sin caer. El año pasado, un grupo de octavo grado ganó el primer lugar con una cometa en forma de cóndor.",
          "palabras": 79,
          "ppmObjetivo": 130
        }
      },
      {
        "titulo": "La represa del río Batá",
        "contenido": {
          "texto": "A pocos kilómetros del Valle de Tenza se encuentra una de las represas más grandes del país, construida sobre el río Batá. El agua embalsada cae con enorme fuerza por túneles excavados en la montaña y hace girar turbinas que generan energía eléctrica para millones de hogares colombianos. La construcción de la represa cambió la vida de la región: pueblos enteros fueron trasladados y el paisaje se transformó con el gran lago artificial. Hoy, además de producir energía, el embalse atrae visitantes que practican la pesca deportiva y los deportes náuticos.",
          "palabras": 91,
          "ppmObjetivo": 132
        }
      },
      {
        "titulo": "¿Por qué hace más frío en la montaña?",
        "contenido": {
          "texto": "Aunque la montaña está más cerca del sol que el valle, en la cima hace más frío. La explicación está en el aire: a mayor altura, el aire es menos denso y retiene menos calor. Además, el suelo del valle absorbe la energía del sol durante el día y la libera lentamente, calentando el aire que lo rodea. Por eso los campesinos del Valle de Tenza siembran cultivos distintos según la altura de su terreno: maíz y frutales en las partes bajas, papa y cebolla en las tierras altas y frías.",
          "palabras": 91,
          "ppmObjetivo": 135
        }
      },
      {
        "titulo": "El acueducto veredal",
        "contenido": {
          "texto": "El agua que llega a las casas de la vereda no aparece por arte de magia: nace en un manantial protegido en la parte alta de la montaña. De allí baja por tuberías hasta un tanque de almacenamiento donde se le hace un tratamiento sencillo antes de distribuirla. El acueducto es administrado por la misma comunidad: cada familia paga una cuota mensual y participa en las jornadas de limpieza y mantenimiento. Cuando una tubería se rompe, los vecinos se organizan para repararla, porque saben que el agua es responsabilidad de todos.",
          "palabras": 91,
          "ppmObjetivo": 137
        }
      },
      {
        "titulo": "Las heladas de enero",
        "contenido": {
          "texto": "En enero, cuando el cielo amanece completamente despejado, los campesinos de las tierras altas se preocupan. Sin nubes que retengan el calor durante la noche, la temperatura puede bajar de cero grados y formar una capa de escarcha sobre los cultivos. Esa escarcha, conocida como helada, quema las hojas de la papa y puede acabar con meses de trabajo en una sola madrugada. Para defenderse, algunos agricultores riegan sus cultivos al amanecer o instalan cortinas de árboles que protegen los sembrados. Aun así, cada año las heladas dejan pérdidas que obligan a muchas familias a empezar de nuevo.",
          "palabras": 98,
          "ppmObjetivo": 140
        }
      }
    ]
  },
  "9°": {
    "PALABRAS": [
      {
        "titulo": "Conector: en consecuencia",
        "contenido": {
          "instruccion": "La expresión 'en consecuencia' se usa para introducir:",
          "opciones": [
            "un resultado",
            "una comparación",
            "una duda"
          ],
          "respuesta": "un resultado",
          "explicacion": "'En consecuencia' introduce el resultado o efecto de lo dicho antes: 'Llovió toda la noche; en consecuencia, el partido se aplazó'."
        }
      },
      {
        "titulo": "Sinónimo de 'refutar'",
        "contenido": {
          "instruccion": "¿Cuál es un sinónimo de 'refutar'?",
          "opciones": [
            "contradecir",
            "confirmar",
            "ignorar"
          ],
          "respuesta": "contradecir",
          "explicacion": "Refutar es contradecir un argumento con razones. 'Confirmar' es lo contrario e 'ignorar' es no prestarle atención."
        }
      },
      {
        "titulo": "Conector: no obstante",
        "contenido": {
          "instruccion": "'No obstante' equivale a:",
          "opciones": [
            "sin embargo",
            "por lo tanto",
            "es decir"
          ],
          "respuesta": "sin embargo",
          "explicacion": "'No obstante' equivale a 'sin embargo': introduce una idea que se opone o matiza la anterior."
        }
      },
      {
        "titulo": "Vocabulario: hipótesis",
        "contenido": {
          "instruccion": "En un texto científico, 'hipótesis' significa:",
          "opciones": [
            "una suposición que se debe comprobar",
            "un resultado ya confirmado",
            "una ley universal"
          ],
          "respuesta": "una suposición que se debe comprobar",
          "explicacion": "Una hipótesis es una suposición inicial que todavía debe comprobarse con evidencia; no es un resultado confirmado ni una ley."
        }
      },
      {
        "titulo": "Conector: por ende",
        "contenido": {
          "instruccion": "La expresión 'por ende' equivale a:",
          "opciones": [
            "por lo tanto",
            "sin embargo",
            "por ejemplo"
          ],
          "respuesta": "por lo tanto",
          "explicacion": "'Por ende' equivale a 'por lo tanto': introduce la conclusión que se sigue de lo anterior."
        }
      },
      {
        "titulo": "Vocabulario: sustentar",
        "contenido": {
          "instruccion": "'Sustentar' un argumento significa:",
          "opciones": [
            "respaldarlo con razones o pruebas",
            "repetirlo en voz alta",
            "escribirlo con buena letra"
          ],
          "respuesta": "respaldarlo con razones o pruebas",
          "explicacion": "Sustentar un argumento es respaldarlo con razones, datos o pruebas que lo hagan sólido."
        }
      },
      {
        "titulo": "Objetivo y subjetivo",
        "contenido": {
          "instruccion": "Una afirmación 'subjetiva' es aquella que:",
          "opciones": [
            "expresa un punto de vista personal",
            "puede verificarse con datos",
            "siempre es falsa"
          ],
          "respuesta": "expresa un punto de vista personal",
          "explicacion": "Lo subjetivo expresa un punto de vista personal (opiniones, gustos); lo objetivo puede verificarse con datos independientes de quien habla."
        }
      },
      {
        "titulo": "Vocabulario: contraargumento",
        "contenido": {
          "instruccion": "Un 'contraargumento' es:",
          "opciones": [
            "una razón que se opone a un argumento",
            "un resumen del texto",
            "una pregunta sin respuesta"
          ],
          "respuesta": "una razón que se opone a un argumento",
          "explicacion": "Un contraargumento es la razón que se opone a un argumento para rebatirlo; es la base del debate."
        }
      }
    ],
    "COMPRENSION": [
      {
        "titulo": "¿Deberían los celulares estar prohibidos en el colegio?",
        "contenido": {
          "texto": "Algunos docentes proponen prohibir el uso de celulares durante toda la jornada escolar, argumentando que distraen a los estudiantes y afectan su concentración en clase. Sin embargo, otros consideran que el problema no es el celular en sí, sino la falta de acuerdos claros sobre cuándo usarlo. Prohibirlo por completo podría impedir su uso en actividades educativas, como buscar información o resolver ejercicios interactivos.",
          "pregunta": "¿Cuál es la tesis principal que defiende el autor del texto?",
          "opciones": [
            "Los celulares deben prohibirse sin excepción",
            "El problema es la falta de acuerdos claros sobre su uso, no el celular en sí",
            "Los celulares solo sirven para distraer"
          ],
          "respuesta": "El problema es la falta de acuerdos claros sobre su uso, no el celular en sí",
          "explicacion": "La tesis del autor aparece tras el 'sin embargo': el problema no es el celular en sí, sino la falta de acuerdos claros sobre cuándo usarlo.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "La importancia de separar la basura",
        "contenido": {
          "texto": "Separar los residuos en la fuente es una de las acciones más simples que una familia puede hacer para reducir su impacto ambiental. Aunque tomar cinco minutos al día para clasificar la basura parece poco, multiplicado por miles de hogares representa toneladas de material que pueden reciclarse. Por eso, más que una obligación impuesta por la ley, debería entenderse como una responsabilidad compartida.",
          "pregunta": "¿Qué opinión defiende el autor sobre separar la basura?",
          "opciones": [
            "Que es una pérdida de tiempo innecesaria",
            "Que debería verse como una responsabilidad compartida, no solo una obligación legal",
            "Que solo las fábricas deben separar sus residuos"
          ],
          "respuesta": "Que debería verse como una responsabilidad compartida, no solo una obligación legal",
          "explicacion": "El autor concluye que separar los residuos 'debería entenderse como una responsabilidad compartida', más que una obligación impuesta por la ley.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "¿Es necesario el uniforme escolar?",
        "contenido": {
          "texto": "Quienes defienden el uniforme escolar argumentan que reduce la desigualdad visible entre estudiantes de distintos recursos económicos. Los que se oponen sostienen que limita la expresión individual de los jóvenes en una etapa clave de su desarrollo. Ambas posturas coinciden, sin embargo, en que el verdadero objetivo debería ser garantizar un ambiente escolar respetuoso, más allá de lo que cada estudiante lleve puesto.",
          "pregunta": "¿En qué coinciden ambas posturas presentadas en el texto?",
          "opciones": [
            "En que el uniforme debe eliminarse ya",
            "En que el objetivo real es un ambiente escolar respetuoso, sin importar el vestuario",
            "En que la ropa define el rendimiento académico"
          ],
          "respuesta": "En que el objetivo real es un ambiente escolar respetuoso, sin importar el vestuario",
          "explicacion": "El texto presenta dos posturas opuestas, pero señala en qué coinciden: el objetivo real es un ambiente escolar respetuoso, sin importar el vestuario.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "El valor de aprender un segundo idioma",
        "contenido": {
          "texto": "Aprender un segundo idioma no solo abre puertas laborales, sino que también entrena la mente para pensar de formas distintas, ya que cada idioma organiza las ideas de manera diferente. Algunos estudiantes creen que solo vale la pena si planean viajar, pero investigadores señalan beneficios cognitivos incluso para quienes nunca salen de su país, como una mejor memoria y mayor flexibilidad para resolver problemas.",
          "pregunta": "Según el texto, ¿cuál es un beneficio de aprender un idioma que no depende de viajar?",
          "opciones": [
            "Ninguno, solo sirve para viajar",
            "Mejora la memoria y la flexibilidad para resolver problemas",
            "Solo sirve para conseguir empleo"
          ],
          "respuesta": "Mejora la memoria y la flexibilidad para resolver problemas",
          "explicacion": "El texto cita beneficios cognitivos que no dependen de viajar: mejor memoria y mayor flexibilidad para resolver problemas.",
          "nivel": "literal"
        }
      },
      {
        "titulo": "Menos memoria, más criterio",
        "contenido": {
          "texto": "Durante décadas, la escuela premió la memorización: capitales, fechas, fórmulas. Hoy, cualquier estudiante consulta esos datos en segundos desde un teléfono. Lo que ningún buscador ofrece es el criterio para decidir si una información es confiable, pertinente o engañosa. Por eso, más que llenar la memoria de datos, la escuela actual debería concentrarse en enseñar a evaluar la información: esa es la habilidad que separa al ciudadano informado del simplemente conectado.",
          "pregunta": "¿Cuál es la tesis que defiende el autor?",
          "opciones": [
            "Memorizar capitales y fechas es la base de la buena educación",
            "La escuela debería enfocarse en enseñar a evaluar la información más que en memorizar datos",
            "Los teléfonos deberían prohibirse en las aulas"
          ],
          "respuesta": "La escuela debería enfocarse en enseñar a evaluar la información más que en memorizar datos",
          "explicacion": "La tesis es la propuesta central del autor: la escuela debería enseñar a evaluar la información, más que llenar la memoria de datos que ya da un buscador.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "La tienda escolar saludable",
        "contenido": {
          "texto": "Algunos colegios han reemplazado los paquetes y las gaseosas de sus tiendas escolares por frutas y jugos naturales. Los defensores de la medida citan un dato contundente: según estudios de nutrición, los hábitos alimenticios que se forman en la adolescencia tienden a mantenerse durante la vida adulta. Si el colegio normaliza el consumo diario de azúcar y frituras, estará formando adultos con mayores riesgos de salud. La tienda escolar, argumentan, también educa.",
          "pregunta": "¿Cuál es el argumento principal que usan los defensores de la medida?",
          "opciones": [
            "Las frutas son más baratas que los paquetes",
            "Los hábitos alimenticios de la adolescencia tienden a mantenerse en la adultez",
            "Las gaseosas dañan los dientes de los estudiantes"
          ],
          "respuesta": "Los hábitos alimenticios de la adolescencia tienden a mantenerse en la adultez",
          "explicacion": "El argumento principal es el dato de nutrición que citan: los hábitos alimenticios formados en la adolescencia tienden a mantenerse en la vida adulta.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "¿Hecho u opinión?",
        "contenido": {
          "texto": "Lee estas afirmaciones sobre el mismo tema: (1) 'El municipio recogió el año pasado 240 toneladas de residuos sólidos'. (2) 'La gente de este pueblo es muy descuidada con la basura'. (3) 'Las campañas de reciclaje redujeron en un 15% los residuos que llegan al relleno sanitario'. Las cifras de las afirmaciones 1 y 3 provienen del informe anual de la empresa de aseo.",
          "pregunta": "¿Cuál de las afirmaciones es una opinión y no un hecho verificable?",
          "opciones": [
            "La afirmación 1",
            "La afirmación 2",
            "La afirmación 3"
          ],
          "respuesta": "La afirmación 2",
          "explicacion": "La afirmación 2 es una opinión: 'muy descuidada' es un juicio personal que no se puede medir. Las afirmaciones 1 y 3 son cifras verificables del informe.",
          "nivel": "critico"
        }
      },
      {
        "titulo": "La propuesta de don Gustavo",
        "contenido": {
          "texto": "En la reunión de la junta de acción comunal, don Gustavo tomó la palabra: 'Vecinos, todos sabemos que el puente de la quebrada está en mal estado. Ya son tres los accidentes este año, y en invierno el riesgo será mayor. La alcaldía prometió los materiales, pero necesita que nosotros pongamos la mano de obra. Yo propongo que hagamos una minga el próximo sábado. ¿Quién se apunta?'",
          "pregunta": "¿Cuál es la intención principal de don Gustavo?",
          "opciones": [
            "Informar sobre el clima de la región",
            "Convencer a los vecinos de participar en la reparación del puente",
            "Criticar a la alcaldía por incumplida"
          ],
          "respuesta": "Convencer a los vecinos de participar en la reparación del puente",
          "explicacion": "Don Gustavo no solo informa: da razones (accidentes, invierno) y cierra con '¿quién se apunta?'. Su intención es convencer a los vecinos de participar.",
          "nivel": "inferencial"
        }
      }
    ],
    "FLUIDEZ": [
      {
        "titulo": "El café de la región",
        "contenido": {
          "texto": "El Valle de Tenza no es una zona cafetera tradicional, pero en las últimas décadas algunos caficultores han empezado a sembrar variedades adaptadas a la altura de la región. El proceso empieza con la selección de las semillas, sigue con meses de cuidado de los almácigos, y termina con la recolección manual de los granos maduros, uno por uno, para garantizar un café de buena calidad. Aunque el volumen de producción es pequeño, varios caficultores locales han logrado vender su café directamente a compradores que valoran su origen particular.",
          "palabras": 89,
          "ppmObjetivo": 130
        }
      },
      {
        "titulo": "La radio comunitaria",
        "contenido": {
          "texto": "Desde hace más de veinte años, una emisora comunitaria transmite noticias, música y avisos parroquiales para varias veredas del municipio. A diferencia de las grandes cadenas nacionales, sus locutores son vecinos del pueblo que conocen personalmente a buena parte de su audiencia, lo que les permite anunciar desde una vaca perdida hasta la fecha de una minga comunitaria. En época de emergencias, la radio se convierte en el medio más confiable para que la información llegue rápido a las zonas más apartadas.",
          "palabras": 82,
          "ppmObjetivo": 134
        }
      },
      {
        "titulo": "El regreso de las aves migratorias",
        "contenido": {
          "texto": "Cada año, entre septiembre y octubre, cientos de aves migratorias que vienen desde Norteamérica pasan por los humedales cercanos al Valle de Tenza en su camino hacia el sur del continente. Los observadores de aves de la región aprovechan esta temporada para registrar las especies que ven, información que luego se comparte con investigadores interesados en entender cómo el cambio climático está modificando las rutas migratorias tradicionales.",
          "palabras": 67,
          "ppmObjetivo": 137
        }
      },
      {
        "titulo": "El taller de robótica rural",
        "contenido": {
          "texto": "Un grupo de estudiantes de noveno grado, junto con un profesor de tecnología, empezó un taller de robótica usando materiales reciclados y piezas económicas conseguidas por internet. Al principio, muchos dudaban de que fuera posible construir robots funcionales sin un laboratorio especializado, pero con paciencia y varios intentos fallidos, lograron armar un pequeño brazo mecánico capaz de mover objetos livianos. El proyecto llamó la atención de otros colegios de la región.",
          "palabras": 71,
          "ppmObjetivo": 140
        }
      },
      {
        "titulo": "El turismo que llegó al embalse",
        "contenido": {
          "texto": "Desde hace algunos años, el turismo se convirtió en una fuente de ingresos importante para varios municipios del Valle de Tenza. Los visitantes llegan atraídos por el embalse, los miradores y la tranquilidad de los pueblos, y las familias locales han respondido abriendo hospedajes rurales, restaurantes y rutas guiadas. Sin embargo, el crecimiento también genera debates: algunos habitantes temen que el aumento de visitantes encarezca la vida del pueblo y afecte las fuentes de agua. Los alcaldes de la región buscan un equilibrio: promover el turismo sin sacrificar la vocación agrícola que ha sostenido a estas comunidades por generaciones.",
          "palabras": 99,
          "ppmObjetivo": 142
        }
      },
      {
        "titulo": "Oficios que se niegan a desaparecer",
        "contenido": {
          "texto": "En tiempos de compras por internet y productos fabricados en serie, algunos oficios tradicionales del Valle de Tenza resisten. Los talladores de piedra, las tejedoras de fique y los carpinteros de puertas talladas siguen trabajando con técnicas heredadas de sus abuelos. No es solo nostalgia: sus productos tienen una calidad y una identidad que las fábricas no logran imitar, y cada pieza cuenta una historia local. Algunas alcaldías han comenzado a organizar ferias artesanales para conectar a estos maestros con compradores de las ciudades, convencidas de que proteger un oficio tradicional es proteger también la memoria de la región.",
          "palabras": 99,
          "ppmObjetivo": 145
        }
      },
      {
        "titulo": "¿Estudiar lejos o quedarse?",
        "contenido": {
          "texto": "Cada diciembre, los graduados de los colegios rurales enfrentan la misma decisión: irse a estudiar a la ciudad o quedarse a trabajar en el campo. Irse significa acceder a universidades y empleos diversos, pero también asumir costos de vivienda que muchas familias no pueden pagar. Quedarse permite apoyar a los padres y conservar la tierra, aunque las oportunidades de formación sean escasas. En los últimos años ha surgido una tercera vía: los programas de educación virtual y las sedes regionales de algunas universidades, que permiten estudiar sin abandonar el territorio. Ninguna opción es perfecta, y cada historia familiar hace que la respuesta sea distinta.",
          "palabras": 104,
          "ppmObjetivo": 147
        }
      },
      {
        "titulo": "La minga: trabajo que une",
        "contenido": {
          "texto": "La minga es una tradición heredada de los pueblos indígenas que todavía se practica en muchas veredas de Boyacá. Consiste en reunir a la comunidad para realizar un trabajo que beneficia a todos: arreglar un camino, construir una caseta comunal o recoger la cosecha de una familia enferma. Nadie recibe pago en dinero; la recompensa es la comida compartida, la música y la certeza de que, cuando uno necesite ayuda, los vecinos también responderán. Los sociólogos ven en la minga un ejemplo de capital social: esa red de confianza mutua que permite a una comunidad lograr lo que ninguna familia conseguiría sola, y que ningún presupuesto oficial puede reemplazar.",
          "palabras": 109,
          "ppmObjetivo": 150
        }
      }
    ]
  },
  "10°": {
    "PALABRAS": [
      {
        "titulo": "Metáfora",
        "contenido": {
          "instruccion": "'Sus palabras eran dagas que herían sin tocar la piel' es un ejemplo de:",
          "opciones": [
            "metáfora",
            "comparación explícita",
            "onomatopeya"
          ],
          "respuesta": "metáfora",
          "explicacion": "Es una metáfora: identifica directamente las palabras con dagas, sin usar 'como'. Si dijera 'palabras como dagas' sería una comparación explícita."
        }
      },
      {
        "titulo": "Hipérbole",
        "contenido": {
          "instruccion": "'Lloré un río de lágrimas toda la noche' es un ejemplo de:",
          "opciones": [
            "hipérbole",
            "metonimia",
            "aliteración"
          ],
          "respuesta": "hipérbole",
          "explicacion": "'Llorar un río de lágrimas' es una exageración deliberada para intensificar la emoción: eso es una hipérbole."
        }
      },
      {
        "titulo": "Connotación: invierno",
        "contenido": {
          "instruccion": "En un poema triste, la palabra 'invierno' probablemente tiene un sentido connotativo relacionado con:",
          "opciones": [
            "la vejez o la tristeza",
            "la temperatura exacta",
            "un mes del calendario"
          ],
          "respuesta": "la vejez o la tristeza",
          "explicacion": "En un poema triste, 'invierno' no informa la temperatura: sugiere tristeza, frialdad o vejez. Ese es su sentido connotativo."
        }
      },
      {
        "titulo": "Símil",
        "contenido": {
          "instruccion": "'Corría tan rápido como el viento' es un ejemplo de:",
          "opciones": [
            "símil o comparación",
            "metáfora pura",
            "personificación"
          ],
          "respuesta": "símil o comparación",
          "explicacion": "Usa el nexo comparativo 'tan... como': es un símil o comparación explícita. La metáfora identifica sin nexo."
        }
      },
      {
        "titulo": "Personificación",
        "contenido": {
          "instruccion": "'El viento susurraba entre los pinos' es un ejemplo de:",
          "opciones": [
            "personificación",
            "hipérbole",
            "onomatopeya"
          ],
          "respuesta": "personificación",
          "explicacion": "Atribuye una acción humana (susurrar) a algo que no lo es (el viento): personificación o prosopopeya."
        }
      },
      {
        "titulo": "Connotación: serpiente",
        "contenido": {
          "instruccion": "Al llamar 'serpiente' a una persona, la palabra se usa en sentido:",
          "opciones": [
            "connotativo: sugiere desconfianza o traición",
            "denotativo: se refiere al reptil",
            "técnico: describe su forma de moverse"
          ],
          "respuesta": "connotativo: sugiere desconfianza o traición",
          "explicacion": "Al llamar 'serpiente' a una persona no se habla del reptil: se sugiere traición o desconfianza. Ese es el sentido connotativo."
        }
      },
      {
        "titulo": "Ironía",
        "contenido": {
          "instruccion": "'¡Qué puntualidad la tuya!', dijo la profesora al estudiante que llegó al final de la clase. Esta expresión es un ejemplo de:",
          "opciones": [
            "ironía",
            "símil",
            "aliteración"
          ],
          "respuesta": "ironía",
          "explicacion": "La profesora dice lo contrario de lo que piensa ('qué puntualidad') para resaltar la tardanza: eso es ironía."
        }
      },
      {
        "titulo": "Metonimia",
        "contenido": {
          "instruccion": "'Se comió toda la olla' (refiriéndose a la comida que contiene) es un ejemplo de:",
          "opciones": [
            "metonimia",
            "hipérbole",
            "personificación"
          ],
          "respuesta": "metonimia",
          "explicacion": "Se nombra el recipiente (la olla) para referirse a su contenido (la comida): metonimia de continente por contenido."
        }
      }
    ],
    "COMPRENSION": [
      {
        "titulo": "El silencio también comunica",
        "contenido": {
          "texto": "En muchas conversaciones, damos por hecho que el sentido está solo en las palabras que se dicen, mientras ignoramos lo que se calla deliberadamente. Un silencio prolongado ante una pregunta incómoda puede comunicar tanto —o más— que una respuesta elaborada. Los buenos negociadores y los actores de teatro lo saben: una pausa bien calculada transmite duda, desacuerdo o incluso una negativa, sin necesidad de pronunciar una sola palabra.",
          "pregunta": "¿Qué se puede inferir sobre la postura del autor frente al silencio en la comunicación?",
          "opciones": [
            "Considera que el silencio no tiene ningún valor comunicativo",
            "Sostiene que el silencio puede ser tan significativo como las palabras",
            "Cree que solo los actores deben usar el silencio"
          ],
          "respuesta": "Sostiene que el silencio puede ser tan significativo como las palabras",
          "explicacion": "El autor sostiene que una pausa bien usada 'transmite duda, desacuerdo o incluso una negativa': el silencio puede decir tanto como las palabras.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "La trampa de la comparación constante",
        "contenido": {
          "texto": "Las redes sociales muestran, casi siempre, la versión más editada de la vida de los demás: el viaje, el logro, la foto perfecta. Compararse con esas versiones incompletas puede generar una insatisfacción difícil de justificar, porque no se está comparando una vida completa con otra, sino un momento cuidadosamente seleccionado con la totalidad de la propia experiencia, incluidos los días comunes y las dificultades que nadie publica.",
          "pregunta": "¿Qué se puede inferir como causa principal de la insatisfacción que describe el autor?",
          "opciones": [
            "Comparar una vida completa con otra vida completa",
            "Comparar momentos editados ajenos con la propia vida completa, incluidos sus días difíciles",
            "La falta de logros personales reales"
          ],
          "respuesta": "Comparar momentos editados ajenos con la propia vida completa, incluidos sus días difíciles",
          "explicacion": "La causa que señala el autor es comparar 'un momento cuidadosamente seleccionado' de otros con la totalidad de la propia vida, incluidos los días difíciles.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "Aprender del error en lugar de temerle",
        "contenido": {
          "texto": "En muchos entornos educativos, el error todavía se percibe como algo que debe evitarse a toda costa, penalizado con una nota baja. Sin embargo, en campos como la ciencia o el diseño, el error es una fuente constante de información: un experimento fallido revela tanto como uno exitoso, siempre que se analice con atención. La diferencia entre estudiantes que avanzan rápido y los que se estancan no suele estar en la cantidad de errores que cometen, sino en lo que deciden hacer después de cometerlos.",
          "pregunta": "Según el texto, ¿qué distingue realmente a los estudiantes que avanzan más rápido?",
          "opciones": [
            "Cometer menos errores que los demás",
            "Lo que hacen después de cometer un error, no la cantidad de errores",
            "Evitar por completo situaciones de riesgo"
          ],
          "respuesta": "Lo que hacen después de cometer un error, no la cantidad de errores",
          "explicacion": "El texto lo dice: la diferencia no está en cuántos errores se cometen, sino en 'lo que deciden hacer después de cometerlos'.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "El costo invisible de la prisa",
        "contenido": {
          "texto": "Vivir apurados se ha vuelto tan común que rara vez nos detenemos a calcular su costo real. No se trata solo del cansancio físico, sino de decisiones tomadas sin suficiente reflexión: un mensaje enviado sin releer, una compra hecha sin comparar, una discusión resuelta con la primera respuesta que viene a la mente. La prisa no ahorra tanto tiempo como promete, porque muchas de esas decisiones apresuradas terminan exigiendo tiempo adicional para corregirlas.",
          "pregunta": "¿Cuál es la idea central que defiende el autor sobre la prisa?",
          "opciones": [
            "Que ahorra tiempo de forma efectiva siempre",
            "Que genera decisiones apresuradas que después requieren tiempo extra para corregirse",
            "Que solo afecta el cansancio físico"
          ],
          "respuesta": "Que genera decisiones apresuradas que después requieren tiempo extra para corregirse",
          "explicacion": "La idea central es que la prisa no ahorra lo que promete: las decisiones apresuradas terminan exigiendo tiempo adicional para corregirlas.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "El ruido de fondo",
        "contenido": {
          "texto": "Nos hemos acostumbrado tanto al ruido que el silencio incomoda. Comemos con el televisor encendido, caminamos con audífonos, estudiamos con música. No es que el sonido sea malo; es que hemos perdido la capacidad de estar en silencio sin sentir que falta algo. Y en esa pérdida se va también un espacio valioso: el que la mente necesita para ordenar sus propios pensamientos sin interferencias.",
          "pregunta": "¿Qué actitud asume el autor frente al silencio?",
          "opciones": [
            "Lo considera una incomodidad que debe evitarse",
            "Lo valora como un espacio necesario para el pensamiento propio",
            "Le resulta completamente indiferente"
          ],
          "respuesta": "Lo valora como un espacio necesario para el pensamiento propio",
          "explicacion": "El autor valora el silencio como un espacio necesario: el que la mente necesita 'para ordenar sus propios pensamientos sin interferencias'.",
          "nivel": "inferencial"
        }
      },
      {
        "titulo": "Conversaciones de pantalla",
        "contenido": {
          "texto": "Es común ver mesas donde cuatro amigos comparten el espacio físico mientras cada uno conversa, por chat, con personas que están en otra parte. La escena tiene algo de paradoja: la tecnología que promete conectarnos con los lejanos nos desconecta de los cercanos. Nadie propone renunciar al celular; la pregunta es si somos nosotros quienes usamos la herramienta o si es la herramienta la que ha aprendido a usarnos.",
          "pregunta": "¿Qué critica principalmente el autor?",
          "opciones": [
            "Que la tecnología funcione mal",
            "Que la conexión digital nos desconecte de quienes tenemos cerca",
            "Que los amigos ya no se reúnan nunca en persona"
          ],
          "respuesta": "Que la conexión digital nos desconecte de quienes tenemos cerca",
          "explicacion": "La crítica central es la paradoja que describe: la tecnología que promete conectarnos con los lejanos nos desconecta de los cercanos.",
          "nivel": "critico"
        }
      },
      {
        "titulo": "Volver al campo",
        "contenido": {
          "texto": "Cuando un joven profesional anuncia que regresa al campo, todavía hay quien lo mira con lástima, como si hubiera fracasado en la ciudad. Pocos advierten que ese regreso suele ser una decisión informada: aplicar conocimientos de administración, agronomía o comercio digital a la tierra familiar puede ser más rentable —y más sensato— que competir por un arriendo en la capital. El fracaso, si acaso, está en una sociedad que sigue midiendo el éxito por el lugar donde se vive y no por lo que se construye.",
          "pregunta": "¿Cuál es la postura del autor frente al regreso de los jóvenes al campo?",
          "opciones": [
            "La ve como un fracaso disfrazado de decisión",
            "La defiende como una decisión informada y sensata",
            "Le parece imposible de lograr en la práctica"
          ],
          "respuesta": "La defiende como una decisión informada y sensata",
          "explicacion": "El autor defiende el regreso como 'una decisión informada' y sensata; para él, el fracaso está en medir el éxito por el lugar donde se vive.",
          "nivel": "critico"
        }
      },
      {
        "titulo": "La función del ejemplo",
        "contenido": {
          "texto": "Se dice que la puntualidad es una forma de respeto, y quizás ningún ejemplo lo ilustre mejor que el del médico rural que atiende citas en veredas lejanas: si se retrasa una hora, el campesino que caminó desde la madrugada pierde la mañana entera de trabajo. La impuntualidad, vista así, no es un simple descuido personal: es una manera de decidir que el tiempo propio vale más que el ajeno.",
          "pregunta": "¿Qué función cumple el ejemplo del médico rural en el texto?",
          "opciones": [
            "Ilustrar la idea de que la impuntualidad desvaloriza el tiempo del otro",
            "Demostrar que los médicos rurales son impuntuales",
            "Describir cómo es la vida en las veredas"
          ],
          "respuesta": "Ilustrar la idea de que la impuntualidad desvaloriza el tiempo del otro",
          "explicacion": "El ejemplo del médico rural ilustra la idea central del texto: llegar tarde es decidir que el tiempo propio vale más que el del otro.",
          "nivel": "critico"
        }
      }
    ],
    "FLUIDEZ": [
      {
        "titulo": "El agua que no se ve",
        "contenido": {
          "texto": "Cuando hablamos de cuidar el agua, casi siempre pensamos en cerrar la llave mientras nos cepillamos los dientes o en tomar duchas más cortas. Sin embargo, gran parte del agua que consumimos no la vemos directamente, sino que está oculta en lo que llamamos agua virtual: la cantidad necesaria para producir los alimentos y objetos que usamos a diario. Fabricar una camiseta de algodón, por ejemplo, puede requerir miles de litros de agua durante el cultivo, procesamiento y teñido de la tela, mucho más de lo que cualquiera imaginaría al comprarla en una tienda.",
          "palabras": 94,
          "ppmObjetivo": 140
        }
      },
      {
        "titulo": "Las decisiones que no tomamos",
        "contenido": {
          "texto": "Solemos analizar con cuidado las decisiones que finalmente tomamos, pero rara vez reflexionamos sobre aquellas que descartamos casi sin pensar. Cada camino de vida que elegimos implica, al mismo tiempo, decenas de caminos que dejamos de explorar, y esa elección invisible influye tanto en quiénes somos como las decisiones que sí llevamos a cabo. Los psicólogos que estudian la toma de decisiones señalan que revisar conscientemente las opciones descartadas puede ayudarnos a entender mejor nuestros propios valores.",
          "palabras": 77,
          "ppmObjetivo": 144
        }
      },
      {
        "titulo": "La memoria de los objetos",
        "contenido": {
          "texto": "Existen objetos cotidianos que, sin tener ningún valor económico especial, guardan un significado enorme para quien los conserva: una libreta con anotaciones de la infancia, una herramienta heredada de un abuelo, una taza descascarada que nadie más usaría. Estos objetos funcionan como anclas de memoria, capaces de traer de vuelta recuerdos completos con solo tocarlos o mirarlos. Los antropólogos han estudiado este fenómeno para entender por qué las personas se resisten a deshacerse de cosas aparentemente inútiles.",
          "palabras": 77,
          "ppmObjetivo": 148
        }
      },
      {
        "titulo": "El precio real de lo gratuito",
        "contenido": {
          "texto": "Muchos servicios digitales que usamos a diario se presentan como gratuitos, pero rara vez lo son en un sentido estricto. Cuando no pagamos con dinero por un producto, es común que estemos pagando con algo distinto: nuestros datos personales, nuestra atención constante o el tiempo que dedicamos a ver publicidad. Entender esta lógica no significa dejar de usar esos servicios, sino tomar decisiones más informadas sobre qué compartimos, con quién y a cambio de qué beneficio real recibimos.",
          "palabras": 78,
          "ppmObjetivo": 150
        }
      },
      {
        "titulo": "El arte de no hacer nada",
        "contenido": {
          "texto": "Vivimos en una época que premia la ocupación permanente: estar ocupado se volvió sinónimo de ser importante, y el descanso carga con una injusta fama de pereza. Sin embargo, la historia de la ciencia y del arte está llena de ideas que nacieron en momentos de aparente ociosidad: caminatas sin rumbo, tardes de contemplación, pausas en las que la mente divaga libremente. Los neurocientíficos explican que, cuando dejamos de enfocarnos en una tarea, el cerebro activa una red de conexiones que asocia recuerdos e ideas distantes, y de esas asociaciones inesperadas surgen soluciones creativas. Quizás el problema no sea el tiempo libre, sino nuestra incapacidad de habitarlo sin culpa.",
          "palabras": 109,
          "ppmObjetivo": 152
        }
      },
      {
        "titulo": "Lo que el mapa no muestra",
        "contenido": {
          "texto": "Un mapa parece un retrato objetivo del territorio, pero toda representación implica decisiones: qué se incluye, qué se omite y qué se destaca. Los mapas antiguos dibujaban monstruos en los océanos desconocidos; los actuales resaltan autopistas y centros comerciales, mientras las veredas y los caminos de herradura apenas aparecen como líneas borrosas. Esa jerarquía no es inocente: lo que no figura en el mapa tiende a no existir para quienes toman decisiones, desde inversiones públicas hasta rutas de transporte. Por eso algunas comunidades rurales han empezado a levantar sus propios mapas, señalando nacederos de agua, senderos y sitios sagrados, convencidas de que dibujar su territorio es una forma de defenderlo.",
          "palabras": 110,
          "ppmObjetivo": 155
        }
      },
      {
        "titulo": "La nostalgia como estrategia de mercado",
        "contenido": {
          "texto": "Las marcas descubrieron hace tiempo que la nostalgia vende. Relanzan productos descontinuados, resucitan logotipos antiguos y llenan su publicidad de referencias a décadas pasadas, apostando a que el consumidor asocie el producto con una época que recuerda como más simple y feliz. El mecanismo es eficaz porque la memoria es selectiva: al recordar la infancia, conservamos la emoción de los buenos momentos y olvidamos las incomodidades. Comprar el producto promete, en el fondo, recuperar esa sensación perdida. Entender esta estrategia no la vuelve menos efectiva, pero sí permite hacerse una pregunta incómoda frente al estante: ¿quiero este producto por lo que es, o por lo que me hace sentir que fui?",
          "palabras": 111,
          "ppmObjetivo": 157
        }
      },
      {
        "titulo": "La paciencia del roble",
        "contenido": {
          "texto": "Quien siembra un roble sabe que no verá su sombra plena: estos árboles pueden tardar décadas en alcanzar su madurez. Aun así, generaciones de campesinos han plantado árboles cuya sombra disfrutarían otros, en un gesto que desafía la lógica del beneficio inmediato. Esa paciencia contrasta con el ritmo actual, donde esperamos resultados instantáneos en casi todo: respuestas, entregas, éxitos. Tal vez por eso los bosques nos resultan tan reparadores; son la prueba viviente de que las cosas valiosas requieren tiempo, y de que hay proyectos cuyo sentido no está en verlos terminados, sino en haberlos comenzado bien. Plantar un árbol sigue siendo, en el fondo, una declaración de confianza en el futuro.",
          "palabras": 112,
          "ppmObjetivo": 160
        }
      }
    ]
  },
  "11°": {
    "PALABRAS": [
      {
        "titulo": "Polisemia: banco",
        "contenido": {
          "instruccion": "En la oración 'Se sentó en el banco del parque', la palabra 'banco' se refiere a:",
          "opciones": [
            "un asiento público",
            "una entidad financiera",
            "un grupo de peces"
          ],
          "respuesta": "un asiento público",
          "explicacion": "El contexto resuelve la polisemia: si 'se sentó en el banco del parque', se trata del asiento público, no de la entidad financiera."
        }
      },
      {
        "titulo": "Sinónimo académico: analizar",
        "contenido": {
          "instruccion": "¿Cuál es un sinónimo académico apropiado de 'analizar'?",
          "opciones": [
            "examinar",
            "ignorar",
            "resumir"
          ],
          "respuesta": "examinar",
          "explicacion": "'Examinar' es el sinónimo académico de analizar: estudiar algo con detalle y por partes. 'Resumir' es condensar, no analizar."
        }
      },
      {
        "titulo": "Significado de 'ambiguo'",
        "contenido": {
          "instruccion": "Una palabra o expresión 'ambigua' es aquella que:",
          "opciones": [
            "se puede interpretar de más de una forma",
            "es siempre falsa",
            "no tiene significado"
          ],
          "respuesta": "se puede interpretar de más de una forma",
          "explicacion": "Algo ambiguo admite más de una interpretación válida; por eso en textos académicos se pide evitar la ambigüedad."
        }
      },
      {
        "titulo": "Vocabulario académico: inferir",
        "contenido": {
          "instruccion": "En un contexto académico, 'inferir' significa:",
          "opciones": [
            "deducir algo a partir de datos o pistas",
            "copiar un texto textualmente",
            "memorizar información sin analizarla"
          ],
          "respuesta": "deducir algo a partir de datos o pistas",
          "explicacion": "Inferir es deducir información a partir de pistas o datos, leyendo 'entre líneas'; no es copiar ni memorizar."
        }
      },
      {
        "titulo": "Falacia ad hominem",
        "contenido": {
          "instruccion": "Descalificar a quien habla en lugar de responder su argumento se conoce como falacia:",
          "opciones": [
            "ad hominem",
            "de falsa autoridad",
            "de generalización apresurada"
          ],
          "respuesta": "ad hominem",
          "explicacion": "La falacia ad hominem ('contra el hombre') descalifica a la persona en lugar de responder su argumento. El argumento queda sin refutar."
        }
      },
      {
        "titulo": "Vocabulario: implícito",
        "contenido": {
          "instruccion": "Algo 'implícito' en un texto es aquello que:",
          "opciones": [
            "se entiende aunque no esté dicho directamente",
            "aparece escrito en el título",
            "es imposible de comprender"
          ],
          "respuesta": "se entiende aunque no esté dicho directamente",
          "explicacion": "Lo implícito no está escrito directamente pero se entiende por el contexto; el lector lo reconstruye mediante inferencias."
        }
      },
      {
        "titulo": "Vocabulario académico: corroborar",
        "contenido": {
          "instruccion": "En un contexto académico, 'corroborar' significa:",
          "opciones": [
            "confirmar con evidencia",
            "contradecir con firmeza",
            "resumir brevemente"
          ],
          "respuesta": "confirmar con evidencia",
          "explicacion": "Corroborar es confirmar una afirmación con evidencia adicional que la respalda."
        }
      },
      {
        "titulo": "Vocabulario: premisa",
        "contenido": {
          "instruccion": "En un razonamiento, una 'premisa' es:",
          "opciones": [
            "una afirmación de la que se parte para llegar a una conclusión",
            "la conclusión final de un ensayo",
            "un adorno del lenguaje poético"
          ],
          "respuesta": "una afirmación de la que se parte para llegar a una conclusión",
          "explicacion": "La premisa es la afirmación de la que parte un razonamiento; de las premisas se deriva la conclusión."
        }
      }
    ],
    "COMPRENSION": [
      {
        "titulo": "¿Correlación o causalidad?",
        "contenido": {
          "texto": "Un estudio encontró que, en cierta ciudad, los meses con mayor venta de helados coinciden con los meses de mayor número de ahogamientos en piscinas. Sería un error concluir que comer helado provoca ahogamientos: ambos fenómenos están relacionados con una tercera variable, la temporada de calor, que aumenta tanto el consumo de helados como la asistencia a piscinas. Este ejemplo ilustra un error común al interpretar datos: confundir una simple correlación estadística con una relación de causa y efecto directa.",
          "pregunta": "¿Cuál es el propósito principal del texto?",
          "opciones": [
            "Advertir sobre los riesgos de comer helado en verano",
            "Explicar la diferencia entre correlación y causalidad usando un ejemplo",
            "Demostrar que las piscinas son peligrosas en temporada de calor"
          ],
          "respuesta": "Explicar la diferencia entre correlación y causalidad usando un ejemplo",
          "explicacion": "El propósito del texto es explicar, con el ejemplo de los helados, que una correlación no implica causa: ambos fenómenos dependen de una tercera variable, el calor.",
          "nivel": "critico"
        }
      },
      {
        "titulo": "El sesgo de confirmación",
        "contenido": {
          "texto": "Cuando una persona ya tiene una opinión formada sobre un tema, tiende a prestar más atención a la información que confirma esa opinión y a ignorar o minimizar la que la contradice. Este fenómeno, conocido como sesgo de confirmación, no depende del nivel educativo de la persona, sino de un mecanismo mental común a todos los seres humanos. Ser consciente de este sesgo no lo elimina por completo, pero permite adoptar hábitos como buscar activamente fuentes que cuestionen las propias ideas.",
          "pregunta": "Según el texto, ¿qué determina principalmente la presencia del sesgo de confirmación en una persona?",
          "opciones": [
            "Su nivel educativo",
            "Un mecanismo mental común a todos los seres humanos",
            "La cantidad de libros que ha leído"
          ],
          "respuesta": "Un mecanismo mental común a todos los seres humanos",
          "explicacion": "El texto lo afirma directamente: el sesgo 'no depende del nivel educativo, sino de un mecanismo mental común a todos los seres humanos'.",
          "nivel": "critico"
        }
      },
      {
        "titulo": "Los límites de las encuestas de opinión",
        "contenido": {
          "texto": "Antes de unas elecciones, es común ver encuestas que anuncian el porcentaje de intención de voto de cada candidato. Sin embargo, estas cifras dependen de decisiones metodológicas que pocas veces se explican al público: cómo se seleccionó a los encuestados, cuántas personas respondieron realmente y qué margen de error tiene el estudio. Dos encuestas con metodologías distintas pueden arrojar resultados muy diferentes sobre el mismo fenómeno, lo que exige que el lector revise la ficha técnica antes de sacar conclusiones apresuradas.",
          "pregunta": "¿Qué actitud crítica promueve el texto frente a las encuestas de opinión?",
          "opciones": [
            "Confiar siempre en el primer resultado que se publique",
            "Revisar la metodología antes de sacar conclusiones sobre los resultados",
            "Ignorar por completo cualquier encuesta electoral"
          ],
          "respuesta": "Revisar la metodología antes de sacar conclusiones sobre los resultados",
          "explicacion": "El texto promueve revisar la ficha técnica (metodología, muestra, margen de error) antes de sacar conclusiones de una encuesta.",
          "nivel": "critico"
        }
      },
      {
        "titulo": "La paradoja de la elección",
        "contenido": {
          "texto": "Se suele asumir que tener más opciones siempre mejora nuestra capacidad de decidir, pero varios estudios en psicología del consumo sugieren lo contrario. Cuando las alternativas superan cierto número, muchas personas experimentan una parálisis de decisión: en lugar de elegir la mejor opción disponible, terminan posponiendo la decisión o sintiéndose insatisfechas con lo que finalmente eligieron, por temor a que otra opción hubiera sido mejor.",
          "pregunta": "¿Qué cuestiona la 'paradoja de la elección' descrita en el texto?",
          "opciones": [
            "Que exista alguna relación entre las opciones y la satisfacción",
            "La idea de que tener más opciones siempre genera mayor bienestar",
            "La utilidad de tomar decisiones rápidas"
          ],
          "respuesta": "La idea de que tener más opciones siempre genera mayor bienestar",
          "explicacion": "La paradoja cuestiona la creencia de que más opciones siempre son mejores: demasiadas alternativas pueden paralizar y generar insatisfacción.",
          "nivel": "critico"
        }
      },
      {
        "titulo": "La generalización apresurada",
        "contenido": {
          "texto": "Un turista visitó un pueblo durante un fin de semana lluvioso y escribió en sus redes: 'En ese pueblo llueve todo el tiempo; no lo recomiendo'. Su conclusión, basada en dos días, ignora que la región tiene temporadas secas bien definidas y que su visita coincidió con el mes más lluvioso del año. Este tipo de razonamiento —sacar una conclusión general a partir de muy pocos casos— es una de las fallas argumentativas más comunes, y las redes sociales la amplifican a diario.",
          "pregunta": "¿Qué error de razonamiento ilustra el texto?",
          "opciones": [
            "Atacar a la persona en lugar de su argumento",
            "Generalizar a partir de una muestra insuficiente",
            "Apelar a la autoridad de un experto"
          ],
          "respuesta": "Generalizar a partir de una muestra insuficiente",
          "explicacion": "El turista concluyó sobre todo el clima del pueblo a partir de solo dos días: generalizar desde una muestra insuficiente es el error del razonamiento.",
          "nivel": "critico"
        }
      },
      {
        "titulo": "El testimonio publicitario",
        "contenido": {
          "texto": "Un comercial muestra a un deportista famoso asegurando que cierta bebida es la clave de su rendimiento. El mensaje es persuasivo, pero conviene examinarlo: el deportista es experto en su disciplina, no en nutrición; recibe pago por la publicidad, lo que compromete su imparcialidad; y su éxito depende de años de entrenamiento, no de una bebida. Que una afirmación provenga de alguien admirado no la convierte en verdadera: la fama no es evidencia.",
          "pregunta": "¿Cuál es la razón central por la que el autor cuestiona el comercial?",
          "opciones": [
            "El deportista no es realmente famoso",
            "La admiración por una persona no es evidencia de que su afirmación sea cierta",
            "Las bebidas deportivas son dañinas para la salud"
          ],
          "respuesta": "La admiración por una persona no es evidencia de que su afirmación sea cierta",
          "explicacion": "La razón central del autor: que una afirmación venga de alguien famoso o admirado no la hace verdadera. La fama no es evidencia.",
          "nivel": "critico"
        }
      },
      {
        "titulo": "Dos posturas, un acuerdo",
        "contenido": {
          "texto": "Frente a un proyecto minero, dos columnistas publican opiniones opuestas. El primero sostiene que la mina traerá empleo y regalías para construir escuelas y vías. La segunda responde que los empleos durarán lo que dure el yacimiento, mientras que el daño a las fuentes de agua será permanente. A pesar del desacuerdo, ambos coinciden en un punto: la decisión no puede tomarse sin estudios técnicos independientes y sin consultar a la comunidad que habita el territorio.",
          "pregunta": "¿En qué coinciden los dos columnistas?",
          "opciones": [
            "En que la mina debe aprobarse cuanto antes",
            "En que la decisión requiere estudios independientes y consulta a la comunidad",
            "En que el empleo minero es permanente"
          ],
          "respuesta": "En que la decisión requiere estudios independientes y consulta a la comunidad",
          "explicacion": "A pesar del desacuerdo sobre la mina, ambos columnistas coinciden en exigir estudios técnicos independientes y consulta a la comunidad.",
          "nivel": "critico"
        }
      },
      {
        "titulo": "El algoritmo elige por ti",
        "contenido": {
          "texto": "Cada vez que una plataforma te 'recomienda' un video, una canción o una noticia, un algoritmo decidió por ti entre millones de opciones, usando tu historial para predecir qué te mantendrá conectado. El sistema no pregunta qué te conviene ver, sino qué es más probable que sigas viendo: no es lo mismo. Comprender esa diferencia es el primer paso para recuperar algo de autonomía: buscar deliberadamente lo que el algoritmo no ofrece, contrastar fuentes y decidir, de vez en cuando, apagar la recomendación.",
          "pregunta": "¿Cuál es el propósito principal del texto?",
          "opciones": [
            "Explicar cómo se programa un algoritmo de recomendaciones",
            "Advertir cómo operan las recomendaciones algorítmicas e invitar a usarlas con autonomía",
            "Promocionar una plataforma de videos"
          ],
          "respuesta": "Advertir cómo operan las recomendaciones algorítmicas e invitar a usarlas con autonomía",
          "explicacion": "El propósito del texto es advertir cómo funcionan las recomendaciones (predicen qué te mantiene conectado) e invitar a usarlas con autonomía.",
          "nivel": "critico"
        }
      }
    ],
    "FLUIDEZ": [
      {
        "titulo": "La desinformación en la era digital",
        "contenido": {
          "texto": "Nunca antes había sido tan fácil publicar información, y precisamente por eso nunca había sido tan difícil verificarla. Una noticia falsa bien diseñada puede alcanzar a millones de personas en minutos, mucho antes de que cualquier verificación de datos tenga la oportunidad de desmentirla, y para entonces buena parte de esa audiencia ya habrá formado una opinión basada en información incorrecta. Los especialistas en alfabetización mediática insisten en que la solución no es dejar de usar internet, sino desarrollar el hábito de contrastar las fuentes, revisar quién publica la información y preguntarse qué interés podría tener alguien en que una noticia particular se difunda ampliamente.",
          "palabras": 105,
          "ppmObjetivo": 150
        }
      },
      {
        "titulo": "El pensamiento crítico como herramienta",
        "contenido": {
          "texto": "Pensar críticamente no significa dudar de todo de manera automática, sino desarrollar la capacidad de evaluar la calidad de un argumento antes de aceptarlo o rechazarlo. Esto implica preguntarse qué evidencia respalda una afirmación, si esa evidencia proviene de una fuente confiable, y si existen explicaciones alternativas igual de razonables que no se han considerado todavía. En un entorno saturado de información, donde cualquiera puede publicar cualquier cosa con apariencia de autoridad, esta habilidad se vuelve tan importante como saber leer o escribir.",
          "palabras": 83,
          "ppmObjetivo": 155
        }
      },
      {
        "titulo": "El futuro del trabajo rural",
        "contenido": {
          "texto": "Durante décadas, se asumió que el desarrollo tecnológico beneficiaría principalmente a las ciudades, dejando al campo relegado a las tareas más tradicionales. Sin embargo, la llegada de conexiones a internet más estables a zonas rurales del país ha permitido que algunos agricultores accedan a información sobre precios, clima y técnicas de cultivo en tiempo real, mejorando decisiones que antes dependían solo de la experiencia acumulada. Aun así, persisten brechas importantes: mientras algunas veredas ya cuentan con conectividad razonable, otras siguen dependiendo de desplazamientos largos para realizar trámites básicos.",
          "palabras": 88,
          "ppmObjetivo": 158
        }
      },
      {
        "titulo": "La ciencia como proceso, no como certeza",
        "contenido": {
          "texto": "Fuera del ámbito académico, es común pensar en la ciencia como un conjunto de verdades fijas y definitivas, cuando en realidad se trata de un proceso continuo de revisión, donde las teorías se ajustan o incluso se descartan cuando aparece nueva evidencia que las contradice. Esta característica, lejos de ser una debilidad, es precisamente lo que distingue al conocimiento científico de otras formas de creencia: su disposición a cambiar frente a la evidencia, en lugar de aferrarse a una idea por tradición o autoridad.",
          "palabras": 84,
          "ppmObjetivo": 160
        }
      },
      {
        "titulo": "El costo oculto de la atención",
        "contenido": {
          "texto": "La economía digital descubrió que el recurso más escaso del siglo veintiuno no es el petróleo ni el dinero, sino la atención humana. Cada notificación, cada video sugerido y cada desplazamiento infinito de pantalla está diseñado por equipos de especialistas cuyo objetivo es retener nuestra mirada unos segundos más, porque esos segundos se traducen en ingresos publicitarios. El resultado es una competencia feroz por nuestra concentración, librada con herramientas de la psicología del comportamiento. Frente a este escenario, algunos investigadores proponen hablar de ecología de la atención: así como protegemos los ríos de la contaminación, tendríamos que proteger nuestros espacios mentales de la interrupción permanente. La primera medida, sugieren, es simple pero difícil: recuperar el derecho a estar inalcanzables durante algunas horas al día.",
          "palabras": 124,
          "ppmObjetivo": 162
        }
      },
      {
        "titulo": "¿Quién escribe la historia?",
        "contenido": {
          "texto": "Suele decirse que la historia la escriben los vencedores, pero la frase se queda corta: también la escriben quienes saben escribir, quienes tienen acceso a los archivos y quienes deciden qué documentos se conservan y cuáles se pierden. Durante siglos, la vida de campesinos, artesanos y comunidades enteras quedó fuera de los libros, no porque careciera de importancia, sino porque nadie con poder consideró necesario registrarla. Los historiadores actuales intentan corregir ese silencio recurriendo a fuentes alternativas: cartas familiares, registros de mercado, canciones tradicionales y memoria oral. Cada una de estas fuentes exige un análisis crítico, pues la memoria también selecciona y deforma. La lección para cualquier lector es doble: preguntarse siempre quién cuenta la historia, y qué voces faltan en el relato que tiene enfrente.",
          "palabras": 126,
          "ppmObjetivo": 165
        }
      },
      {
        "titulo": "Inteligencia artificial y oficio humano",
        "contenido": {
          "texto": "Cada vez que una tecnología nueva automatiza una tarea, se repite el mismo debate: unos anuncian el fin del trabajo humano y otros aseguran que no cambiará nada. La historia sugiere un punto intermedio. La fotografía no acabó con la pintura, pero la obligó a reinventarse; las calculadoras no eliminaron a los matemáticos, pero transformaron lo que hacen. Con la inteligencia artificial ocurre algo similar: las herramientas que redactan textos o generan imágenes ejecutan en segundos tareas que antes tomaban horas, y eso obliga a preguntarse qué aporta específicamente una persona. La respuesta provisional de muchos expertos es que el valor humano se desplaza hacia lo que las máquinas imitan mal: formular buenas preguntas, juzgar con criterio ético y responsabilizarse de las decisiones. El desafío educativo, entonces, no es competir con la máquina, sino cultivar lo que la distingue de nosotros.",
          "palabras": 141,
          "ppmObjetivo": 167
        }
      },
      {
        "titulo": "Leer en tiempos de resumen",
        "contenido": {
          "texto": "Vivimos rodeados de resúmenes: videos que condensan libros en diez minutos, hilos que explican una investigación en cinco frases, aplicaciones que prometen la sabiduría de un clásico en un desayuno. La síntesis tiene un valor innegable, pero conviene notar lo que se pierde en el camino. Un buen libro no solo entrega conclusiones: construye un razonamiento, muestra sus dudas, obliga al lector a sostener ideas complejas durante cientos de páginas. Esa experiencia entrena algo que ningún resumen puede transferir: la capacidad de pensar de forma prolongada sobre un mismo problema. Quien solo consume conclusiones ajenas se acostumbra a opinar sin haber recorrido el argumento, como quien presume de conocer un territorio porque vio la fotografía satelital. El resumen es un mapa útil, pero nadie aprende a caminar mirando mapas.",
          "palabras": 129,
          "ppmObjetivo": 170
        }
      }
    ]
  }
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

  const puntosBasePorModulo = PUNTOS_BASE_POR_MODULO;

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
// con nombres en español en vez de los códigos internos que usa el
// código de la aplicación (PALABRAS/COMPRENSION/FLUIDEZ, booleanos,
// IDs). No las usa la app — son solo para inspección manual.
// El carácter para citar identificadores depende del motor: MySQL usa
// acento grave (`), SQLite/Postgres usan comilla doble (").
async function crearVistasLegibles() {
  const esMysql = (process.env.DATABASE_URL || "").startsWith("mysql");
  const q = (identificador) => (esMysql ? `\`${identificador}\`` : `"${identificador}"`);

  const moduloLegible = (columna) => `
    CASE ${columna}
      WHEN 'PALABRAS' THEN 'Reconocer palabras'
      WHEN 'COMPRENSION' THEN 'Comprensión lectora'
      WHEN 'FLUIDEZ' THEN 'Fluidez lectora'
      ELSE ${columna}
    END`;

  await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS ${q("ActividadesLegibles")}`);
  await prisma.$executeRawUnsafe(`
    CREATE VIEW ${q("ActividadesLegibles")} AS
    SELECT
      a.id,
      a.curso AS grado,
      ${moduloLegible("a.modulo")} AS modulo,
      a.titulo,
      a.orden,
      a.${q("puntosBase")} AS puntos,
      a.contenido,
      a.${q("createdAt")} AS creada
    FROM ${q("Actividad")} a
    ORDER BY a.curso, a.modulo, a.orden
  `);

  await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS ${q("EstudiantesLegibles")}`);
  await prisma.$executeRawUnsafe(`
    CREATE VIEW ${q("EstudiantesLegibles")} AS
    SELECT
      id,
      nombre,
      usuario,
      curso AS grado,
      puntos,
      (puntos / 500) + 1 AS nivel,
      racha,
      ${q("ultimaActividadEn")} AS ${q("ultimaActividad")},
      ${q("createdAt")} AS creado
    FROM ${q("Estudiante")}
    ORDER BY puntos DESC
  `);

  await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS ${q("IntentosLegibles")}`);
  await prisma.$executeRawUnsafe(`
    CREATE VIEW ${q("IntentosLegibles")} AS
    SELECT
      i.id,
      e.nombre AS estudiante,
      e.curso AS grado,
      ${moduloLegible("act.modulo")} AS modulo,
      act.titulo AS actividad,
      CASE WHEN i.correcto THEN 'Sí' ELSE 'No' END AS correcto,
      i.${q("puntosGanados")} AS puntos,
      i.${q("creadoEn")} AS fecha
    FROM ${q("Intento")} i
    JOIN ${q("Estudiante")} e ON e.id = i.${q("estudianteId")}
    JOIN ${q("Actividad")} act ON act.id = i.${q("actividadId")}
    ORDER BY i.${q("creadoEn")} DESC
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
