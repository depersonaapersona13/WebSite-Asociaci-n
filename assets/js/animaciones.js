/* animaciones.js — scroll reveal con "rewind", contadores, parallax, cabecera inteligente,
 * y gestión de vídeos de fondo.
 *
 * Sin dependencias. Se carga con "defer" ANTES de main.js (ver <head> de cada página).
 * Estilos asociados: assets/css/animaciones.css
 *
 * Cómo usarlo en el HTML:
 *   class="revelar"                       → entra al hacer scroll y rebobina al subir
 *   data-reveal="up|left|right|zoom|blur|mask|iris"   → tipo de entrada (por defecto "up")
 *   data-rewind="false"                   → no rebobina: se queda visible una vez que aparece
 *   class="retraso-1 … retraso-4"         → escalonado manual (o style="--d:.2s")
 *   data-scrub="hero"                     → hero ligado al scroll (variable CSS --p)
 *   data-scrub="paralaje"                 → fondo con parallax (variable CSS --q)
 *   data-contador="100"                   → cuenta de 0 al valor y rebobina a 0
 * Además se animan solos: títulos h2, etiquetas, párrafos de introducción, tarjetas,
 * acordeones, tarjetas de junta/proyectos (las crea main.js) y el pie de página.
 */
(function () {
  "use strict";

  var raiz = document.documentElement;
  var reducir = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var hayObservador = "IntersectionObserver" in window;

  raiz.classList.add("js");
  raiz.dataset.revelado = "si";

  function texto(clave, reserva) {
    if (typeof window.textoSitio === "function") {
      var t = window.textoSitio(clave);
      if (t) return t;
    }
    return reserva;
  }

  /* ------------------------------------------------ 1. Scroll reveal + rewind */

  var observador = null;
  var registrados = typeof WeakSet !== "undefined" ? new WeakSet() : null;

  function mostrar(el) {
    el.classList.add("visible");
    window.clearTimeout(el._listo);
    /* Cuando acaba la entrada, "listo" devuelve al elemento sus transiciones rápidas (hover) */
    el._listo = window.setTimeout(function () { el.classList.add("listo"); }, 1400);
  }
  function ocultar(el) {
    window.clearTimeout(el._listo);
    el.classList.remove("visible", "listo");
  }

  function crearObservador() {
    observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        var el = entrada.target;
        if (entrada.isIntersecting) { mostrar(el); return; }
        if (el.getAttribute("data-rewind") === "false") return;
        /* REWIND: si quedó por DEBAJO de la pantalla, el visitante está subiendo: se
           reproduce la animación a la inversa. Si salió por arriba (bajando) se queda. */
        var limite = entrada.rootBounds ? entrada.rootBounds.bottom : window.innerHeight;
        if (entrada.boundingClientRect.top >= limite - 1) ocultar(el);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
  }

  /* [selector, tipo de entrada, ¿escalonar entre hermanos?] */
  var AUTO = [
    ["main h2", "mask", false],
    ["main p.uppercase", "up", false],
    ["main .max-w-2xl > p:not(.uppercase), main p.max-w-2xl", "up", false],
    ["[data-junta] li", "up", true],
    ["[data-proyectos] > li", "up", true],
    ["[data-proyectos-destacados] li", "up", true],
    ["main .tarjeta", "up", true],
    [".acordeon-item", "up", true],
    ["footer .grid > div", "up", true]
  ];

  function escalonar(el) {
    if (el.hasAttribute("data-d") || /\bretraso-\d/.test(el.className)) return;
    var hermanos = el.parentNode ? el.parentNode.children : [];
    var i = Array.prototype.indexOf.call(hermanos, el);
    el.setAttribute("data-d", "1");
    el.style.setProperty("--d", ((i % 4) * 0.1).toFixed(2) + "s");
  }

  function escanear() {
    AUTO.forEach(function (regla) {
      var lista;
      try { lista = document.querySelectorAll(regla[0]); } catch (e) { return; }
      for (var i = 0; i < lista.length; i++) {
        var el = lista[i];
        if (el.classList.contains("revelar")) continue;
        if (el.closest(".hero-entrada, .hero-video-seccion")) continue;
        /* si viaja dentro de un bloque ya animado, no se anima dos veces
           (las listas de tarjetas generadas por JS sí se animan una a una) */
        var padre = el.parentNode && el.parentNode.closest ? el.parentNode.closest(".revelar") : null;
        if (padre && el.tagName !== "LI") continue;
        el.classList.add("revelar");
        if (regla[1] !== "up") el.setAttribute("data-reveal", regla[1]);
        if (regla[2]) escalonar(el);
        if (el.matches("p.uppercase")) el.classList.add("kicker-anim");
      }
    });

    var nuevos = document.querySelectorAll(".revelar");
    for (var k = 0; k < nuevos.length; k++) {
      var e2 = nuevos[k];
      if (registrados) { if (registrados.has(e2)) continue; registrados.add(e2); }
      if (reducir || !hayObservador) {
        e2.classList.add("visible", "listo");
      } else {
        if (!observador) crearObservador();
        observador.observe(e2);
      }
    }
    escanearContadores();
  }

  /* Las tarjetas de junta, proyectos y testimonios se crean DESPUÉS (fetch de site.json) */
  function vigilarContenidoNuevo() {
    if (!("MutationObserver" in window)) return;
    var temporizador = null;
    new MutationObserver(function () {
      if (temporizador) return;
      temporizador = window.setTimeout(function () { temporizador = null; escanear(); }, 60);
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ------------------------------------------------ 2. Contadores con rewind */

  var contadoresVistos = typeof WeakSet !== "undefined" ? new WeakSet() : null;
  var observadorContadores = null;

  function animarContador(el) {
    var fin = parseInt(el.getAttribute("data-contador"), 10);
    if (isNaN(fin)) return;
    window.cancelAnimationFrame(el._raf);
    var inicio = null, duracion = 1500;
    function paso(t) {
      if (inicio === null) inicio = t;
      var p = Math.min(1, (t - inicio) / duracion);
      var suave = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(fin * suave));
      if (p < 1) el._raf = window.requestAnimationFrame(paso);
    }
    el._raf = window.requestAnimationFrame(paso);
  }

  function escanearContadores() {
    var lista = document.querySelectorAll("[data-contador]");
    for (var i = 0; i < lista.length; i++) {
      var el = lista[i];
      if (contadoresVistos) { if (contadoresVistos.has(el)) continue; contadoresVistos.add(el); }
      if (reducir || !hayObservador) { el.textContent = el.getAttribute("data-contador"); continue; }
      if (!observadorContadores) {
        observadorContadores = new IntersectionObserver(function (entradas) {
          entradas.forEach(function (entrada) {
            var c = entrada.target;
            if (entrada.isIntersecting) { animarContador(c); return; }
            var limite = entrada.rootBounds ? entrada.rootBounds.bottom : window.innerHeight;
            if (entrada.boundingClientRect.top >= limite - 1) {
              window.cancelAnimationFrame(c._raf);
              c.textContent = "0";
            }
          });
        }, { threshold: 0.6 });
      }
      observadorContadores.observe(el);
    }
  }

  /* ------------------------------------------------ 3. Scrub y parallax */

  function iniciarScrub() {
    /* Los vídeos de las secciones FAQ y CTA se mueven con parallax */
    document.querySelectorAll(".faq-video-elemento, .cta-video-elemento").forEach(function (v) {
      var s = v.closest("section");
      if (s && !s.hasAttribute("data-scrub")) s.setAttribute("data-scrub", "paralaje");
    });
    var elementos = [].slice.call(document.querySelectorAll("[data-scrub]"));
    if (!elementos.length || reducir) return;
    var pendiente = false;

    function actualizar() {
      pendiente = false;
      var vh = window.innerHeight;
      elementos.forEach(function (el) {
        var caja = el.getBoundingClientRect();
        if (caja.bottom < -80 || caja.top > vh + 80) return;
        if (el.getAttribute("data-scrub") === "paralaje") {
          /* 0 cuando la sección asoma por abajo, 1 cuando sale por arriba */
          var q = (vh - caja.top) / (vh + caja.height);
          el.style.setProperty("--q", Math.min(1, Math.max(0, q)).toFixed(3));
        } else {
          var p = -caja.top / Math.max(1, caja.height * 0.9);
          el.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(3));
        }
      });
    }
    window.addEventListener("scroll", function () {
      if (!pendiente) { pendiente = true; window.requestAnimationFrame(actualizar); }
    }, { passive: true });
    window.addEventListener("resize", actualizar);
    actualizar();
  }

  /* ------------------------------------------------ 4. Cabecera: baja y sube con el scroll */

  function iniciarCabecera() {
    var cabecera = document.querySelector("header.sticky");
    if (!cabecera || reducir) return;
    var ultimo = window.scrollY;
    var pendiente = false;

    function revisar() {
      pendiente = false;
      var y = window.scrollY;
      var delta = y - ultimo;
      var menu = document.getElementById("menu-movil");
      var menuAbierto = menu && !menu.hasAttribute("hidden");
      if (y < 120 || delta < -6 || menuAbierto || cabecera.matches(":focus-within")) {
        cabecera.classList.remove("cabecera-oculta");
      } else if (delta > 6) {
        cabecera.classList.add("cabecera-oculta");
      }
      if (Math.abs(delta) > 6) ultimo = y;
    }
    window.addEventListener("scroll", function () {
      if (!pendiente) { pendiente = true; window.requestAnimationFrame(revisar); }
    }, { passive: true });
  }

  /* ------------------------------------------------ 5. Vídeos de fondo */

  function iniciarVideos() {
    var videos = [].slice.call(document.querySelectorAll("video"));
    if (!videos.length) return;

    function cargar(video) {
      var fuente = video.querySelector("source[data-src]");
      if (fuente && !fuente.getAttribute("src")) {
        fuente.setAttribute("src", fuente.getAttribute("data-src"));
        video.load();
      }
    }
    /* Con "reducir movimiento" los vídeos de fondo no se reproducen (se ve el póster) */
    if (reducir) { videos.forEach(function (v) { try { v.pause(); } catch (e) { } }); return; }

    if (!hayObservador) { videos.forEach(function (v) { cargar(v); }); return; }
    /* Solo se reproducen los vídeos que se ven (ahorra batería y datos) */
    var vigilante = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        var video = entrada.target;
        if (entrada.isIntersecting) {
          cargar(video);
          var promesa = video.play();
          if (promesa && promesa.catch) promesa.catch(function () { });
        } else {
          video.pause();
        }
      });
    }, { rootMargin: "200px 0px" });
    videos.forEach(function (v) { vigilante.observe(v); });
  }

  /* ------------------------------------------------ arranque */

  function iniciar() {
    escanear();
    vigilarContenidoNuevo();
    iniciarScrub();
    iniciarCabecera();
    iniciarVideos();
    window.DPAPAnim = { escanear: escanear };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
