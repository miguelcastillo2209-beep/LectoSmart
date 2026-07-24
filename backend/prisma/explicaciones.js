/* ============================================================
   EXPLICACIONES DEL BANCO DE ACTIVIDADES
   ------------------------------------------------------------
   Retroalimentación pedagógica que ve el estudiante después de
   responder (acierte o falle): por qué la respuesta correcta es
   la correcta. El seed las fusiona dentro de `contenido` como
   campo `explicacion` (solo PALABRAS y COMPRENSION; en FLUIDEZ
   la retroalimentación es el resultado de ppm contra la meta).
   Claves: curso → módulo → título exacto de la actividad.
   ============================================================ */

const EXPLICACIONES = {
  "6°": {
    PALABRAS: {
      "Sinónimo de 'veloz'":
        "'Veloz' y 'rápido' significan lo mismo: que se mueve con gran velocidad. 'Lento' es lo contrario y 'tranquilo' habla de calma, no de velocidad.",
      "Ortografía: exhausto":
        "'Exhausto' (muy cansado) se escribe con h intermedia después de la x. Las otras formas no existen en español.",
      "Antónimo de 'generoso'":
        "Generoso es quien da y comparte; su contrario es 'tacaño', quien no quiere compartir. 'Amable' y 'alegre' no son opuestos de generoso.",
      "Ortografía: excavación":
        "'Excavación' se forma con el prefijo ex- más 'cavar', por eso lleva 'xc'. Las otras escrituras no existen.",
      "Palabra esdrújula":
        "'Música' lleva la fuerza de voz en la antepenúltima sílaba (MÚ-si-ca): es esdrújula y siempre lleva tilde. 'Canción' es aguda y 'ventana' es grave.",
      "Sinónimo de 'contento'":
        "'Contento' y 'alegre' expresan la misma emoción de felicidad. 'Enojado' y 'cansado' son estados muy distintos.",
      "Ortografía: volver":
        "'Volver' se escribe siempre con v. 'Bolver' y 'volber' no existen en español.",
      "La palabra intrusa":
        "La papa no es una fruta: es un tubérculo que crece bajo tierra. La mora y la curuba sí son frutas de nuestra región.",
    },
    COMPRENSION: {
      "El colibrí del Valle de Tenza":
        "El texto lo dice directamente: lo llaman 'Chispa' porque vuela tan rápido que parece un rayo de luz entre los árboles.",
      "La huerta escolar":
        "La idea principal resume todo el texto: sembraron una huerta y con ella aprenden paciencia. Las otras opciones son un detalle o son falsas.",
      "El perro guardián de la finca":
        "Don Álvaro valora a Rocco porque protege la finca: el texto cuenta que ahuyentó a una zorra que quería entrar al gallinero.",
      "Un día de mercado en Guateque":
        "El texto describe el mercado de los sábados, donde los campesinos llegan con sus canastos a vender productos.",
      "La laguna de la vereda":
        "El texto explica el propósito: las raíces de los árboles ayudan a conservar el agua y dan sombra a los animales.",
      "Las abejas del profesor":
        "Según el texto, sin abejas no habría frutas porque ellas polinizan los cultivos al visitar las flores.",
      "El sancocho del domingo":
        "El orden de la receta es: encender el fuego, agregar la gallina y dejarla hervir una hora, y después añadir la yuca, el plátano y las papas.",
      "El viaje a Bogotá":
        "La idea principal reúne todo el relato: Mariana conoció Bogotá pero prefiere la vida de su pueblo. Las otras opciones son solo detalles del viaje.",
    },
  },

  "7°": {
    PALABRAS: {
      "Familia de 'tierra'":
        "'Terrestre' comparte la raíz terr- de 'tierra'. 'Terrible' viene de terror y 'tienda' no tiene relación, aunque suenen parecido.",
      "Prefijo in-":
        "En 'inmóvil' el prefijo in- niega la palabra: significa 'que NO se mueve'. Compara: incompleto, invisible.",
      "Derivado de 'flor'":
        "'Florero' deriva de 'flor' (el recipiente donde se ponen flores). 'Flotar' y 'flauta' solo se parecen en las letras iniciales.",
      "Sufijo -mente":
        "El sufijo -mente convierte adjetivos en adverbios de modo: rápida → rápidamente, lenta → lentamente.",
      "Palabra aguda":
        "'Café' es aguda: la fuerza de voz cae en la última sílaba (ca-FÉ) y lleva tilde por terminar en vocal. 'Mesa' y 'árbol' son graves.",
      "Prefijo re-":
        "El prefijo re- indica repetición: releer es volver a leer, igual que rehacer o repasar.",
      "Familia de 'pan'":
        "'Panadería' viene de 'pan' (lugar donde se hace y vende). 'Pantano' y 'pantalla' empiezan parecido pero no pertenecen a esta familia.",
      "Sufijo -ería":
        "El sufijo -ería señala el lugar o negocio donde se hace o vende algo: zapatería, panadería, papelería.",
    },
    COMPRENSION: {
      "Un viaje en chiva":
        "El texto lo dice: Sofía sacó la cabeza por la ventana 'para sentir el viento fresco de la montaña'.",
      "El apagón en la vereda":
        "Se infiere de sus acciones: buscó las velas y calmó a su hermana contándole historias hasta que se durmió. Eso es cuidar de ella.",
      "El zapatero del pueblo":
        "Las pistas están en el texto: sus ojos 'brillan' al entregar los zapatos y no imagina sus días sin el taller. Eso revela pasión por su oficio.",
      "La salida de observación":
        "Daniela prestó atención y tomó notas durante la observación; Esteban se distrajo. Por eso solo ella pudo responder el taller.",
      "La carta de la abuela":
        "Aunque la abuela no lo dice directamente, el 'ojalá vengas pronto' deja ver que extraña a Camila y quiere verla.",
      "El aviso de la alcaldía":
        "El aviso informa sobre la jornada de vacunación (fecha, hora, lugar) y da recomendaciones para participar. Ese es su propósito.",
      "Ruana en pleno sol":
        "Don Ernesto conoce el clima de la montaña por experiencia: 'el que conoce la tierra no le cree al sol de la mañana'. Y en efecto, cayó un aguacero.",
      "Las almojábanas de la tía":
        "Es un texto instructivo porque explica paso a paso cómo preparar algo, como toda receta: ingredientes y procedimiento en orden.",
    },
  },

  "8°": {
    PALABRAS: {
      "Conector: pero":
        "'Pero' expresa oposición entre las dos ideas: quería salir y la lluvia lo impedía. 'Además' agrega información y 'porque' introduce una causa.",
      "Homófona: echar":
        "'Echar' (lanzar, poner, enviar) se escribe sin h. No confundir con 'hecho', del verbo hacer, que sí lleva h.",
      "Conector: porque":
        "'Porque' introduce la causa de lo que pasó: llegó tarde a causa de que el bus se dañó.",
      "Homófona: valla":
        "'Valla' con v y ll es la cerca que separa terrenos. 'Vaya' es del verbo ir y 'baya' es un tipo de fruto.",
      "Conector: sin embargo":
        "'Sin embargo' introduce una oposición o contraste con lo dicho antes, igual que 'pero' aunque más formal.",
      "Homófona: hierba":
        "'Hierba' con b es la planta que come el ganado. 'Hierva' con v es del verbo hervir ('que hierva el agua').",
      "Conector: además":
        "'Además' sirve para agregar información nueva a lo ya dicho, no para oponer ni para explicar causas.",
      "Homófona: tubo":
        "'Tubo' con b es el cilindro por donde pasa el agua. 'Tuvo' con v es el pasado del verbo tener.",
    },
    COMPRENSION: {
      "¿Por qué llueve más en las montañas?":
        "El texto explica la cadena de causas: el aire húmedo choca con la montaña, sube, se enfría y el vapor se condensa formando nubes.",
      "El impacto de la sequía en los cultivos":
        "El texto señala la consecuencia directa: al perder humedad la tierra, 'las hojas empiezan a marchitarse y el crecimiento se detiene'.",
      "¿Por qué se erosiona el suelo?":
        "La causa está en el texto: al talar los árboles desaparecen las raíces que sostenían la tierra, y la lluvia arrastra la capa fértil.",
      "El efecto de dormir poco en el aprendizaje":
        "Según el texto, durante el sueño profundo el cerebro organiza y consolida la información nueva; dormir poco interrumpe ese proceso.",
      "El páramo, fábrica de agua":
        "El texto lo explica: los frailejones capturan la humedad de la niebla en sus hojas y la dejan escurrir lentamente hacia el suelo.",
      "Oídos tapados en la carretera":
        "La causa es la diferencia de presión: al descender, el aire de afuera tiene más presión que el aire dentro del oído, y esa diferencia empuja el tímpano.",
      "Murciélagos incomprendidos":
        "La idea global del texto es que, a pesar de su mala fama, los murciélagos ayudan al campo: controlan plagas, polinizan y dispersan semillas.",
      "Energía que baja de la montaña":
        "El texto lo dice al final: cuanto mayor sea la altura de la caída del agua, más energía se obtiene; por eso se construyen en zonas montañosas.",
    },
  },

  "9°": {
    PALABRAS: {
      "Conector: en consecuencia":
        "'En consecuencia' introduce el resultado o efecto de lo dicho antes: 'Llovió toda la noche; en consecuencia, el partido se aplazó'.",
      "Sinónimo de 'refutar'":
        "Refutar es contradecir un argumento con razones. 'Confirmar' es lo contrario e 'ignorar' es no prestarle atención.",
      "Conector: no obstante":
        "'No obstante' equivale a 'sin embargo': introduce una idea que se opone o matiza la anterior.",
      "Vocabulario: hipótesis":
        "Una hipótesis es una suposición inicial que todavía debe comprobarse con evidencia; no es un resultado confirmado ni una ley.",
      "Conector: por ende":
        "'Por ende' equivale a 'por lo tanto': introduce la conclusión que se sigue de lo anterior.",
      "Vocabulario: sustentar":
        "Sustentar un argumento es respaldarlo con razones, datos o pruebas que lo hagan sólido.",
      "Objetivo y subjetivo":
        "Lo subjetivo expresa un punto de vista personal (opiniones, gustos); lo objetivo puede verificarse con datos independientes de quien habla.",
      "Vocabulario: contraargumento":
        "Un contraargumento es la razón que se opone a un argumento para rebatirlo; es la base del debate.",
    },
    COMPRENSION: {
      "¿Deberían los celulares estar prohibidos en el colegio?":
        "La tesis del autor aparece tras el 'sin embargo': el problema no es el celular en sí, sino la falta de acuerdos claros sobre cuándo usarlo.",
      "La importancia de separar la basura":
        "El autor concluye que separar los residuos 'debería entenderse como una responsabilidad compartida', más que una obligación impuesta por la ley.",
      "¿Es necesario el uniforme escolar?":
        "El texto presenta dos posturas opuestas, pero señala en qué coinciden: el objetivo real es un ambiente escolar respetuoso, sin importar el vestuario.",
      "El valor de aprender un segundo idioma":
        "El texto cita beneficios cognitivos que no dependen de viajar: mejor memoria y mayor flexibilidad para resolver problemas.",
      "Menos memoria, más criterio":
        "La tesis es la propuesta central del autor: la escuela debería enseñar a evaluar la información, más que llenar la memoria de datos que ya da un buscador.",
      "La tienda escolar saludable":
        "El argumento principal es el dato de nutrición que citan: los hábitos alimenticios formados en la adolescencia tienden a mantenerse en la vida adulta.",
      "¿Hecho u opinión?":
        "La afirmación 2 es una opinión: 'muy descuidada' es un juicio personal que no se puede medir. Las afirmaciones 1 y 3 son cifras verificables del informe.",
      "La propuesta de don Gustavo":
        "Don Gustavo no solo informa: da razones (accidentes, invierno) y cierra con '¿quién se apunta?'. Su intención es convencer a los vecinos de participar.",
    },
  },

  "10°": {
    PALABRAS: {
      "Metáfora":
        "Es una metáfora: identifica directamente las palabras con dagas, sin usar 'como'. Si dijera 'palabras como dagas' sería una comparación explícita.",
      "Hipérbole":
        "'Llorar un río de lágrimas' es una exageración deliberada para intensificar la emoción: eso es una hipérbole.",
      "Connotación: invierno":
        "En un poema triste, 'invierno' no informa la temperatura: sugiere tristeza, frialdad o vejez. Ese es su sentido connotativo.",
      "Símil":
        "Usa el nexo comparativo 'tan... como': es un símil o comparación explícita. La metáfora identifica sin nexo.",
      "Personificación":
        "Atribuye una acción humana (susurrar) a algo que no lo es (el viento): personificación o prosopopeya.",
      "Connotación: serpiente":
        "Al llamar 'serpiente' a una persona no se habla del reptil: se sugiere traición o desconfianza. Ese es el sentido connotativo.",
      "Ironía":
        "La profesora dice lo contrario de lo que piensa ('qué puntualidad') para resaltar la tardanza: eso es ironía.",
      "Metonimia":
        "Se nombra el recipiente (la olla) para referirse a su contenido (la comida): metonimia de continente por contenido.",
    },
    COMPRENSION: {
      "El silencio también comunica":
        "El autor sostiene que una pausa bien usada 'transmite duda, desacuerdo o incluso una negativa': el silencio puede decir tanto como las palabras.",
      "La trampa de la comparación constante":
        "La causa que señala el autor es comparar 'un momento cuidadosamente seleccionado' de otros con la totalidad de la propia vida, incluidos los días difíciles.",
      "Aprender del error en lugar de temerle":
        "El texto lo dice: la diferencia no está en cuántos errores se cometen, sino en 'lo que deciden hacer después de cometerlos'.",
      "El costo invisible de la prisa":
        "La idea central es que la prisa no ahorra lo que promete: las decisiones apresuradas terminan exigiendo tiempo adicional para corregirlas.",
      "El ruido de fondo":
        "El autor valora el silencio como un espacio necesario: el que la mente necesita 'para ordenar sus propios pensamientos sin interferencias'.",
      "Conversaciones de pantalla":
        "La crítica central es la paradoja que describe: la tecnología que promete conectarnos con los lejanos nos desconecta de los cercanos.",
      "Volver al campo":
        "El autor defiende el regreso como 'una decisión informada' y sensata; para él, el fracaso está en medir el éxito por el lugar donde se vive.",
      "La función del ejemplo":
        "El ejemplo del médico rural ilustra la idea central del texto: llegar tarde es decidir que el tiempo propio vale más que el del otro.",
    },
  },

  "11°": {
    PALABRAS: {
      "Polisemia: banco":
        "El contexto resuelve la polisemia: si 'se sentó en el banco del parque', se trata del asiento público, no de la entidad financiera.",
      "Sinónimo académico: analizar":
        "'Examinar' es el sinónimo académico de analizar: estudiar algo con detalle y por partes. 'Resumir' es condensar, no analizar.",
      "Significado de 'ambiguo'":
        "Algo ambiguo admite más de una interpretación válida; por eso en textos académicos se pide evitar la ambigüedad.",
      "Vocabulario académico: inferir":
        "Inferir es deducir información a partir de pistas o datos, leyendo 'entre líneas'; no es copiar ni memorizar.",
      "Falacia ad hominem":
        "La falacia ad hominem ('contra el hombre') descalifica a la persona en lugar de responder su argumento. El argumento queda sin refutar.",
      "Vocabulario: implícito":
        "Lo implícito no está escrito directamente pero se entiende por el contexto; el lector lo reconstruye mediante inferencias.",
      "Vocabulario académico: corroborar":
        "Corroborar es confirmar una afirmación con evidencia adicional que la respalda.",
      "Vocabulario: premisa":
        "La premisa es la afirmación de la que parte un razonamiento; de las premisas se deriva la conclusión.",
    },
    COMPRENSION: {
      "¿Correlación o causalidad?":
        "El propósito del texto es explicar, con el ejemplo de los helados, que una correlación no implica causa: ambos fenómenos dependen de una tercera variable, el calor.",
      "El sesgo de confirmación":
        "El texto lo afirma directamente: el sesgo 'no depende del nivel educativo, sino de un mecanismo mental común a todos los seres humanos'.",
      "Los límites de las encuestas de opinión":
        "El texto promueve revisar la ficha técnica (metodología, muestra, margen de error) antes de sacar conclusiones de una encuesta.",
      "La paradoja de la elección":
        "La paradoja cuestiona la creencia de que más opciones siempre son mejores: demasiadas alternativas pueden paralizar y generar insatisfacción.",
      "La generalización apresurada":
        "El turista concluyó sobre todo el clima del pueblo a partir de solo dos días: generalizar desde una muestra insuficiente es el error del razonamiento.",
      "El testimonio publicitario":
        "La razón central del autor: que una afirmación venga de alguien famoso o admirado no la hace verdadera. La fama no es evidencia.",
      "Dos posturas, un acuerdo":
        "A pesar del desacuerdo sobre la mina, ambos columnistas coinciden en exigir estudios técnicos independientes y consulta a la comunidad.",
      "El algoritmo elige por ti":
        "El propósito del texto es advertir cómo funcionan las recomendaciones (predicen qué te mantiene conectado) e invitar a usarlas con autonomía.",
    },
  },
};

module.exports = { EXPLICACIONES };
