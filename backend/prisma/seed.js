const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const docentes = [
  { nombre: "Martha Bernal", usuario: "mbernal", password: "docente123" },
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

const actividadesPalabras = [
  {
    titulo: "Nombra el objeto",
    contenido: {
      instruccion: "Elige la palabra que nombra el objeto: 📚",
      opciones: ["libro", "lino", "lobo"],
      respuesta: "libro",
    },
  },
  {
    titulo: "Ortografía del colibrí",
    contenido: {
      instruccion: "¿Cuál palabra está bien escrita?",
      opciones: ["colivrí", "colibrí", "colibri"],
      respuesta: "colibrí",
    },
  },
  {
    titulo: "Completa la frase",
    contenido: {
      instruccion: "Completa: El sol brilla en el ___.",
      opciones: ["cielo", "suelo", "hielo"],
      respuesta: "cielo",
    },
  },
  {
    titulo: "Sinónimos",
    contenido: {
      instruccion: "¿Cuál es un sinónimo de 'contento'?",
      opciones: ["triste", "feliz", "cansado"],
      respuesta: "feliz",
    },
  },
  {
    titulo: "Palabras que riman",
    contenido: {
      instruccion: "Elige la palabra que rima con 'flor'",
      opciones: ["color", "pan", "gato"],
      respuesta: "color",
    },
  },
];

const actividadesComprension = [
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
    titulo: "El mercado de Guateque",
    contenido: {
      texto:
        "Todos los sábados, la plaza de Guateque se llena de puestos coloridos. Los campesinos bajan de las veredas con canastos de mazorca, papa y frutas. Doña Elvira siempre trae flores para vender, y su puesto huele a rosas desde temprano en la mañana.",
      pregunta: "¿Qué vende doña Elvira en el mercado?",
      opciones: ["Papa y mazorca", "Flores", "Canastos"],
      respuesta: 1,
    },
  },
  {
    titulo: "La laguna encantada",
    contenido: {
      texto:
        "Cerca del pueblo hay una laguna rodeada de niebla. Los abuelos cuentan que, si te acercas al amanecer, puedes ver reflejado el cielo entero en el agua quieta. Por eso algunos la llaman el 'espejo de las montañas'.",
      pregunta: "¿Por qué llaman a la laguna 'espejo de las montañas'?",
      opciones: [
        "Porque está rodeada de niebla",
        "Porque el agua quieta refleja el cielo",
        "Porque los abuelos viven cerca",
      ],
      respuesta: 1,
    },
  },
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
    titulo: "El maestro de la vereda",
    contenido: {
      texto:
        "Don Jairo camina todos los días una hora para llegar a la escuela de la vereda. Lleva en su maleta libros, colores y una vieja guitarra. Los estudiantes lo esperan en la puerta porque saben que, después de la clase de matemáticas, tocará una canción.",
      pregunta: "¿Qué lleva don Jairo en su maleta, además de libros y colores?",
      opciones: ["Una guitarra", "Un balón", "Una radio"],
      respuesta: 0,
    },
  },
];

const actividadesFluidez = [
  {
    titulo: "El gallo cantor",
    contenido: {
      palabras: 40,
      ppmObjetivo: 50,
      texto:
        "Cada mañana, el gallo de la finca sube a la cerca y canta muy fuerte. Su canto despierta a toda la familia. Los perros ladran, las gallinas salen del gallinero y el sol empieza a asomarse detrás de las montañas del Valle de Tenza.",
    },
  },
  {
    titulo: "La huerta de mi abuela",
    contenido: {
      palabras: 55,
      ppmObjetivo: 60,
      texto:
        "Mi abuela tiene una huerta detrás de su casa. Allí siembra cilantro, tomate y fríjol. Todas las tardes riega las plantas con agua de un pozo pequeño. A veces me deja ayudarla a recoger las hojas más grandes. Ella dice que la tierra siempre premia a quien la cuida con paciencia.",
    },
  },
  {
    titulo: "El río que no descansa",
    contenido: {
      palabras: 65,
      ppmObjetivo: 70,
      texto:
        "El río que baja de la montaña nunca deja de moverse. Pasa entre piedras grandes, rodea troncos caídos y forma pequeñas cascadas donde el agua hace espuma blanca. Los niños del pueblo van los domingos a mojarse los pies, aunque el agua siempre está helada. Dicen que ese río ha estado ahí desde antes de que existiera el pueblo.",
    },
  },
  {
    titulo: "La feria de las cometas",
    contenido: {
      palabras: 75,
      ppmObjetivo: 80,
      texto:
        "En agosto, el viento sopla fuerte sobre las lomas de Guateque y todos los niños sacan sus cometas. Las hacen con papel de colores, palitos de balso y mucho hilo. Andrés hizo la suya con forma de mariposa, y Valentina pintó la de ella como si fuera un sol. Cuando el viento las levanta, parece que el cielo entero se llenara de figuras de colores volando entre las nubes.",
    },
  },
  {
    titulo: "El reto de la cosecha",
    contenido: {
      palabras: 90,
      ppmObjetivo: 90,
      texto:
        "Durante la cosecha de café, toda la vereda se pone de acuerdo para ayudarse entre vecinos. Empiezan muy temprano, antes de que salga el sol, y cada quien lleva su canasto amarrado a la cintura. Los granos rojos se recogen uno por uno, con cuidado de no dañar la planta. Al mediodía se reúnen bajo un árbol grande a comer arepa con queso, y los mayores cuentan historias de cuando ellos eran niños y también cosechaban con sus padres.",
    },
  },
];

async function main() {
  for (const d of docentes) {
    const passwordHash = await bcrypt.hash(d.password, 10);
    await prisma.docente.upsert({
      where: { usuario: d.usuario },
      update: {},
      create: { nombre: d.nombre, usuario: d.usuario, passwordHash },
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

  const grupos = [
    { modulo: "PALABRAS", items: actividadesPalabras, puntosBase: 20 },
    { modulo: "COMPRENSION", items: actividadesComprension, puntosBase: 20 },
    { modulo: "FLUIDEZ", items: actividadesFluidez, puntosBase: 30 },
  ];

  for (const grupo of grupos) {
    for (let i = 0; i < grupo.items.length; i++) {
      const item = grupo.items[i];
      const orden = i + 1;
      await prisma.actividad.upsert({
        where: { modulo_orden: { modulo: grupo.modulo, orden } },
        update: {
          titulo: item.titulo,
          contenido: JSON.stringify(item.contenido ?? item),
          puntosBase: grupo.puntosBase,
        },
        create: {
          modulo: grupo.modulo,
          titulo: item.titulo,
          orden,
          contenido: JSON.stringify(item.contenido ?? item),
          puntosBase: grupo.puntosBase,
        },
      });
    }
  }

  console.log("Seed completado: docentes, logros y actividades.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
