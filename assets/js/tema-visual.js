/* tema-visual.js — el tema (claro/oscuro) sigue siempre al del dispositivo.
 *
 * No hay botón ni preferencia guardada: se usa prefers-color-scheme del sistema
 * (ordenador, móvil o tablet) y se actualiza solo si el sistema cambia de tema
 * (por ejemplo, al llegar la noche con el modo automático activado).
 *
 * Se carga al principio del <head>, sin "defer" y como archivo externo (compatible con la CSP),
 * para aplicar el tema ANTES de pintar y evitar el destello blanco.
 */
(function () {
  "use strict";

  var consulta = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function aplicar(oscuro) {
    document.documentElement.classList.toggle("modo-oscuro", !!oscuro);
  }

  aplicar(consulta && consulta.matches);

  if (consulta) {
    var alCambiar = function (evento) { aplicar(evento.matches); };
    if (consulta.addEventListener) consulta.addEventListener("change", alCambiar);
    else if (consulta.addListener) consulta.addListener(alCambiar); /* Safari antiguo */
  }
})();
