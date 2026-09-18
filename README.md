# De Personas a Personas — web de la asociación

Sitio estático (HTML + Tailwind por CDN + JavaScript sin dependencias) listo para
alojarse en **Cloudflare Pages**. No necesita compilación ni `npm install`.

> «Jóvenes que se apoyan entre sí»

---

## 1. Ver la web en tu ordenador

El sitio se sirve por HTTP (el encabezado y el pie se cargan con `fetch`), así que
**no vale con hacer doble clic en el HTML**. Desde la carpeta del proyecto:

```powershell
npx serve .
```

Y abre la dirección que aparece (normalmente `http://localhost:3000`).

Alternativas: `npx http-server .` o `python -m http.server 8080`.

---

## 2. Publicar en Cloudflare Pages

### Opción A — Subida directa (la más rápida)

```powershell
npx wrangler pages deploy .
```

La primera vez te pedirá iniciar sesión en Cloudflare y crear el proyecto. Devuelve
una URL del tipo `https://nombre-del-proyecto.pages.dev`.

### Opción B — Conectado a un repositorio de Git (recomendado a largo plazo)

1. Sube el proyecto a GitHub/GitLab (`git init`, `git add .`, `git commit -m "Web inicial"`, `git push`).
2. En el panel de Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**.
3. Elige el repositorio y configura:
   - **Framework preset**: `None`
   - **Build command**: *(vacío)*
   - **Build output directory**: `/`
4. Guardar y desplegar. Cada `git push` publica una versión nueva.

### Dominio propio

1. En el proyecto de Pages: **Custom domains → Set up a custom domain**.
2. Añade el dominio y sigue las instrucciones de DNS.
3. Después busca y reemplaza `https://depersonaapersona13-web.pages.dev` por vuestro dominio en:
   `index.html`, `sobre-nosotros.html`, `proyectos.html`, `contacto.html`,
   `sitemap.xml`, `robots.txt` y `data/site.json` (campo `meta.urlBase`).

---

## 3. Cómo editar el contenido

### Textos de cada página → archivos `.html`

| Página | Archivo |
|---|---|
| Inicio | `index.html` |
| Sobre Nosotros | `sobre-nosotros.html` |
| Proyectos | `proyectos.html` |
| Contacto | `contacto.html` |
| Página de error 404 | `404.html` |

Busca en ellos los comentarios `<!-- PENDIENTE: ... -->`: ahí están los textos que
conviene revisar o sustituir por información real. El encabezado y el pie de página
se editan una sola vez, en `partials/header.html` y `partials/footer.html`.

### Datos repetidos → `data/site.json`

Es un archivo de texto con una lista de datos. Se edita con cualquier editor, sin
tocar el resto del código:

- `meta`: nombre, eslogan, descripciones, dominio y logo.
- `contacto`: correo, teléfono, dónde estáis, horario y configuración del formulario.
- `redes`: lista de redes sociales (`nombre`, `url` y `icono`). Si `url` está vacía,
  la red no se muestra.
- `legal`: CIF, registro de asociaciones, fecha de constitución y domicilio social.
- `junta`: lista de personas de la junta (`nombre`, `cargo`, `foto`, `bio`).
- `proyectos`: lista de proyectos (`titulo`, `estado`, `anio`, `resumen`, `imagen`, `enlace`).

**Importante:** cualquier valor que empiece por `PENDIENTE` se muestra en la web como
«información pendiente de completar». En cuanto lo rellenéis, ese aviso desaparece
automáticamente. Vigilad las comas: si el JSON queda mal formado, la página avisa en
la consola del navegador.

### Logo e imágenes → `assets/img/`

El logo real debe llamarse **`logo.png`** (cuadrado, 512×512 o más) y colocarse en
`assets/img/`. Mientras no exista, se usa la marca provisional `assets/img/logo.svg`.
Hay una guía más detallada en `assets/img/LEEME.txt`.

---

## 4. Formulario de contacto

Tal como está ahora, el formulario **abre el programa de correo del visitante** con el
mensaje ya redactado (no necesita servidores ni servicios externos). Funciona bien,
pero depende de que la persona tenga configurado un gestor de correo.

Si preferís que el mensaje llegue directamente a vuestro correo sin salir de la web,
hay dos caminos:

**A. Servicio externo (5 minutos).** Cread una cuenta en Web3Forms o Formspree, y en
`data/site.json` poned la URL que os den en `contacto.formulario.endpoint` y el correo
de destino en `contacto.formulario.destino`. En `contacto.html` añadid el campo oculto
que pida el servicio (por ejemplo `<input type="hidden" name="access_key" value="...">`).

**B. Cloudflare Pages Functions (sin terceros).** Añadid un archivo
`functions/contacto.js` que reciba el POST y envíe el correo con Resend. Requiere
verificar el dominio en Cloudflare. Cuando queráis, os lo preparo.

---

## 5. Estructura del proyecto

```
index.html            Inicio          partials/header.html    Encabezado compartido
sobre-nosotros.html   Sobre Nosotros  partials/footer.html    Pie compartido
proyectos.html        Proyectos       data/site.json          Datos editables
contacto.html         Contacto        _headers                Cabeceras HTTP de Pages
404.html              Error 404       _redirects              URLs limpias
robots.txt            Instrucciones   sitemap.xml             Mapa del sitio

assets/css/styles.css      Estilos propios, colores de marca en :root
assets/js/tema.js          Paleta que usa Tailwind (clases brand-*)
assets/js/layout.js        Carga partials y marca la página activa
assets/js/main.js          Datos, menú móvil, animaciones y formulario
assets/js/proyectos.js     Listado y filtros de proyectos
assets/img/                Logo, favicon e imágenes (ver LEEME.txt)
```

---

## 6. Detalles técnicos que conviene conocer

- **Tailwind por CDN**: comodísimo (cero configuración), pero añade la herramienta de
  compilación al navegador. Si algún día queréis máxima velocidad, se puede migrar a
  Tailwind compilado con `npm install -D tailwindcss` y un comando de build en Pages.
  Aviso: al hacerlo habrá que definir el tema en un `tailwind.config.js`.
- **Cabeceras de seguridad** en `_headers`: incluyen una `Content-Security-Policy`
  ajustada al CDN de Tailwind. Si tras publicar algo dejase de verse, comentad esa
  línea: es lo primero que hay que descartar.
- **`_redirects`**: permiten `/proyectos` sin la extensión `.html` (Pages ya lo hace
  de serie; las reglas son explícitas para enlaces con barra final).
- **Accesibilidad**: enlace «saltar al contenido», foco visible, contraste verificado sobre
  el azul de marca, menú cerrable con `Escape`, textos alternativos y respeto por
  `prefers-reduced-motion`.
- **Sin cookies ni rastreadores**: no hay analítica ni fuentes externas, lo que
  simplifica el cumplimiento del RGPD. Si añadís Google Analytics, habrá que avisar
  en un banner y en la política de privacidad.

---

## 7. Pendientes de rellenar

1. **Logo real** en `assets/img/logo.png` (ahora se ve la marca provisional).
2. **Datos de contacto** (correo, teléfono, dónde estáis, horario) en `data/site.json`.
3. **Redes sociales** (una URL de Instagram/WhatsApp/etc. basta para que aparezcan).
4. **Datos legales**: CIF, número de registro de asociaciones, fecha de constitución
   y domicilio social.
5. **Proyectos**: títulos, descripciones reales, años y fotos (`assets/img/proyectos/`).
6. **Junta directiva**: nombres, cargos y (si queréis) fotos.
7. **Textos de Inicio y Sobre Nosotros**: buscad los comentarios `<!-- PENDIENTE: ... -->`.
8. **Dominio propio**: cambiarlo en los HTML, `sitemap.xml`, `robots.txt` y `site.json`.
9. *(Opcional)* Aviso legal y política de privacidad, si publicáis esos textos.
10. *(Opcional)* Imagen para compartir en redes: `assets/img/og-image.png` (1200×630).