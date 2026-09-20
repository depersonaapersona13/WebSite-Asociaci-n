/* idiomas.js — textos en español e inglés y selector de idioma.
 *
 * - Detecta el idioma del navegador (navigator.language) la primera vez.
 * - La elección se guarda en localStorage y puede forzarse con ?idioma=en|es
 * - Traduce los elementos marcados con data-i18n (texto), data-i18n-aria-label,
 *   data-i18n-placeholder y data-i18n-alt.
 * - Emite el evento "idioma:cambiado" para que main.js vuelva a renderizar el
 *   contenido dinámico (contacto, proyectos, legal, testimonios...).
 *
 * Debe cargarse ANTES de main.js (defer, en orden de documento).
 */
(function () {
  "use strict";

  var CLAVE = "dpap-idioma";

  var TEXTOS = { es: {
      comun: {
        saltar: "Saltar al contenido",
        volverArriba: "Volver arriba",
        temaClaro: "Activar el modo oscuro",
        temaOscuro: "Volver al modo claro",
        cambiarIdioma: "Cambiar de idioma",
        cargando: "Cargando…",
        pendiente: "Información pendiente de completar.",
        imagenPendiente: "Imagen pendiente",
        masInfo: "Más información",
        enMarcha: "En marcha",
        finalizado: "Finalizado",
        nuevaVentana: " (se abre en una pestaña nueva)",
        porConfirmar: "Por confirmar",
        redSocial: "Red social",
        retratoDe: "Retrato de ",
        cuentaProyectos: "Mostrando {a} de {b} proyectos.",
        sinResultados: "Todavía no hay proyectos con este filtro.",
        pendienteProyectos: "Pendiente de publicar los proyectos.",
        pendienteContacto: "Pendiente de confirmar los datos de contacto.",
        pendienteLegal: "Datos legales pendientes de publicar.",
        pendienteJunta: "Pendiente de publicar la composición del equipo.",
        pendienteRedes: "Pendiente de añadir las redes sociales.",
        pendienteTestimonios: "Pendiente de publicar los testimonios.",
        pendienteFila: "Pendiente de completar.",
        pendienteTestimonio: "Testimonio pendiente de publicar."
      },
      nav: {
        inicio: "Inicio",
        sobre: "Sobre Nosotros",
        proyectos: "Proyectos",
        contacto: "Contacto",
        cta: "Escríbenos",
        abrirMenu: "Abrir menú de navegación",
        cerrarMenu: "Cerrar menú de navegación"
      },
      hero: {
        badge: "✨ Asociación juvenil de apoyo mutuo · Sevilla",
        etiqueta: "Asociación juvenil",
        eslogan: "Jóvenes que se apoyan entre sí.",
        cta1: "Conócenos",
        cta2: "Ver proyectos",
        logoAlt: "Logotipo de De Personas a Personas"
      },
      stats: {
        kicker: "Impacto y compromiso",
        titulo: "Nuestra red en cifras",
        cifra1Num: "4",
        cifra1Etiqueta: "Personas cofundadoras",
        cifra1Desc: "Jóvenes comprometidos impulsando la asociación.",
        cifra2Num: "100%",
        cifra2Etiqueta: "Apoyo mutuo y gratuito",
        cifra2Desc: "Espacio seguro de escucha activa entre iguales.",
        cifra3Num: "Sevilla",
        cifra3Etiqueta: "Presencial y online",
        cifra3Desc: "Actividades locales y red digital accesible.",
        cifra4Num: "0€",
        cifra4Etiqueta: "Coste para participar",
        cifra4Desc: "Sin cuotas ni barreras para nadie."
      },
      queHacemos: {
        kicker: "Qué hacemos",
        titulo: "Apoyo real, entre iguales",
        texto: "Creamos espacios donde las personas jóvenes se encuentran, se escuchan y se acompañan sin sentirse juzgadas.",
        apoyoTitulo: "Apoyo mutuo",
        apoyoTexto: "Acompañamos a quienes lo necesitan: escucha, orientación y ayuda práctica entre personas de edades parecidas.",
        encuentrosTitulo: "Encuentros y actividades",
        encuentrosTexto: "Organizamos quedadas, talleres y actividades para conocerse, aprender juntas y desconectar.",
        comunidadTitulo: "Comunidad",
        comunidadTexto: "Construimos red: lo que aprende una persona lo comparte con las demás, y nadie se queda fuera.",
        ctaTitulo: "¿Quieres participar?",
        ctaTexto: "Si eres joven y buscas apoyar o sentirte apoyado, escríbenos. También puedes contar con nosotras si quieres proponer una actividad o colaborar con la asociación.",
        ctaBoton: "Escríbenos",
        ctaBoton2: "Cómo funcionamos"
      },
      testimonios: {
        kicker: "Comunidad",
        titulo: "Lo que significa este espacio",
        intro: "Palabras y reflexiones de quienes ya forman parte de nuestra red de apoyo.",
        test1Cita: "«Encontrar un lugar donde hablar de lo que te pasa sin sentirte juzgado marca un antes y un después. Saber que no estás solo te devuelve las ganas.»",
        test1Autor: "Compañero/a del grupo",
        test1Rol: "Participante en encuentros",
        test2Cita: "«No hace falta tener todas las respuestas para ayudar; a veces basta con sentarte a escuchar y decir: yo también he estado ahí.»",
        test2Autor: "Integrante de la red",
        test2Rol: "Acompañamiento entre iguales",
        test3Cita: "«La fuerza de esta asociación es que la construimos de tú a tú. Nadie es más que nadie y cada idea cuenta.»",
        test3Autor: "Colaborador/a joven",
        test3Rol: "Talleres y actividades"
      },
      proyectos: {
        destacadosKicker: "Proyectos",
        destacadosTitulo: "En lo que estamos trabajando",
        verTodos: "Ver todos los proyectos",
        kicker: "Proyectos",
        tituloPagina: "En qué estamos trabajando",
        intro: "Aquí recogemos las actividades, el acompañamiento y las acciones comunitarias de la asociación. Si quieres sumarte a alguno, escríbenos.",
        filtroTodos: "Todos",
        filtroActivos: "En marcha",
        filtroFinalizados: "Finalizados",
        filtroEtiqueta: "Filtrar proyectos por estado",
        ctaTitulo: "¿Tienes una idea para un proyecto?",
        ctaTexto: "Cuéntanosla y vemos entre todas cómo llevarla adelante.",
        ctaBoton: "Escríbenos"
      },
      faq: {
        kicker: "Resolvemos tus dudas",
        titulo: "Preguntas frecuentes",
        intro: "Todo lo que necesitas saber antes de escribirnos o sumarte a los encuentros.",
        q1: "¿Quién puede participar en la asociación?",
        a1: "Cualquier persona joven con ganas de sentirse escuchada, de apoyar a otras personas o de proponer actividades comunitarias. No hay ningún requisito previo: la puerta está abierta para todo el mundo.",
        q2: "¿Tiene algún coste o cuota mensual?",
        a2: "No, en absoluto. Participar en la asociación y en nuestros encuentros y actividades es 100% gratuito. Creemos en un apoyo mutuo accesible y sin barreras económicas.",
        q3: "¿Qué tipo de actividades y encuentros organizáis?",
        a3: "Organizamos quedadas informales, espacios de conversación y escucha, talleres prácticos, dinámicas para compartir inquietudes y proyectos solidarios propuestos por los propios miembros.",
        q4: "¿Tengo que vivir en Sevilla para participar?",
        a4: "La asociación nació en Sevilla y realizamos quedadas presenciales en la ciudad, pero también contamos con canales y actividades online para acompañarnos sin importar la distancia.",
        q5: "¿Cómo puedo proponer una idea o colaborar?",
        a5: "¡Es muy fácil! Puedes escribirnos a través del formulario de la web o por mensaje directo en cualquiera de nuestras redes sociales. Te responderemos encantadas para hablar de tu idea."
      },
      contacto: {
        kicker: "Contacto",
        titulo: "Hablemos",
        intro: "¿Quieres participar, proponer algo o simplemente preguntarnos? Escríbenos por el medio que te resulte más cómodo.",
        datosTitulo: "Datos de contacto",
        lblCorreo: "Correo electrónico",
        lblTelefono: "Teléfono",
        lblDonde: "Dónde estamos",
        lblHorario: "Horario de atención",
        pendienteDato: "Pendiente de confirmar.",
        redesTitulo: "Redes sociales",
        antesTitulo: "Antes de escribirnos",
        antesTexto: "Usamos los datos que nos envías solo para responderte y no los compartimos con terceros. Si nos pides información sobre actividades, te escribiremos desde el correo de la asociación.",
        formTitulo: "Escríbenos",
        formIntro: "Los campos marcados con * son obligatorios.",
        lblNombre: "Nombre *",
        lblEmail: "Correo electrónico *",
        lblAsunto: "Asunto",
        lblMensaje: "Mensaje *",
        lblNoRellenar: "No rellenar este campo",
        lblPrivacidad: "He leído y acepto la política de privacidad y que mis datos se usen únicamente para responder a este mensaje. *",
        lblPrivacidadParte1: "He leído y acepto la",
        lblPrivacidadEnlace: "política de privacidad",
        lblPrivacidadParte2: "y que mis datos se usen únicamente para responder a este mensaje. *",
        enviar: "Enviar mensaje",
        placeholderNombre: "Tu nombre",
        placeholderEmail: "tu@email.com",
        placeholderAsunto: "¿Sobre qué quieres escribirnos?",
        placeholderMensaje: "Cuéntanos qué necesitas...",
        enviando: "Enviando…",
        exito: "¡Gracias! Hemos recibido tu mensaje y te responderemos lo antes posible.",
        exitoCorreo: "Se ha abierto tu programa de correo con el mensaje preparado: solo tienes que pulsar Enviar.",
        errRevisar: "Revisa los campos marcados en rojo.",
        errNombre: "Escribe tu nombre.",
        errEmail: "Escribe un correo electrónico válido.",
        errMensaje: "Cuéntanos brevemente qué necesitas.",
        errCorto: "El mensaje es demasiado corto (mínimo 10 caracteres).",
        errPrivacidad: "Marca la casilla para poder enviar el mensaje.",
        errEnvio: "No hemos podido enviar el mensaje. Prueba de nuevo o escríbenos por correo.",
        noConfigurado: "El envío todavía no está configurado: falta el correo de destino en data/site.json.",
        asunto: "Mensaje desde la web"
      },
      sobre: {
        kicker: "Sobre Nosotros",
        titulo: "Quiénes somos",
        intro: "Somos una asociación de jóvenes que se apoyan entre sí. Nos unimos para acompañarnos, compartir lo que sabemos y construir cosas juntas.",
        historiaTitulo: "Nuestra historia",
        historiaP1: "Nacimos de algo muy simple: un grupo de personas jóvenes que decidió no dejar a nadie atrás. Empezamos juntándonos para hablar de lo que nos preocupaba y, poco a poco, ese espacio se convirtió en una asociación.",
        historiaP2: "Hoy seguimos con la misma idea: que apoyarse sea algo natural, que pedir ayuda no dé vergüenza y que lo que aprende una persona sirva también a las demás.",
        cita: "«Jóvenes que se apoyan entre sí»",
        mision: "Nuestra misión",
        misionTexto: "Acompañar a las personas jóvenes que necesitan apoyo, creando espacios seguros de escucha, aprendizaje y ayuda mutua en los que nadie se sienta solo.",
        vision: "Nuestra visión",
        visionTexto: "Una comunidad en la que apoyarse sea lo habitual: jóvenes que se sostienen entre sí, con red suficiente para que cualquier persona encuentre ayuda cuando la necesite.",
        valoresTitulo: "Nuestros valores",
        valoresIntro: "Estos son los principios que guían todo lo que hacemos:",
        valor1Titulo: "Apoyo mutuo",
        valor1Texto: "Nos cuidamos entre iguales: pedir ayuda y ofrecerla forma parte de lo que somos.",
        valor2Titulo: "Cercanía",
        valor2Texto: "Hablamos claro, sin tecnicismos ni juicios, y tratamos a cada persona por su nombre.",
        valor3Titulo: "Compromiso",
        valor3Texto: "Lo que decimos que vamos a hacer, lo hacemos. Con constancia y con tiempo.",
        valor4Titulo: "Transparencia",
        valor4Texto: "Publicamos quiénes somos y de dónde sale cada recurso que gestionamos.",
        juntaTitulo: "Equipo",
        juntaIntro: "Las cuatro personas cofundadoras que impulsamos la asociación.",
        transTitulo: "Datos y transparencia",
        transIntro: "Información legal y de contacto de la asociación.",
        ctaTitulo: "¿Te identificas con lo que hacemos?",
        ctaTexto: "Escríbenos: buscamos personas con ganas de participar y de apoyar.",
        ctaBoton: "Escríbenos"
      },
      legal: {
        nombre: "Nombre de la asociación",
        cif: "CIF / NIF",
        registro: "Registro de Asociaciones",
        constitucion: "Fecha de constitución",
        domicilio: "Domicilio social",
        registroCorto: "Registro nº "
      },
      footer: {
        navegacion: "Navegación",
        contactoTitulo: "Contacto",
        derechos: "Todos los derechos reservados.",
        cta: "Escríbenos",
        avisoLegal: "Aviso legal",
        privacidad: "Política de privacidad"
      },
      error404: {
        kicker: "Error 404",
        titulo: "Esta página no existe",
        texto: "Puede que el enlace esté mal escrito o que la hayamos movido. Desde aquí vuelves a los sitios con contenido:",
        cta1: "Volver al inicio",
        cta2: "Ver proyectos",
        cta3: "Contacto"
      }
    },
    en: {
      comun: {
        saltar: "Skip to content",
        volverArriba: "Back to top",
        temaClaro: "Turn on dark mode",
        temaOscuro: "Back to light mode",
        cambiarIdioma: "Change language",
        cargando: "Loading…",
        pendiente: "Information to be completed.",
        imagenPendiente: "Image coming soon",
        masInfo: "More information",
        enMarcha: "Ongoing",
        finalizado: "Completed",
        nuevaVentana: " (opens in a new tab)",
        porConfirmar: "To be confirmed",
        redSocial: "Social network",
        retratoDe: "Portrait of ",
        cuentaProyectos: "Showing {a} of {b} projects.",
        sinResultados: "There are no projects with this filter yet.",
        pendienteProyectos: "Projects not published yet.",
        pendienteContacto: "Contact details to be confirmed.",
        pendienteLegal: "Legal details not published yet.",
        pendienteJunta: "Team members not published yet.",
        pendienteRedes: "Social networks not added yet.",
        pendienteTestimonios: "Testimonials not published yet.",
        pendienteFila: "To be completed.",
        pendienteTestimonio: "Testimonial not published yet."
      },
      nav: {
        inicio: "Home",
        sobre: "About Us",
        proyectos: "Projects",
        contacto: "Contact",
        cta: "Get in touch",
        abrirMenu: "Open navigation menu",
        cerrarMenu: "Close navigation menu"
      },
      hero: {
        badge: "✨ Youth mutual support association · Seville",
        etiqueta: "Youth association",
        eslogan: "Young people supporting each other.",
        cta1: "About us",
        cta2: "See projects",
        logoAlt: "De Personas a Personas logo"
      },
      stats: {
        kicker: "Impact & commitment",
        titulo: "Our network in figures",
        cifra1Num: "4",
        cifra1Etiqueta: "Co-founders",
        cifra1Desc: "Committed young people driving the association.",
        cifra2Num: "100%",
        cifra2Etiqueta: "Mutual & free support",
        cifra2Desc: "A safe space for active listening among peers.",
        cifra3Num: "Seville",
        cifra3Etiqueta: "In-person & online",
        cifra3Desc: "Local meetups and accessible digital community.",
        cifra4Num: "0€",
        cifra4Etiqueta: "Cost to take part",
        cifra4Desc: "No fees, no barriers for anyone."
      },
      queHacemos: {
        kicker: "What we do",
        titulo: "Real support, peer to peer",
        texto: "We create spaces where young people meet, listen to each other and support one another without feeling judged.",
        apoyoTitulo: "Mutual support",
        apoyoTexto: "We walk alongside those who need it: listening, guidance and practical help between people of similar ages.",
        encuentrosTitulo: "Meet-ups and activities",
        encuentrosTexto: "We organise gatherings, workshops and activities to get to know each other, learn together and switch off.",
        comunidadTitulo: "Community",
        comunidadTexto: "We build a network: what one person learns is shared with the rest, and nobody is left out.",
        ctaTitulo: "Do you want to help, or do you need support?",
        ctaTexto: "Write to us and we will talk with no strings attached: what is shared here stays here.",
        ctaBoton: "Get in touch",
        ctaBoton2: "How we work"
      },
      testimonios: {
        kicker: "Community",
        titulo: "What this space means",
        intro: "Words and thoughts from people who are already part of our support network.",
        test1Cita: "«Finding a place where you can talk about what's going on without feeling judged changes everything. Knowing you're not alone gives you hope again.»",
        test1Autor: "Group member",
        test1Rol: "Meetups participant",
        test2Cita: "«You don't need all the answers to help; sometimes all it takes is sitting down to listen and saying: I've been there too.»",
        test2Autor: "Network peer",
        test2Rol: "Peer support",
        test3Cita: "«The strength of this association is that we build it peer to peer. Nobody is above anyone else and every voice counts.»",
        test3Autor: "Youth collaborator",
        test3Rol: "Workshops & activities"
      },
      proyectos: {
        destacadosKicker: "Projects",
        destacadosTitulo: "What we are working on",
        verTodos: "See all projects",
        kicker: "Projects",
        tituloPagina: "What we are working on",
        intro: "Here you will find the association's activities, one-to-one support and community work. If you would like to join any of them, write to us.",
        filtroTodos: "All",
        filtroActivos: "Ongoing",
        filtroFinalizados: "Completed",
        filtroEtiqueta: "Filter projects by status",
        ctaTitulo: "Do you have an idea for a project?",
        ctaTexto: "Tell us about it and we will look at how to make it happen together.",
        ctaBoton: "Get in touch"
      },
      faq: {
        kicker: "Frequently asked",
        titulo: "Frequently Asked Questions",
        intro: "Everything you need to know before reaching out or joining our meetups.",
        q1: "Who can take part in the association?",
        a1: "Any young person who wants to feel heard, support others, or propose community activities. There are no prerequisites: our doors are open to everyone.",
        q2: "Is there any membership fee or cost?",
        a2: "None at all. Taking part in the association and our meetups is 100% free. We believe in accessible peer support without economic barriers.",
        q3: "What kind of activities and meetups do you organize?",
        a3: "We organize informal meetups, conversation and active listening circles, practical workshops, spaces to share concerns, and solidarity projects suggested by members.",
        q4: "Do I have to live in Seville to participate?",
        a4: "The association was founded in Seville and we hold in-person meetups there, but we also have online channels and digital activities so you can join from anywhere.",
        q5: "How can I propose an idea or get involved?",
        a5: "It's very easy! You can write to us via the contact form on this site or send us a direct message on our social media. We'll be thrilled to hear from you."
      },
      contacto: {
        kicker: "Contact",
        titulo: "Let's talk",
        intro: "Would you like to take part, suggest something or just ask us a question? Write to us in whatever way suits you best.",
        datosTitulo: "Contact details",
        lblCorreo: "Email",
        lblTelefono: "Phone",
        lblDonde: "Where we are",
        lblHorario: "Opening hours",
        pendienteDato: "To be confirmed.",
        redesTitulo: "Social networks",
        antesTitulo: "Before you write to us",
        antesTexto: "We use the information you send us only to reply to you, and we never share it with third parties. If you ask about activities, we will write back from the association's email address.",
        formTitulo: "Write to us",
        formIntro: "Fields marked with * are required.",
        lblNombre: "Name *",
        lblEmail: "Email *",
        lblAsunto: "Subject",
        lblMensaje: "Message *",
        lblNoRellenar: "Do not fill in this field",
        lblPrivacidad: "I have read and agree to the privacy policy and that my data will be used solely to reply to this message. *",
        lblPrivacidadParte1: "I have read and agree to the",
        lblPrivacidadEnlace: "privacy policy",
        lblPrivacidadParte2: "and that my data will be used solely to reply to this message. *",
        enviar: "Send message",
        placeholderNombre: "Your name",
        placeholderEmail: "your@email.com",
        placeholderAsunto: "What would you like to write about?",
        placeholderMensaje: "Tell us what you need...",
        enviando: "Sending…",
        exito: "Thank you! We have received your message and will reply as soon as possible.",
        exitoCorreo: "Your email program has opened with the message ready: just press Send.",
        errRevisar: "Please check the fields marked in red.",
        errNombre: "Please write your name.",
        errEmail: "Please write a valid email address.",
        errMensaje: "Tell us briefly what you need.",
        errCorto: "Your message is too short (minimum 10 characters).",
        errPrivacidad: "Please tick the box so we can send your message.",
        errEnvio: "We could not send the message. Please try again or write to us by email.",
        noConfigurado: "Sending is not set up yet: the destination email is missing in data/site.json.",
        asunto: "Message from the website"
      },
      sobre: {
        kicker: "About Us",
        titulo: "Who we are",
        intro: "We are an association of young people who support each other. We came together to look out for one another, share what we know and build things together.",
        historiaTitulo: "Our story",
        historiaP1: "We were born from something very simple: a group of young people who decided not to leave anyone behind. We started by getting together to talk about what was on our minds, and little by little that space became an association.",
        historiaP2: "Today we keep the same idea: that supporting each other should feel natural, that asking for help should never be embarrassing, and that what one person learns should also help the rest.",
        cita: "“Young people supporting each other”",
        mision: "Our mission",
        misionTexto: "To stand by young people who need support, creating safe spaces for listening, learning and mutual aid where no one feels alone.",
        vision: "Our vision",
        visionTexto: "A community where supporting each other is the norm: young people holding each other up, with a network strong enough for anyone to find help when they need it.",
        valoresTitulo: "Our values",
        valoresIntro: "These are the principles that guide everything we do:",
        valor1Titulo: "Mutual support",
        valor1Texto: "We look after each other as equals: asking for help and offering it is part of who we are.",
        valor2Titulo: "Closeness",
        valor2Texto: "We speak plainly, without jargon or judgement, and we treat every person by name.",
        valor3Titulo: "Commitment",
        valor3Texto: "What we say we will do, we do. With consistency and with time.",
        valor4Titulo: "Transparency",
        valor4Texto: "We publish who we are and where every resource we manage comes from.",
        juntaTitulo: "Team",
        juntaIntro: "The four co-founders behind the association.",
        transTitulo: "Details and transparency",
        transIntro: "Legal and contact information of the association.",
        ctaTitulo: "Do you identify with what we do?",
        ctaTexto: "Write to us: we are looking for people who want to take part and support others.",
        ctaBoton: "Get in touch"
      },
      legal: {
        nombre: "Association name",
        cif: "Tax ID",
        registro: "Associations Register",
        constitucion: "Date of incorporation",
        domicilio: "Registered office",
        registroCorto: "Registry no. "
      },
      footer: {
        navegacion: "Navigation",
        contactoTitulo: "Contact",
        derechos: "All rights reserved.",
        cta: "Get in touch",
        avisoLegal: "Legal notice",
        privacidad: "Privacy policy"
      },
      error404: {
        kicker: "Error 404",
        titulo: "This page does not exist",
        texto: "The link may be misspelled or we may have moved it. From here you can go back to the pages with content:",
        cta1: "Back to home",
        cta2: "See projects",
        cta3: "Contact"
      }
    }
  };

  /* ------------------------------------------------------------------
     Lógica del selector de idioma
     ------------------------------------------------------------------ */

  function idiomaActual() {
    var guardado = null;
    try { guardado = window.localStorage.getItem(CLAVE); } catch (e) { }
    if (guardado === "en" || guardado === "es") return guardado;
    return null;
  }

  /* Detección automática: si el navegador no está en español, arrancamos en inglés */
  function detectarNavegador() {
    try {
      var codigo = (window.navigator.language || window.navigator.userLanguage || "es").toLowerCase();
      return codigo.indexOf("es") === 0 ? "es" : "en";
    } catch (e) {
      return "es";
    }
  }

  function idiomaEfectivo() {
    var elegido = idiomaActual();
    if (elegido) return elegido;
    try {
      var parametro = new URLSearchParams(window.location.search).get("idioma");
      if (parametro === "en" || parametro === "es") return parametro;
    } catch (e) { }
    return detectarNavegador();
  }

  function texto(ruta) {
    var partes = String(ruta).split(".");
    var nodo = TEXTOS[idiomaEfectivo()] || TEXTOS.es;
    for (var i = 0; i < partes.length; i++) {
      if (nodo == null) return "";
      nodo = nodo[partes[i]];
    }
    if (typeof nodo === "string") return nodo;
    /* Si falta la clave en un idioma, cae al español antes de devolver vacío */
    nodo = TEXTOS.es;
    for (var j = 0; j < partes.length; j++) {
      if (nodo == null) return "";
      nodo = nodo[partes[j]];
    }
    return typeof nodo === "string" ? nodo : "";
  }

  function interpolar(plantilla, valores) {
    var resultado = String(plantilla || "");
    Object.keys(valores || {}).forEach(function (clave) {
      resultado = resultado.split("{" + clave + "}").join(String(valores[clave]));
    });
    return resultado;
  }

  function marcarBotones(idioma) {
    document.querySelectorAll("[data-idioma]").forEach(function (boton) {
      boton.setAttribute("aria-pressed", String(boton.getAttribute("data-idioma") === idioma));
    });
    document.documentElement.setAttribute("lang", idioma);
  }

  /* Aplica las traducciones a todo lo marcado con atributos data-i18n-* */
  function aplicar(idioma) {
    if (idioma !== "es" && idioma !== "en") idioma = "es";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = texto(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach(function (el) {
      el.setAttribute("aria-label", texto(el.getAttribute("data-i18n-aria-label")));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach(function (el) {
      el.setAttribute("alt", texto(el.getAttribute("data-i18n-alt")));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.setAttribute("placeholder", texto(el.getAttribute("data-i18n-placeholder")));
    });
    marcarBotones(idioma);
    var temaBoton = document.getElementById("boton-tema");
    if (temaBoton && window.temaActivoOscuro) {
      var oscuro = window.temaActivoOscuro();
      temaBoton.setAttribute("aria-label", oscuro ? texto("comun.temaOscuro") : texto("comun.temaClaro"));
    }
  }

  function cambiar(nuevo) {
    if (nuevo !== "es" && nuevo !== "en") return;
    try { window.localStorage.setItem(CLAVE, nuevo); } catch (e) { }
    aplicar(nuevo);
    document.dispatchEvent(new CustomEvent("idioma:cambiado", { detail: { idioma: nuevo } }));
  }

  function conectarBotones() {
    document.querySelectorAll("[data-idioma]").forEach(function (boton) {
      if (boton.dataset.idiomaListo === "si") return;
      boton.dataset.idiomaListo = "si";
      boton.addEventListener("click", function () { cambiar(boton.getAttribute("data-idioma")); });
    });
  }

  /* API pública para main.js / proyectos.js */
  window.idiomaSitio = idiomaEfectivo;
  window.textoSitio = texto;
  window.interpolarSitio = interpolar;
  window.aplicarIdioma = aplicar;
  window.cambiarIdioma = cambiar;

  /* Traduce cuanto antes: primero lo estático, luego al terminar el layout */
  document.addEventListener("DOMContentLoaded", function () {
    aplicar(idiomaEfectivo());
    conectarBotones();
  });
  document.addEventListener("layout:cargado", function () {
    aplicar(idiomaEfectivo());
    conectarBotones();
  });
})();