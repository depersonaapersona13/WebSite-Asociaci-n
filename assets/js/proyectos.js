/* proyectos.js — listado y filtros de la página de Proyectos.
 *
 * Depende de main.js, de donde toma window.obtenerSitio() y window.plantillaProyecto().
 * Los proyectos se editan en data/site.json -> "proyectos".
 */
(function () {
  "use strict";

  /* Normaliza el estado: activo | finalizado (acepta también cerrado/pasado) */
  function estadoNormalizado(proyecto) {
    var estado = String((proyecto && proyecto.estado) || "activo").toLowerCase();
    return estado === "finalizado" || estado === "cerrado" || estado === "pasado"
      ? "finalizado"
      : "activo";
  }

  function t(clave, reserva) {
    var texto = typeof window.textoSitio === "function" ? window.textoSitio(clave) : "";
    return texto || reserva;
  }

  function iniciar() {
    var lista = document.querySelector("[data-proyectos]");
    if (!lista || typeof window.obtenerSitio !== "function") return;

    var aviso = document.querySelector("[data-proyectos-aviso]");
    var cuenta = document.querySelector("[data-proyectos-cuenta]");
    var botones = document.querySelectorAll("[data-filtro]");
    var filtroActual = "todos";

    window.obtenerSitio().then(function (sitio) {
      var proyectos = (sitio && sitio.proyectos) || [];

      function pintar() {
        var visibles = proyectos.filter(function (proyecto) {
          return filtroActual === "todos" || estadoNormalizado(proyecto) === filtroActual;
        });

        lista.innerHTML = visibles.map(function (proyecto) {
          return "<li>" + window.plantillaProyecto(proyecto) + "</li>";
        }).join("");

        if (cuenta) {
          cuenta.textContent = proyectos.length
            ? window.interpolarSitio(t("comun.cuentaProyectos", "Mostrando {a} de {b} proyectos."), { a: visibles.length, b: proyectos.length })
            : "";
        }

        if (aviso) {
          if (!proyectos.length) {
            aviso.innerHTML = '<p class="pendiente">' + t("comun.pendienteProyectos", "Pendiente de publicar los proyectos.") + "</p>";
          } else if (!visibles.length) {
            aviso.innerHTML = '<p class="pendiente">' + t("comun.sinResultados", "Todavía no hay proyectos con este filtro.") + "</p>";
          } else {
            aviso.innerHTML = "";
          }
        }
      }

      botones.forEach(function (boton) {
        boton.addEventListener("click", function () {
          filtroActual = boton.getAttribute("data-filtro") || "todos";
          botones.forEach(function (otro) {
            otro.setAttribute("aria-pressed", String(otro === boton));
          });
          pintar();
        });
      });

      pintar();
    });
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();