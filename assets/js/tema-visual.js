/* tema-visual.js — aplica el tema claro/oscuro ANTES de que se pinte la página,
 * para evitar el destello blanco al cargar. Se carga al principio del <head>,
 * sin "defer", y de forma externa (compatible con la CSP del sitio).
 *
 * Prioridad: parámetro ?tema=oscuro|claro  >  preferencia guardada (localStorage)
 *            >  preferencia del sistema (prefers-color-scheme)
 * El botón de cambio del encabezado llama a window.cambiarTema().
 */
(function () {
  "use strict";

  var CLAVE = "dpap-tema";

  function sistemaOscuro() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function desdeParametro() {
    try {
      var valor = new URLSearchParams(window.location.search).get("tema");
      if (valor === "oscuro") return true;
      if (valor === "claro") return false;
    } catch (e) { }
    return null;
  }

  function estado() {
    var delParametro = desdeParametro();
    if (delParametro !== null) return delParametro;

    var guardado = null;
    try { guardado = window.localStorage.getItem(CLAVE); } catch (e) { }
    if (guardado === "oscuro") return true;
    if (guardado === "claro") return false;
    return sistemaOscuro();
  }

  function aplicar(oscuro) {
    var raiz = document.documentElement;
    if (oscuro) {
      raiz.classList.add("modo-oscuro");
    } else {
      raiz.classList.remove("modo-oscuro");
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", oscuro ? "#0D2236" : "#8FB9E0");
    var boton = document.getElementById("boton-tema");
    if (boton) boton.setAttribute("aria-pressed", String(oscuro));
  }

  function cambiarTema() {
    var oscuro = !document.documentElement.classList.contains("modo-oscuro");
    try { window.localStorage.setItem(CLAVE, oscuro ? "oscuro" : "claro"); } catch (e) { }
    aplicar(oscuro);
  }

  aplicar(estado());

  /* API para main.js */
  window.temaActivoOscuro = estado;
  window.cambiarTema = cambiarTema;
})();