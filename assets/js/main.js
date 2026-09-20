/* main.js — comportamiento y datos comunes a todas las páginas.
 *
 * Lee data/site.json una sola vez y rellena: contacto, redes sociales, datos
 * legales, junta directiva y proyectos destacados. También gestiona el menú
 * móvil, el año del pie, la animación de entrada y el formulario de contacto.
 *
 * Convenio: cualquier valor que empiece por "PENDIENTE" se considera sin
 * rellenar; en su lugar se muestra un aviso visible (clase .pendiente) para que
 * nunca se publique información a medias. Al completarlo, el aviso desaparece.
 */
(function () {
  "use strict";

  var guion = document.currentScript;
  var RAIZ = guion ? new URL("../../", guion.src).href : "/";
  var RE_PENDIENTE = /^pendiente/i;

  /* ---------------------------------------------------------------- ayudas */

  function esPendiente(valorCrudo) {
    return valorCrudo == null || String(valorCrudo).trim() === "" ||
      RE_PENDIENTE.test(String(valorCrudo).trim());
  }

  function valor(valorCrudo) {
    return esPendiente(valorCrudo) ? "" : String(valorCrudo).trim();
  }

  function escapar(texto) {
    return String(texto == null ? "" : texto).replace(/[&<>"']/g, function (caracter) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[caracter];
    });
  }

  function avisoPendiente(texto) {
    return '<p class="pendiente">' + escapar(texto || textoDe("comun.pendiente", "Información pendiente de completar.")) + "</p>";
  }

  /* --------------------------------------------------------------- idiomas */

  /* Texto traducido. Si idiomas.js no está disponible, usa el español de reserva. */
  function textoDe(ruta, reserva) {
    if (typeof window.textoSitio === "function") {
      var traducido = window.textoSitio(ruta);
      if (traducido) return traducido;
    }
    return reserva || "";
  }

  function interpolar(plantilla, valores) {
    if (typeof window.interpolarSitio === "function") return window.interpolarSitio(plantilla, valores);
    var resultado = String(plantilla || "");
    Object.keys(valores || {}).forEach(function (clave) {
      resultado = resultado.split("{" + clave + "}").join(String(valores[clave]));
    });
    return resultado;
  }

  /* ------------------------------------- datos del sitio (data/site.json) */

  var peticionSitio = null;

  window.obtenerSitio = function () {
    if (!peticionSitio) {
      peticionSitio = fetch(RAIZ + "data/site.json", { cache: "no-cache" })
        .then(function (respuesta) {
          if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);
          return respuesta.json();
        })
        .catch(function (error) {
          console.error("[datos] No se pudo leer data/site.json:", error);
          return null;
        });
    }
    return peticionSitio;
  };

  /* ------------------------------------------- iconos de redes (simple-icons, CC0) */

  var ICONOS = {
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg>',
    whatsapp:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
    x:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 9.24-3.308 3.308-8.502-9.24-8.502 9.24-3.308-3.308 8.502-9.24-8.502-9.24 3.308-3.308 8.502 9.24 8.502-9.24z"/></svg>',
    telegram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>'
  };

  /* ------------------------------------------------------- plantillas de HTML */

  function plantillaProyecto(proyecto) {
    var titulo = valor(proyecto.titulo) || "Proyecto";
    var estado = (valor(proyecto.estado) || "activo").toLowerCase();
    var esFinalizado = estado === "finalizado" || estado === "cerrado" || estado === "pasado";
    var etiqueta = esFinalizado
      ? textoDe("comun.finalizado", "Finalizado")
      : textoDe("comun.enMarcha", "En marcha");
    var claseEtiqueta = esFinalizado ? "etiqueta etiqueta-finalizado" : "etiqueta etiqueta-activo";
    var anio = valor(proyecto.anio);
    var imagen = valor(proyecto.imagen);
    var enlace = valor(proyecto.enlace);

    var media = imagen
      ? '<img class="h-44 w-full object-cover" src="' + escapar(imagen) + '" alt="" loading="lazy">'
      : '<div class="flex h-44 w-full items-center justify-center bg-brand-100 text-brand-700">' +
        '<span class="text-[0.7rem] font-bold uppercase tracking-[0.18em]">' + escapar(textoDe("comun.imagenPendiente", "Imagen pendiente")) + "</span></div>";

    var resumen = esPendiente(proyecto.resumen)
      ? avisoPendiente(textoDe("comun.pendienteFila", "Descripción pendiente de completar."))
      : '<p class="mt-3 text-sm leading-relaxed text-brand-900/80">' + escapar(proyecto.resumen) + "</p>";

    return '<article class="tarjeta tarjeta-enlace flex h-full flex-col overflow-hidden">' + media +
      '<div class="flex flex-1 flex-col p-5">' +
      '<div class="flex flex-wrap items-center gap-3">' +
      '<span class="' + claseEtiqueta + '">' + etiqueta + "</span>" +
      (anio ? '<span class="text-xs font-semibold text-brand-700">' + escapar(anio) + "</span>" : "") +
      "</div>" +
      '<h3 class="mt-3 text-lg font-bold text-brand-900">' + escapar(titulo) + "</h3>" +
      resumen +
      (enlace ? '<p class="mt-4 pt-1"><a class="enlace font-semibold" href="' + escapar(enlace) + '">' + escapar(textoDe("comun.masInfo", "Más información")) + "</a></p>" : "") +
      "</div></article>";
  }
  window.plantillaProyecto = plantillaProyecto;

  /* ------------------------------------------------------------ datos del sitio */

  function resolver(objeto, ruta) {
    return ruta.split(".").reduce(function (acumulado, clave) {
      return acumulado == null ? undefined : acumulado[clave];
    }, objeto);
  }

  /* Rellena cualquier elemento con data-sitio="ruta.del.json" */
  function rellenarTextos(sitio) {
    document.querySelectorAll("[data-sitio]").forEach(function (nodo) {
      var texto = valor(resolver(sitio, nodo.getAttribute("data-sitio")));
      if (texto) {
        nodo.textContent = texto;
      } else if (nodo.hasAttribute("data-opcional")) {
        nodo.remove();
      } else {
        nodo.innerHTML = avisoPendiente();
      }
    });
  }

  /* Lista sencilla de contacto (pie de página) */
  function rellenarContacto(sitio) {
    var contacto = (sitio && sitio.contacto) || {};
    var email = valor(contacto.email);
    var telefono = valor(contacto.telefono);
    var direccion = valor(contacto.direccion);

    document.querySelectorAll("[data-contacto]").forEach(function (nodo) {
      var elementos = [];
      if (email) elementos.push('<li><a class="enlace-pie" href="mailto:' + escapar(email) + '">' + escapar(email) + "</a></li>");
      if (telefono) elementos.push('<li><a class="enlace-pie" href="tel:' + escapar(telefono.replace(/[^+0-9]/g, "")) + '">' + escapar(telefono) + "</a></li>");
      if (direccion) elementos.push("<li>" + escapar(direccion) + "</li>");
      if (!elementos.length) elementos.push('<li class="pendiente">' + escapar(textoDe("comun.pendienteContacto", "Pendiente de confirmar los datos de contacto.")) + "</li>");
      nodo.innerHTML = elementos.join("");
    });
  }

  /* Ficha de contacto completa (página de contacto) */
  function rellenarContactoDetalle(sitio) {
    var contacto = (sitio && sitio.contacto) || {};
    var filas = [
      { etiqueta: textoDe("contacto.lblCorreo", "Correo electrónico"), valor: valor(contacto.email), tipo: "mailto" },
      { etiqueta: textoDe("contacto.lblTelefono", "Teléfono"), valor: valor(contacto.telefono), tipo: "tel" },
      { etiqueta: textoDe("contacto.lblDonde", "Dónde estamos"), valor: valor(contacto.direccion), tipo: "" },
      { etiqueta: textoDe("contacto.lblHorario", "Horario de atención"), valor: valor(contacto.horario), tipo: "" }
    ];

    document.querySelectorAll("[data-contacto-detalle]").forEach(function (nodo) {
      nodo.innerHTML = '<dl class="space-y-5">' + filas.map(function (fila) {
        var contenido;
        if (!fila.valor) {
          contenido = '<span class="pendiente">' + escapar(textoDe("contacto.pendienteDato", "Pendiente de confirmar.")) + "</span>";
        } else if (fila.tipo === "mailto") {
          contenido = '<a class="enlace text-lg font-semibold" href="mailto:' + escapar(fila.valor) + '">' + escapar(fila.valor) + "</a>";
        } else if (fila.tipo === "tel") {
          contenido = '<a class="enlace text-lg font-semibold" href="tel:' + escapar(fila.valor.replace(/[^+0-9]/g, "")) + '">' + escapar(fila.valor) + "</a>";
        } else {
          contenido = '<span class="text-lg">' + escapar(fila.valor) + "</span>";
        }
        return "<div>" +
          '<dt class="text-xs font-bold uppercase tracking-widest text-brand-700">' + fila.etiqueta + "</dt>" +
          '<dd class="mt-1">' + contenido + "</dd></div>";
      }).join("") + "</dl>";
    });
  }

  /* Redes sociales: [data-redes] para fondos oscuros, [data-redes-claro] para claros */
  function contenidoRedes(redes, claro) {
    if (!redes.length) {
      return '<p class="pendiente">' + escapar(textoDe("comun.pendienteRedes", "Pendiente de añadir las redes sociales.")) + "</p>";
    }
    return '<ul class="flex flex-wrap gap-3">' + redes.map(function (red) {
      var nombre = valor(red.nombre) || textoDe("comun.redSocial", "Red social");
      var icono = ICONOS[String(red.icono || "").toLowerCase()];
      var interior = icono || ('<span aria-hidden="true" class="text-xs font-bold">' + escapar(nombre.slice(0, 2).toUpperCase()) + "</span>");
      return '<li><a class="' + (claro ? "enlace-red enlace-red-claro" : "enlace-red") + '" href="' + escapar(red.url) +
        '" target="_blank" rel="noopener noreferrer">' +
        '<span class="sr-only">' + escapar(nombre) + escapar(textoDe("comun.nuevaVentana", " (se abre en una pestaña nueva)")) + "</span>" + interior + "</a></li>";
    }).join("") + "</ul>";
  }

  function rellenarRedes(sitio) {
    var redes = ((sitio && sitio.redes) || []).filter(function (red) {
      return red && !esPendiente(red.url);
    });
    document.querySelectorAll("[data-redes]").forEach(function (nodo) { nodo.innerHTML = contenidoRedes(redes, false); });
    document.querySelectorAll("[data-redes-claro]").forEach(function (nodo) { nodo.innerHTML = contenidoRedes(redes, true); });
  }

  /* Datos legales y de transparencia */
  function rellenarLegal(sitio) {
    var legal = (sitio && sitio.legal) || {};
    var meta = (sitio && sitio.meta) || {};
    var filas = [
      { etiqueta: textoDe("legal.nombre", "Nombre de la asociación"), valor: valor(meta.nombre) },
      { etiqueta: textoDe("legal.cif", "CIF / NIF"), valor: valor(legal.nif) },
      { etiqueta: textoDe("legal.registro", "Registro de Asociaciones"), valor: valor(legal.registro) },
      { etiqueta: textoDe("legal.constitucion", "Fecha de constitución"), valor: valor(legal.fundacion) },
      { etiqueta: textoDe("legal.domicilio", "Domicilio social"), valor: valor(legal.sede) }
    ];

    document.querySelectorAll("[data-legal]").forEach(function (nodo) {
      nodo.innerHTML = '<dl class="grid gap-4 sm:grid-cols-2">' + filas.map(function (fila) {
        var contenido = fila.valor
          ? '<span class="font-semibold text-brand-900">' + escapar(fila.valor) + "</span>"
          : '<span class="pendiente">' + escapar(textoDe("comun.pendienteFila", "Pendiente de completar.")) + "</span>";
        return '<div class="tarjeta p-4"><dt class="text-xs font-bold uppercase tracking-widest text-brand-700">' +
          fila.etiqueta + '</dt><dd class="mt-1 text-sm">' + contenido + "</dd></div>";
      }).join("") + "</dl>";
    });

    document.querySelectorAll("[data-legal-resumen]").forEach(function (nodo) {
      var partes = [];
      if (valor(legal.nif)) partes.push("CIF " + valor(legal.nif));
      if (valor(legal.registro)) partes.push(textoDe("legal.registroCorto", "Registro nº ") + valor(legal.registro));
      nodo.textContent = partes.length ? partes.join(" · ") : "";
    });
  }

  /* Equipo */
  function rellenarJunta(sitio) {
    var junta = (sitio && sitio.junta) || [];
    document.querySelectorAll("[data-junta]").forEach(function (nodo) {
      if (!junta.length) {
        nodo.innerHTML = avisoPendiente(textoDe("comun.pendienteJunta", "Pendiente de publicar la composición del equipo."));
        return;
      }
      var columnas = junta.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
      nodo.innerHTML = '<ul class="grid gap-6 sm:grid-cols-2 ' + columnas + '">' + junta.map(function (persona) {
        var nombre = valor(persona.nombre) || textoDe("comun.porConfirmar", "Por confirmar");
        var cargo = valor(persona.cargo);
        var bio = valor(persona.bio);
        var foto = valor(persona.foto);
        var retrato = foto
          ? '<img class="h-24 w-24 rounded-full object-cover shadow-md ring-2 ring-brand-100" src="' + escapar(foto) + '" alt="' + escapar(textoDe("comun.retratoDe", "Retrato de ") + nombre) + '" loading="lazy">'
          : '<span class="avatar-iniciales h-24 w-24 text-2xl" aria-hidden="true">' +
            escapar(nombre.slice(0, 2).toUpperCase()) + "</span>";
        return '<li class="revelar tarjeta flex h-full flex-col items-center p-6 text-center">' + retrato +
          '<h3 class="mt-4 font-bold text-brand-900">' + escapar(nombre) + "</h3>" +
          (cargo ? '<p class="mt-1 text-sm font-semibold text-brand-700">' + escapar(cargo) + "</p>" : "") +
          (bio ? '<p class="mt-3 text-sm leading-relaxed text-brand-900/80">' + escapar(bio) + "</p>" : "") +
          "</li>";
      }).join("") + "</ul>";
    });
  }

  /* Proyectos destacados de la portada (los 3 primeros del archivo de datos) */
  function rellenarDestacados(sitio) {
    var proyectos = (sitio && sitio.proyectos) || [];
    document.querySelectorAll("[data-proyectos-destacados]").forEach(function (nodo) {
      if (!proyectos.length) {
        nodo.innerHTML = avisoPendiente(textoDe("comun.pendienteProyectos", "Pendiente de publicar los proyectos."));
        return;
      }
      nodo.innerHTML = '<ul class="grid gap-6 md:grid-cols-3">' + proyectos.slice(0, 3).map(function (proyecto) {
        return "<li>" + plantillaProyecto(proyecto) + "</li>";
      }).join("") + "</ul>";
    });
  }

  /* Testimonios de la portada (se editan en data/site.json -> "testimonios") */
  function rellenarTestimonios(sitio) {
    var lista = document.querySelector("[data-testimonios]");
    if (!lista) return;
    var testimonios = ((sitio && sitio.testimonios) || []).filter(function (t) {
      return t && !esPendiente(t.texto);
    });
    if (!testimonios.length) {
      lista.innerHTML = '<li class="pendiente max-w-2xl">' +
        escapar(textoDe("comun.pendienteTestimonios", "Pendiente de publicar los testimonios.")) + "</li>";
      return;
    }
    lista.innerHTML = testimonios.map(function (t) {
      var texto = valor(t.texto) || "";
      var nombre = valor(t.nombre);
      var rol = valor(t.rol);
      var foto = valor(t.foto);
      var inicial = nombre ? nombre.slice(0, 1).toUpperCase() : "?";
      var retrato = foto
        ? '<img class="h-12 w-12 rounded-full object-cover" src="' + escapar(foto) + '" alt="' +
          escapar(textoDe("comun.retratoDe", "Retrato de ") + (nombre || "")) + '" loading="lazy">'
        : '<span aria-hidden="true" class="flex h-12 w-12 items-center justify-center rounded-full bg-brand-700 text-lg font-bold text-white">' +
          escapar(inicial) + "</span>";
      return '<li class="revelar tarjeta h-full p-6"><figure class="flex h-full flex-col">' +
        '<div aria-hidden="true" class="estrellas flex gap-0.5 text-brand-500">' +
        '<svg viewBox="0 0 24 24"><path d="M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.3L12 16.9 6.3 20l1.2-6.3L2.8 9.3l6.4-.8z"/></svg>'.repeat(5) +
        "</div>" +
        '<blockquote class="mt-4 flex-1 text-sm leading-relaxed text-brand-900/90">&ldquo;' +
        escapar(texto) + "&rdquo;</blockquote>" +
        '<figcaption class="mt-5 flex items-center gap-3">' + retrato +
        "<span>" +
        (nombre ? '<span class="block text-sm font-bold text-brand-900">' + escapar(nombre) + "</span>" : "") +
        (rol ? '<span class="block text-xs text-brand-900/70">' + escapar(rol) + "</span>" : "") +
        "</span></figcaption></figure></li>";
    }).join("");
  }

  /* ---------------------------------------------------------- comportamiento */

  /* Menú móvil: accesible con teclado y cerrable con Escape */
  function inicializarMenu() {
    var boton = document.getElementById("boton-menu");
    var menu = document.getElementById("menu-movil");
    if (!boton || !menu || boton.dataset.listo === "si") return;
    boton.dataset.listo = "si";

    function abrir() {
      menu.removeAttribute("hidden");
      /* Un frame para que la transición CSS (opacity/translate) se dispare */
      requestAnimationFrame(function () { menu.classList.add("abierto"); });
      boton.setAttribute("aria-expanded", "true");
      var etiqueta = boton.querySelector(".sr-only");
      if (etiqueta) etiqueta.textContent = textoDe("menu.cerrar", "Cerrar menú de navegación");
    }
    function cerrar() {
      menu.classList.remove("abierto");
      boton.setAttribute("aria-expanded", "false");
      var etiqueta = boton.querySelector(".sr-only");
      if (etiqueta) etiqueta.textContent = textoDe("menu.abrir", "Abrir menú de navegación");
      /* Espera a la transición antes de ocultar; sin animación se oculta al instante */
      var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reducir) {
        menu.setAttribute("hidden", "");
      } else {
        window.setTimeout(function () {
          if (boton.getAttribute("aria-expanded") === "false") menu.setAttribute("hidden", "");
        }, 220);
      }
    }

    boton.addEventListener("click", function () {
      if (menu.hasAttribute("hidden")) { abrir(); } else { cerrar(); }
    });
    menu.addEventListener("click", function (evento) {
      if (evento.target.closest("a")) cerrar();
    });
    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && !menu.hasAttribute("hidden")) {
        cerrar();
        boton.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) cerrar();
    });
  }

  /* Pantalla de carga: se oculta al terminar la carga (el CSS la auto-oculta a los 3s) */
  function inicializarCarga() {
    if (document.documentElement.dataset.cargaLista === "si") return;
    document.documentElement.dataset.cargaLista = "si";
    function ocultar() {
      var pantalla = document.getElementById("pantalla-carga");
      if (!pantalla || pantalla.dataset.oculta === "si") return;
      pantalla.dataset.oculta = "si";
      pantalla.classList.add("oculta");
      window.setTimeout(function () { pantalla.remove(); }, 600);
    }
    if (document.readyState === "complete") {
      window.setTimeout(ocultar, 150);
    } else {
      window.addEventListener("load", function () { window.setTimeout(ocultar, 150); });
      /* Red de seguridad extra por si "load" no llegase a dispararse */
      window.setTimeout(ocultar, 3500);
    }
  }

  /* Botón "volver arriba": aparece al bajar y sube con scroll suave */
  function inicializarArriba() {
    var boton = document.getElementById("boton-arriba");
    if (!boton || boton.dataset.listo === "si") return;
    boton.dataset.listo = "si";
    var reducir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function alDesplazar() {
      var visible = window.scrollY > 600;
      boton.classList.toggle("visible", visible);
      boton.setAttribute("aria-hidden", visible ? "false" : "true");
      boton.tabIndex = visible ? 0 : -1;
    }
    window.addEventListener("scroll", alDesplazar, { passive: true });
    alDesplazar();
    boton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducir ? "auto" : "smooth" });
      boton.blur();
    });
  }

  /* Año actual en el pie de página */
  function ponerAnio() {
    var anio = new Date().getFullYear();
    document.querySelectorAll("[data-anio]").forEach(function (nodo) { nodo.textContent = anio; });
  }

  /* Si falta assets/img/logo.png se usa la marca provisional en SVG */
  function arreglarLogo() {
    document.querySelectorAll("img[data-logo]").forEach(function (imagen) {
      function usarReserva() {
        if (imagen.dataset.reserva === "si") return;
        imagen.dataset.reserva = "si";
        imagen.src = RAIZ + "assets/img/logo.svg";
      }
      if (imagen.dataset.listo === "si") return;
      imagen.dataset.listo = "si";
      imagen.addEventListener("error", usarReserva);
      /* Puede haber fallado antes de registrar el listener */
      if (imagen.complete && imagen.naturalWidth === 0) usarReserva();
    });
  }

  /* Barra de progreso de lectura en la cabecera */
  function inicializarBarraProgreso() {
    var barra = document.getElementById("barra-progreso");
    if (!barra) return;
    function actualizar() {
      var total = document.documentElement.scrollHeight - window.innerHeight;
      var porcentaje = total > 0 ? (window.scrollY / total) : 0;
      barra.style.transform = "scaleX(" + Math.min(Math.max(porcentaje, 0), 1) + ")";
    }
    window.addEventListener("scroll", function () {
      window.requestAnimationFrame(actualizar);
    }, { passive: true });
    actualizar();
  }

  /* Cifras de impacto con animación de conteo numérico progresivo */
  function inicializarContadores() {
    var contadores = document.querySelectorAll("[data-contador]");
    if (!contadores.length) return;
    var reducirMovimiento = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducirMovimiento || !("IntersectionObserver" in window)) {
      contadores.forEach(function (el) { el.textContent = el.getAttribute("data-contador"); });
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          var el = entrada.target;
          observador.unobserve(el);
          var fin = parseInt(el.getAttribute("data-contador"), 10);
          if (isNaN(fin)) return;
          var duracion = 1400;
          var inicio = null;
          function animar(timestamp) {
            if (!inicio) inicio = timestamp;
            var progreso = Math.min((timestamp - inicio) / duracion, 1);
            var valorActual = Math.floor(fin * (progreso === 1 ? 1 : 1 - Math.pow(2, -10 * progreso)));
            el.textContent = valorActual;
            if (progreso < 1) {
              window.requestAnimationFrame(animar);
            } else {
              el.textContent = fin;
            }
          }
          window.requestAnimationFrame(animar);
        }
      });
    }, { threshold: 0.2 });

    contadores.forEach(function (c) { observador.observe(c); });
  }

  /* Acordeón interactivo de Preguntas Frecuentes */
  function inicializarAcordeon() {
    document.querySelectorAll(".acordeon-boton").forEach(function (boton) {
      if (boton.dataset.acordeonListo === "si") return;
      boton.dataset.acordeonListo = "si";
      boton.addEventListener("click", function () {
        var item = boton.closest(".acordeon-item");
        if (!item) return;
        var estaAbierto = item.getAttribute("data-abierto") === "true";
        document.querySelectorAll(".acordeon-item").forEach(function (otro) {
          if (otro !== item) {
            otro.setAttribute("data-abierto", "false");
            var btnOtro = otro.querySelector(".acordeon-boton");
            if (btnOtro) btnOtro.setAttribute("aria-expanded", "false");
          }
        });
        item.setAttribute("data-abierto", estaAbierto ? "false" : "true");
        boton.setAttribute("aria-expanded", estaAbierto ? "false" : "true");
      });
    });
  }

  /* Animación de entrada al hacer scroll (se desactiva si el sistema pide menos movimiento) */
  function animarEntrada() {
    var elementos = document.querySelectorAll(".revelar");
    if (!elementos.length || document.documentElement.dataset.revelado === "si") return;
    document.documentElement.dataset.revelado = "si";

    var reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducirMovimiento || !("IntersectionObserver" in window)) {
      elementos.forEach(function (elemento) { elemento.classList.add("visible"); });
      return;
    }

    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

    elementos.forEach(function (elemento) { observador.observe(elemento); });
  }

  /* ---------------------------------------------------- formulario de contacto */

  function inicializarFormulario(sitio) {
    var formulario = document.querySelector("form[data-formulario-contacto]");
    if (!formulario || formulario.dataset.listo === "si") return;
    formulario.dataset.listo = "si";

    var aviso = formulario.querySelector("[data-aviso]");
    var config = (sitio && sitio.contacto && sitio.contacto.formulario) || {};
    var endpoint = valor(config.endpoint);
    var destino = valor(config.destino) || valor(sitio && sitio.contacto && sitio.contacto.email);

    function mostrarAviso(mensaje, bien) {
      if (!aviso) return;
      aviso.innerHTML = '<p class="pendiente' +
        (bien ? " !border-emerald-300 !bg-emerald-50 !text-emerald-900" : "") + '">' +
        escapar(mensaje) + "</p>";
    }

    function marcarError(campo, mensaje) {
      if (!campo) return;
      var zonaError = document.getElementById("error-" + campo.id);
      if (mensaje) {
        campo.setAttribute("aria-invalid", "true");
        if (zonaError) { zonaError.textContent = mensaje; zonaError.hidden = false; }
      } else {
        campo.removeAttribute("aria-invalid");
        if (zonaError) { zonaError.hidden = true; zonaError.textContent = ""; }
      }
    }

    function validarCampo(campo, reglas) {
      if (!campo) return "";
      var texto = campo.value.trim();
      var error = "";
      if (!texto) {
        error = reglas.mensaje;
      } else if (reglas.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto)) {
        error = reglas.mensaje;
      } else if (reglas.minimo && texto.length < reglas.minimo) {
        error = interpolar(textoDe("contacto.errCorto", "El mensaje es demasiado corto (mínimo {min} caracteres)."), { min: reglas.minimo });
      }
      marcarError(campo, error);
      return error;
    }

    function validar(enfocar) {
      var campos = formulario.elements;
      var comprobaciones = [
        { campo: campos.nombre, mensaje: textoDe("contacto.errNombre", "Escribe tu nombre.") },
        { campo: campos.email, mensaje: textoDe("contacto.errEmail", "Escribe un correo electrónico válido."), email: true },
        { campo: campos.mensaje, mensaje: textoDe("contacto.errMensaje", "Cuéntanos brevemente qué necesitas."), minimo: 10 }
      ];
      var valido = true;
      var primerError = null;

      comprobaciones.forEach(function (item) {
        if (!item.campo) return;
        if (validarCampo(item.campo, item)) {
          valido = false;
          if (!primerError) primerError = item.campo;
        }
      });

      if (campos.privacidad) {
        var faltaConsentimiento = !campos.privacidad.checked;
        marcarError(campos.privacidad, faltaConsentimiento ? textoDe("contacto.errPrivacidad", "Marca la casilla para poder enviar el mensaje.") : "");
        if (faltaConsentimiento) {
          valido = false;
          if (!primerError) primerError = campos.privacidad;
        }
      }

      if (!valido && enfocar !== false && primerError) primerError.focus();
      return valido;
    }

    /* Validación en tiempo real: al salir de cada campo y al escribir si ya falló */
    ["nombre", "email", "mensaje"].forEach(function (id) {
      var campo = formulario.elements[id];
      if (!campo) return;
      campo.addEventListener("blur", function () {
        validarCampo(campo, id === "email"
          ? { mensaje: textoDe("contacto.errEmail", "Escribe un correo electrónico válido."), email: true }
          : id === "nombre"
            ? { mensaje: textoDe("contacto.errNombre", "Escribe tu nombre.") }
            : { mensaje: textoDe("contacto.errMensaje", "Cuéntanos brevemente qué necesitas."), minimo: 10 });
      });
      campo.addEventListener("input", function () {
        if (campo.getAttribute("aria-invalid") === "true") marcarError(campo, "");
      });
    });

    function leerDatos() {
      function dato(nombre) {
        return formulario.elements[nombre] ? formulario.elements[nombre].value.trim() : "";
      }
      return {
        nombre: dato("nombre"),
        email: dato("email"),
        asunto: dato("asunto"),
        mensaje: dato("mensaje")
      };
    }

    /* Sin servicio externo configurado: se abre el correo del visitante ya redactado */
    function enviarPorCorreo() {
      var boton = formulario.querySelector('button[type="submit"]');
      var htmlBoton = boton ? boton.innerHTML : "";
      if (boton) {
        boton.disabled = true;
        boton.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>' + textoDe("contacto.enviando", "Enviando…");
      }
      if (!destino) {
        if (boton) { boton.disabled = false; boton.innerHTML = htmlBoton; }
        mostrarAviso(textoDe("contacto.noConfigurado", "El envío todavía no está configurado: falta el correo de destino en data/site.json."));
        return;
      }
      var datos = leerDatos();
      var asunto = datos.asunto ? "[" + datos.nombre + "] " + datos.asunto : textoDe("contacto.asunto", "Mensaje desde la web") + " · " + datos.nombre;
      var cuerpo = "Nombre: " + datos.nombre + "\nCorreo: " + datos.email + "\n\n" + datos.mensaje;
      window.location.href = "mailto:" + destino +
        "?subject=" + encodeURIComponent(asunto) + "&body=" + encodeURIComponent(cuerpo);
      mostrarAviso(textoDe("contacto.exitoCorreo", "Se ha abierto tu programa de correo con el mensaje preparado: solo tienes que pulsar Enviar."), true);
      if (boton) { boton.disabled = false; boton.innerHTML = htmlBoton; }
    }

    /* Con endpoint configurado (Web3Forms, Formspree...): se envía sin salir de la web */
    function enviarRemoto() {
      var boton = formulario.querySelector('button[type="submit"]');
      var htmlBoton = boton ? boton.innerHTML : "";
      if (boton) {
        boton.disabled = true;
        boton.innerHTML = '<svg class="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>' + textoDe("contacto.enviando", "Enviando…");
      }
      mostrarAviso(textoDe("contacto.enviando", "Enviando…"), true);
      fetch(endpoint, { method: "POST", body: new FormData(formulario), headers: { Accept: "application/json" } })
        .then(function (respuesta) {
          if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);
          return respuesta.json().catch(function () { return {}; });
        })
        .then(function () {
          formulario.reset();
          mostrarAviso(textoDe("contacto.exito", "¡Gracias! Hemos recibido tu mensaje y te responderemos lo antes posible."), true);
        })
        .catch(function (error) {
          console.error("[formulario] Error al enviar:", error);
          mostrarAviso(textoDe("contacto.errEnvio", "No hemos podido enviar el mensaje. Prueba de nuevo o escríbenos por correo."));
        })
        .then(function () {
          if (boton) { boton.disabled = false; boton.innerHTML = htmlBoton; }
        });
    }

    formulario.addEventListener("submit", function (evento) {
      evento.preventDefault();
      /* Trampa anti-spam: si un bot la rellena, se descarta el envío en silencio */
      if (formulario.elements.empresa && formulario.elements.empresa.value !== "") return;
      if (!validar()) {
        mostrarAviso(textoDe("contacto.errRevisar", "Revisa los campos marcados en rojo."));
        return;
      }
      if (endpoint) { enviarRemoto(); } else { enviarPorCorreo(); }
    });
  }

  /* ----------------------------------------------------------------- arranque */

  function arrancarInteraccion() {
    inicializarMenu();
    inicializarCarga();
    inicializarArriba();
    inicializarBarraProgreso();
    inicializarContadores();
    inicializarAcordeon();
    ponerAnio();
    arreglarLogo();
    animarEntrada();
  }

  function arrancarDatos() {
    window.obtenerSitio().then(function (sitio) {
      rellenarTextos(sitio);
      rellenarContacto(sitio);
      rellenarContactoDetalle(sitio);
      rellenarRedes(sitio);
      rellenarLegal(sitio);
      rellenarJunta(sitio);
      rellenarDestacados(sitio);
      rellenarTestimonios(sitio);
      inicializarFormulario(sitio);
      document.dispatchEvent(new CustomEvent("datos:cargados"));
    });
  }

  /* Al cambiar de idioma se re-renderiza todo lo que viene de site.json */
  var idiomaTimer = null;
  document.addEventListener("idioma:cambiado", function () {
    if (idiomaTimer) window.clearTimeout(idiomaTimer);
    idiomaTimer = window.setTimeout(function () {
      idiomaTimer = null;
      arrancarDatos();
    }, 60);
  });

  /* El encabezado y el pie se inyectan de forma asíncrona: cuando ya están en el
     documento se inicializan los elementos que contienen (menú, contacto, redes...). */
  document.addEventListener("layout:cargado", function () {
    arrancarInteraccion();
    arrancarDatos();
  });

  /* Red de seguridad por si el layout tardase más que la carga completa de la página */
  window.addEventListener("load", function () {
    if (!window.layoutCargado) {
      arrancarInteraccion();
      arrancarDatos();
    }
  });

})();