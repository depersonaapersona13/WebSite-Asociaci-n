/* layout.js — carga el encabezado y el pie compartidos desde /partials
 * y marca el enlace de la página actual.
 *
 * El HTML de cada página lleva los contenedores así:
 *     <div data-layout="header" hidden></div>
 *     <div data-layout="footer" hidden></div>
 *
 * Están ocultos hasta que hay contenido, para que no parpadeen. Si el fetch
 * falla (por ejemplo al abrir el HTML con doble clic, sin servidor), se inyecta
 * una versión reducida para que la navegación siga funcionando.
 */
(function () {
  "use strict";

  var guion = document.currentScript;
  var RAIZ = guion ? new URL("../../", guion.src).href : "/";

  var ENLACES = [
    { href: "/", texto: "Inicio", clave: "inicio" },
    { href: "/sobre-nosotros", texto: "Sobre Nosotros", clave: "sobre-nosotros" },
    { href: "/proyectos", texto: "Proyectos", clave: "proyectos" },
    { href: "/contacto", texto: "Contacto", clave: "contacto" }
  ];

  function listaEnlaces(clase) {
    return ENLACES.map(function (e) {
      return '<li><a class="' + clase + '" href="' + e.href + '" data-nav="' + e.clave + '">' + e.texto + "</a></li>";
    }).join("");
  }

  function fallback(tipo) {
    if (tipo === "header") {
      return '<header class="border-b border-brand-100 bg-white"><div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6">' +
        '<a class="font-bold text-brand-900" href="/">De Personas a Personas</a>' +
        '<nav aria-label="Principal"><ul class="flex flex-wrap gap-5 text-sm">' + listaEnlaces("nav-enlace") + "</ul></nav>" +
        "</div></header>";
    }
    return '<footer class="mt-20 bg-brand-900 text-brand-100"><div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">' +
      '<p class="font-bold text-white">De Personas a Personas</p>' +
      '<p class="text-sm text-brand-200">Jóvenes que se apoyan entre sí</p>' +
      '<nav aria-label="Pie de página" class="mt-4"><ul class="flex flex-wrap gap-5 text-sm">' + listaEnlaces("enlace-pie") + "</ul></nav>" +
      '<p class="mt-4 text-xs text-brand-200">© <span data-anio>2026</span> De Personas a Personas</p>' +
      "</div></footer>";
  }

  function cargar(tipo) {
    var contenedor = document.querySelector('[data-layout="' + tipo + '"]');
    if (!contenedor) return Promise.resolve();

    return fetch(RAIZ + "partials/" + tipo + ".html", { cache: "no-cache" })
      .then(function (respuesta) {
        if (!respuesta.ok) throw new Error("HTTP " + respuesta.status);
        return respuesta.text();
      })
      .then(function (html) {
        contenedor.innerHTML = html;
      })
      .catch(function (error) {
        console.warn(
          "[layout] No se pudo cargar partials/" + tipo + ".html (" + error.message + "). " +
          'Se usa la versión reducida. Recuerda servir el sitio por HTTP (por ejemplo "npx serve .") ' +
          "en lugar de abrir los archivos con doble clic."
        );
        contenedor.innerHTML = fallback(tipo);
      })
      .then(function () {
        contenedor.removeAttribute("hidden");
      });
  }

  function marcarActivo() {
    var pagina = (document.body && document.body.getAttribute("data-pagina")) || "";
    var enlaces = document.querySelectorAll("[data-nav]");
    for (var i = 0; i < enlaces.length; i++) {
      if (enlaces[i].getAttribute("data-nav") === pagina) {
        enlaces[i].setAttribute("aria-current", "page");
      } else {
        enlaces[i].removeAttribute("aria-current");
      }
    }
  }

  Promise.all([cargar("header"), cargar("footer")]).then(function () {
    marcarActivo();
    window.layoutCargado = true;
    document.dispatchEvent(new CustomEvent("layout:cargado"));
  });
})();