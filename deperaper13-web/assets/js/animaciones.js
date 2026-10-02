/* animaciones.js — scroll reveal con "rewind", hero ligado al scroll, cabecera inteligente
 * y gestión de los vídeos de fondo (carga diferida, pausa fuera de pantalla, botón de pausa).
 *
 * Sin dependencias. Se carga con "defer" ANTES de main.js (ver <head> de cada página).
 * Estilos asociados: assets/css/animaciones.css
 */
(function () {
  "use strict";

  var raiz = document.documentElement;
  var reducir = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var hayObservador = "IntersectionObserver" in window;

  /* Activa los estilos de animación y desactiva el reveal antiguo de main.js */
  raiz.classList.add("js");
  raiz.dataset.revelado = "si";

  /* ------------------------------------------------ 1. Scroll reveal + rewind */

  var observador = null;
  var registrados = typeof WeakSet !== "undefined" ? new WeakSet() : null;

  function crearObservador() {
    observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        var el = entrada.target;
        if (entrada.isIntersecting) {
          el.classList.add("visible");
          return;
        }
        if (el.getAttribute("data-rewind") === "false") return;
        /* REWIND: si el elemento quedó por DEBAJO de la pantalla, el visitante está subiendo;
           se quita .visible y la animación se reproduce a la inversa. Si salió por arriba
           (está bajando) se queda visible para no parpadear. */
        var limite = entrada.rootBounds ? entrada.rootBounds.bottom : window.innerHeight;
        if (entrada.boundingClientRect.top >= limite - 1) el.classList.remove("visible");
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });
  }

  /* Elementos que se animan sin tener que marcarlos a mano en el HTML */
  var AUTO = "main h2, [data-junta] li, [data-proyectos] > li, [data-proyectos-destacados] li";
  var LISTAS = "[data-junta], [data-proyectos], [data-proyectos-destacados]";

  function escanear() {
    document.querySelectorAll(AUTO).forEach(function (el) {
      if (el.classList.contains("revelar")) return;
      if (el.tagName === "H2") {
        if (el.closest(".revelar")) return;          /* ya viaja dentro de un bloque animado */
        el.setAttribute("data-reveal", "mask");
      }
      el.classList.add("revelar");
    });

    /* Escalonado de las tarjetas que se pintan desde data/site.json */
    document.querySelectorAll(LISTAS).forEach(function (lista) {
      lista.querySelectorAll("li.revelar").forEach(function (li, i) {
        if (!li.hasAttribute("data-d")) {
          li.setAttribute("data-d", "1");
          li.style.setProperty("--d", ((i % 4) * 0.1).toFixed(2) + "s");
        }
      });
    });

    var nuevos = document.querySelectorAll(".revelar");
    for (var i = 0; i < nuevos.length; i++) {
      var el = nuevos[i];
      if (registrados) { if (registrados.has(el)) continue; registrados.add(el); }
      if (reducir || !hayObservador) {
        el.classList.add("visible");
      } else {
        if (!observador) crearObservador();
        observador.observe(el);
      }
    }
  }

  /* Las tarjetas de junta, proyectos y testimonios se crean DESPUÉS (fetch de site.json):
     se vigila el documento para animarlas también. */
  function vigilarContenidoNuevo() {
    if (!("MutationObserver" in window)) return;
    var temporizador = null;
    new MutationObserver(function () {
      if (temporizador) return;
      temporizador = window.setTimeout(function () { temporizador = null; escanear(); }, 60);
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ------------------------------------------------ 2. Hero ligado al scroll (scrub) */

  function iniciarScrub() {
    var elementos = [].slice.call(document.querySelectorAll("[data-scrub]"));
    if (!elementos.length || reducir) return;
    var pendiente = false;

    function actualizar() {
      pendiente = false;
      elementos.forEach(function (el) {
        var caja = el.getBoundingClientRect();
        if (caja.bottom < -50 || caja.top > window.innerHeight + 50) return;
        var p = Math.min(1, Math.max(0, -caja.top / Math.max(1, caja.height * 0.9)));
        el.style.setProperty("--p", p.toFixed(3));
      });
    }
    window.addEventListener("scroll", function () {
      if (!pendiente) { pendiente = true; window.requestAnimationFrame(actualizar); }
    }, { passive: true });
    actualizar();
  }

  /* ------------------------------------------------ 3. Cabecera: baja y sube con el scroll */

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

  /* ------------------------------------------------ 4. Vídeos de fondo */

  function texto(clave, reserva) {
    if (typeof window.textoSitio === "function") {
      var t = window.textoSitio(clave);
      if (t) return t;
    }
    return reserva;
  }

  function iniciarVideos() {
    var videos = [].slice.call(document.querySelectorAll("video"));
    if (!videos.length) return;

    var boton = document.getElementById("btn-video-fondo");
    var pausadoPorUsuario = reducir;   /* con "reducir movimiento" empiezan en pausa */

    function cargar(video) {
      var fuente = video.querySelector("source[data-src]");
      if (fuente && !fuente.getAttribute("src")) {
        fuente.setAttribute("src", fuente.getAttribute("data-src"));
        video.load();
      }
    }
    function reproducir(video) {
      if (pausadoPorUsuario) return;
      cargar(video);
      var promesa = video.play();
      if (promesa && promesa.catch) promesa.catch(function () { });
    }
    function pintarBoton() {
      if (!boton) return;
      var pausa = boton.querySelector(".icono-pausa");
      var play = boton.querySelector(".icono-reproducir");
      if (pausa) pausa.classList.toggle("oculto", pausadoPorUsuario);
      if (play) play.classList.toggle("oculto", !pausadoPorUsuario);
      boton.setAttribute("aria-pressed", String(pausadoPorUsuario));
      boton.setAttribute("aria-label", pausadoPorUsuario
        ? texto("hero.reanudarVideo", "Reproducir vídeo de fondo")
        : texto("hero.pausarVideo", "Pausar vídeo de fondo"));
    }

    if (hayObservador) {
      /* Se reproducen solo los vídeos que se ven (ahorra batería y datos) */
      var vigilante = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          var video = entrada.target;
          video._visible = entrada.isIntersecting;
          if (entrada.isIntersecting) reproducir(video); else video.pause();
        });
      }, { rootMargin: "200px 0px" });
      videos.forEach(function (v) { vigilante.observe(v); });
    }

    if (pausadoPorUsuario) videos.forEach(function (v) { try { v.pause(); } catch (e) { } });

    if (boton) {
      boton.addEventListener("click", function () {
        pausadoPorUsuario = !pausadoPorUsuario;
        videos.forEach(function (v) {
          if (pausadoPorUsuario) v.pause();
          else if (v._visible !== false) reproducir(v);
        });
        pintarBoton();
      });
      document.addEventListener("idioma:cambiado", pintarBoton);
      pintarBoton();
    }
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
