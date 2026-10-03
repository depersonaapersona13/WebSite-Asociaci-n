/** Configuración de Tailwind (compilación local, sin CDN).
 *  Compilar:  npx tailwindcss -c tailwind.config.js -i src/tailwind-entrada.css -o assets/css/tailwind.css --minify
 *  (o  npm run css  si usas el package.json incluido). Hay que recompilar si añades clases nuevas. */
module.exports = {
  content: ["./*.html", "./en/*.html", "./partials/*.html", "./assets/js/*.js", "./data/*.json"],
  darkMode: ["selector", ".modo-oscuro"],
  theme: {
    extend: {
      colors: {
        /* Paleta derivada del azul del logo (#8FB9E0). Mantener igual que :root en styles.css */
        brand: {
          50: "#F2F7FC", 100: "#E1EEF8", 200: "#C2DCF1", 300: "#A3CAEA", 400: "#8FB9E0",
          500: "#6BA3D6", 600: "#4A87BE", 700: "#2F6BA8", 800: "#204F7E", 900: "#163A5C", 950: "#0D2236"
        }
      }
    }
  },
  plugins: []
};
