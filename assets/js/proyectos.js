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

        lista.classList.add("proyectos-cambiando");
        lista.innerHTML = visibles.map(function (proyecto, indice) {
          return '<li class="proyecto-entrada" style="--proyecto-delay:' + (indice * 55) + 'ms">' + window.plantillaProyecto(proyecto) + "</li>";
        }).join("");
        window.requestAnimationFrame(function () { lista.classList.remove("proyectos-cambiando"); });

        if (cuenta) {
          cuenta.textContent = proyectos.length
            ? "Mostrando " + visibles.length + " de " + proyectos.length + " proyectos."
            : "";
        }

        if (aviso) {
          if (!proyectos.length) {
            aviso.innerHTML = '<p class="pendiente">Pendiente de publicar los proyectos: se añaden en data/site.json.</p>';
          } else if (!visibles.length) {
            aviso.innerHTML = '<p class="pendiente">Todavía no hay proyectos con este filtro.</p>';
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
    }).catch(function (error) {
      console.error("[proyectos] No se pudo cargar el listado:", error);
      lista.innerHTML = "";
      if (cuenta) cuenta.textContent = "";
      if (aviso) {
        aviso.innerHTML = '<p class="pendiente" role="alert">No hemos podido cargar los proyectos. Inténtalo de nuevo en unos instantes.</p>';
      }
    });
  }

  document.addEventListener("DOMContentLoaded", iniciar);
})();
