/* tema.js — Tema de Tailwind (colores de marca).
 *
 * Se carga DESPUÉS de https://cdn.tailwindcss.com y ANTES del contenido de la
 * página, de modo que Tailwind ya conoce estos colores al generar las clases.
 *
 * Este es el ÚNICO sitio donde se definen los colores para las clases de Tailwind
 * (bg-brand-400, text-brand-900, ...). Si cambias un color aquí, cámbialo también
 * en :root de assets/css/styles.css (que alimenta las clases propias .btn, .tarjeta...).
 */
(function () {
  "use strict";

  var tema = {
    theme: {
      extend: {
        colors: {
          /* Paleta derivada del azul del logo (#8FB9E0) */
          brand: {
            50: "#F2F7FC",
            100: "#E1EEF8",
            200: "#C2DCF1",
            300: "#A3CAEA",
            400: "#8FB9E0", /* azul del logo: superficies y fondos */
            500: "#6BA3D6",
            600: "#4A87BE",
            700: "#2F6BA8", /* botones con texto blanco (contraste AA) */
            800: "#204F7E",
            900: "#163A5C" /* títulos y texto principal */
          }
        }
      }
    }
  };

  /* window.tailwind lo crea el script del CDN. Asignar su .config es el mismo
     mecanismo que la configuración inline documentada por Tailwind. */
  window.tailwind = window.tailwind || {};
  window.tailwind.config = tema;
})();