$files = @('index.html', 'sobre-nosotros.html', 'proyectos.html', 'contacto.html', 'aviso-legal.html', 'politica-privacidad.html', '404.html')
$baseDir = 'c:\Users\Poley\Desktop\Proyectos\deperaper13-web\'

$newHead = '<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>De Personas a Personas · Jóvenes que se apoyan entre sí</title>
  <meta name="description" content="Asociación juvenil de apoyo mutuo: jóvenes que se acompañan, se escuchan y se apoyan entre sí. Descubre nuestros proyectos y cómo participar.">
  <meta name="theme-color" content="#8FB9E0">
  <link rel="canonical" href="https://depersonaapersona13-web.pages.dev/">

  <!-- Vista previa al compartir por WhatsApp, Instagram, X, Facebook... -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="De Personas a Personas">
  <meta property="og:locale" content="es_ES">
  <meta property="og:title" content="De Personas a Personas · Jóvenes que se apoyan entre sí">
  <meta property="og:description" content="Asociación juvenil de apoyo mutuo: jóvenes que se acompañan, se escuchan y se apoyan entre sí.">
  <meta property="og:url" content="https://depersonaapersona13-web.pages.dev/">
  <meta property="og:image" content="https://depersonaapersona13-web.pages.dev/assets/img/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="De Personas a Personas · Jóvenes que se apoyan entre sí">
  <meta name="twitter:description" content="Asociación juvenil de apoyo mutuo: jóvenes que se acompañan, se escuchan y se apoyan entre sí.">
  <meta name="twitter:image" content="https://depersonaapersona13-web.pages.dev/assets/img/og-image.png">

  <!-- Schema.org JSON-LD: Organization + WebSite -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "De Personas a Personas",
        "alternateName": "DPAP",
        "url": "https://depersonaapersona13-web.pages.dev/",
        "logo": "https://depersonaapersona13-web.pages.dev/assets/img/logo.svg",
        "description": "Asociación juvenil sin ánimo de lucro de apoyo mutuo en Sevilla. Espacios seguros de acompañamiento, escucha activa y comunidad entre iguales.",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Sevilla",
          "addressRegion": "Andalucía",
          "addressCountry": "ES"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+34 600 123 456",
          "contactType": "customer service",
          "availableLanguage": ["Spanish", "English"]
        },
        "sameAs": [
          "https://www.instagram.com/_de.persona.a.persona_/",
          "https://www.tiktok.com/@depersonasapersonas",
          "https://www.facebook.com/profile.php?id=61594435199655",
          "https://x.com/personapersona",
          "https://www.youtube.com/@Depersonasapersonas"
        ]
      },
      {
        "@type": "WebSite",
        "url": "https://depersonaapersona13-web.pages.dev/",
        "name": "De Personas a Personas",
        "description": "Asociación juvenil de apoyo mutuo: jóvenes que se acompañan, se escuchan y se apoyan entre sí.",
        "publisher": { "@id": "https://depersonaapersona13-web.pages.dev/#organization" },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://depersonaapersona13-web.pages.dev/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  }
  </script>

  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="/assets/img/favicon-32.png" type="image/png" sizes="32x32">
  <link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">

  <!-- Rendimiento: el logo es la imagen más importante; el JSON se pide cuanto antes -->
  <link rel="preload" href="/assets/img/logo.svg" as="image" fetchpriority="high">
  <link rel="preload" href="/data/site.json" as="fetch" crossorigin="anonymous">
  <link rel="preconnect" href="https://cdn.tailwindcss.com" crossorigin>

  <!-- Tema visual (modo oscuro) antes de pintar, para evitar el destello blanco -->
  <script src="/assets/js/tema-visual.js"></script>

  <!-- Tailwind por CDN + tema de marca (colores en assets/js/tema.js) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="/assets/js/tema.js"></script>
  <link rel="stylesheet" href="/assets/css/styles.css">

  <!-- Selector de idioma (antes de main.js) + encabezado/pie compartidos + lógica general -->
  <script src="/assets/js/idiomas.js" defer></script>
  <script src="/assets/js/layout.js" defer></script>
  <script src="/assets/js/main.js" defer></script>
</head>'

foreach ($f in $files) {
    $path = $baseDir + $f
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $bodyStart = $content.IndexOf('<body')
    if ($bodyStart -gt 0) {
        $newFile = $newHead + "`n" + $content.Substring($bodyStart)
        [System.IO.File]::WriteAllText($path, $newFile, [System.Text.Encoding]::UTF8)
        Write-Host "Fixed: $f"
    }
}