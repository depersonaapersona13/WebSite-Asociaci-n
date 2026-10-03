#!/usr/bin/env python3
"""construir.py — genera todo lo que depende del idioma. Ejecutar desde la raíz del proyecto:

    python tools/construir.py

Necesita Python 3 y BeautifulSoup (una sola vez:  pip install beautifulsoup4).

Qué hace:
  1. Mete partials/header.html y partials/footer.html dentro de cada página en español
     (así la navegación está en el HTML y la ven los buscadores sin ejecutar JavaScript).
  2. Genera la versión en inglés de cada página en /en/ a partir de las páginas en español
     y de data/textos.json (únicos sitios donde se escribe el texto en inglés).
  3. Añade a todas las páginas <link rel="alternate" hreflang>, canonical, Open Graph y datos
     estructurados (JSON-LD) correctos para cada idioma.
  4. Escribe sitemap.xml con las dos versiones de cada página.
  5. Copia el diccionario (sin los bloques legales) dentro de assets/js/idiomas.js.

El nombre de la entidad («De Personas a Personas») y el eslogan («Jóvenes que se apoyan
entre sí») NO se traducen: se quedan en español en las páginas en inglés.
Al final avisa si queda texto en español sin traducir en alguna página inglesa.
"""
import glob
import io
import json
import os
import re
import sys

try:
    from bs4 import BeautifulSoup, NavigableString
except ImportError:
    sys.exit("Falta BeautifulSoup. Instálalo con:  pip install beautifulsoup4")

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)

BASE = "https://depersonaapersona13-web.pages.dev"
FECHA = "2026-10-03"
NOMBRE = "De Personas a Personas"
ESLOGAN = "Jóvenes que se apoyan entre sí"

# (clave, archivo es, ruta es, archivo en, ruta en, prioridad)
PAGINAS = [
    ("inicio", "index.html", "/", "en/index.html", "/en/", "1.0"),
    ("sobre-nosotros", "sobre-nosotros.html", "/sobre-nosotros", "en/about-us.html", "/en/about-us", "0.8"),
    ("proyectos", "proyectos.html", "/proyectos", "en/projects.html", "/en/projects", "0.8"),
    ("contacto", "contacto.html", "/contacto", "en/contact.html", "/en/contact", "0.7"),
    ("aviso-legal", "aviso-legal.html", "/aviso-legal", "en/legal-notice.html", "/en/legal-notice", "0.3"),
    ("politica-privacidad", "politica-privacidad.html", "/politica-privacidad", "en/privacy-policy.html", "/en/privacy-policy", "0.3"),
]
RUTAS_EN = {p[2]: p[4] for p in PAGINAS}

META_EN = {
    "inicio": ("De Personas a Personas · Youth mutual support in Seville",
               "Non-profit youth association in Seville: safe spaces for listening, peer support and community. Discover our projects."),
    "sobre-nosotros": ("About us · De Personas a Personas",
                       "Who we are, what drives us and who makes up the team of De Personas a Personas, a youth mutual support association in Seville."),
    "proyectos": ("Projects · De Personas a Personas",
                  "Discover the projects of De Personas a Personas: meetups, peer support and solidarity campaigns by young people in Seville."),
    "contacto": ("Contact · De Personas a Personas",
                 "Write to us to take part, suggest an activity or collaborate with De Personas a Personas, a youth mutual support association in Seville."),
    "aviso-legal": ("Legal notice · De Personas a Personas",
                    "Legal notice and identifying details of the De Personas a Personas association."),
    "politica-privacidad": ("Privacy policy · De Personas a Personas",
                            "How De Personas a Personas processes your personal data: purpose, rights and contact, in line with the GDPR."),
}

# Textos fijos de las plantillas (header/footer/noscript) que no llevan data-i18n
ATRIBUTOS_EN = {
    "Principal": "Main",
    "Menú móvil": "Mobile menu",
    "Pie de página": "Footer",
    "Logotipo de De Personas a Personas": "De Personas a Personas logo",
}

avisos = []


def leer(ruta):
    with io.open(ruta, encoding="utf-8-sig", newline="") as f:
        return f.read().replace("\r\n", "\n")


def escribir(ruta, texto):
    carpeta = os.path.dirname(ruta)
    if carpeta:
        os.makedirs(carpeta, exist_ok=True)
    with io.open(ruta, "w", encoding="utf-8", newline="\n") as f:
        f.write(texto)


def norm(s):
    return re.sub(r"\s+", " ", s).strip()


TEXTOS = json.loads(leer("data/textos.json"))
ES, EN = TEXTOS["es"], TEXTOS["en"]


def buscar(arbol, clave):
    nodo = arbol
    for parte in clave.split("."):
        if not isinstance(nodo, dict) or parte not in nodo:
            return None
        nodo = nodo[parte]
    return nodo if isinstance(nodo, str) else None


# ----------------------------------------------------------------------- JSON-LD

def json_ld(clave, lang):
    es = lang == "es"
    url = lambda p: BASE + (p if p != "/" or es else "/")
    ruta_pag = next(p for p in PAGINAS if p[0] == clave)
    ruta = ruta_pag[2] if es else ruta_pag[4]
    org = {
        "@type": "Organization", "@id": BASE + "/#organization", "name": NOMBRE, "alternateName": "DPAP",
        "url": BASE + "/", "logo": BASE + "/assets/img/logo.png",
        "description": ("Asociación juvenil sin ánimo de lucro de apoyo mutuo en Sevilla. Espacios seguros de acompañamiento, escucha activa y comunidad entre iguales."
                        if es else "Non-profit youth mutual support association in Seville. Safe spaces for accompaniment, active listening and peer community."),
        "address": {"@type": "PostalAddress", "addressLocality": "Sevilla" if es else "Seville",
                    "addressRegion": "Andalucía" if es else "Andalusia", "addressCountry": "ES"},
        "contactPoint": {"@type": "ContactPoint", "email": "depersonaapersona13@gmail.com",
                         "contactType": "customer support", "availableLanguage": ["es", "en"]},
        "sameAs": ["https://www.instagram.com/_de.persona.a.persona_/", "https://www.tiktok.com/@depersonasapersonas",
                   "https://www.facebook.com/profile.php?id=61594435199655", "https://x.com/personapersona",
                   "https://www.youtube.com/@Depersonasapersonas"],
    }
    if clave == "inicio":
        web = {"@type": "WebSite", "@id": BASE + ("/#website" if es else "/en/#website"),
               "url": BASE + ("/" if es else "/en/"), "name": NOMBRE, "inLanguage": lang,
               "publisher": {"@id": BASE + "/#organization"}}
        return {"@context": "https://schema.org", "@graph": [org, web]}
    if clave in ("sobre-nosotros", "proyectos", "contacto"):
        titulo = (leer(ruta_pag[1]) if es else None)
        nombre = META_EN[clave][0].split(" · ")[0] if not es else re.search(r"<title>(.*?) ·", titulo).group(1)
        return {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Inicio" if es else "Home", "item": BASE + ("/" if es else "/en/")},
            {"@type": "ListItem", "position": 2, "name": nombre, "item": BASE + ruta}]}
    return None


def bloque_ld(obj):
    return '<script type="application/ld+json">\n' + json.dumps(obj, ensure_ascii=False, indent=2) + "\n  </script>"


# ---------------------------------------------------------- 1. Páginas en español

def alternates(ruta_es, ruta_en):
    return ('  <link rel="alternate" hreflang="es" href="%s">\n'
            '  <link rel="alternate" hreflang="en" href="%s">\n'
            '  <link rel="alternate" hreflang="x-default" href="%s">\n') % (BASE + ruta_es, BASE + ruta_en, BASE + ruta_es)


def preparar_cabecera(html, ruta_es, ruta_en, lang, clave, es_404=False):
    """hreflang, og:locale y JSON-LD de una página (en el idioma indicado)."""
    html = re.sub(r'[ \t]*<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?', "", html)
    html = re.sub(r'[ \t]*<meta property="og:locale:alternate"[^>]*>\n?', "", html)
    if not es_404:
        html = re.sub(r'(<link rel="canonical" href="[^"]*">\n)', lambda m: m.group(1) + alternates(ruta_es, ruta_en), html, count=1)
    html = re.sub(r'(<meta property="og:locale" content=")[^"]*(">)', lambda m: m.group(1) + ("es_ES" if lang == "es" else "en_GB") + m.group(2), html, count=1)
    html = re.sub(r'(<meta property="og:locale" content="[^"]*">)', lambda m: m.group(1) + '\n  <meta property="og:locale:alternate" content="%s">' % ("en_GB" if lang == "es" else "es_ES"), html, count=1)
    if not es_404:
        ld = json_ld(clave, lang)
        if ld and re.search(r'<script type="application/ld\+json">', html):
            html = re.sub(r'<script type="application/ld\+json">.*?</script>', lambda m: bloque_ld(ld), html, count=1, flags=re.S)
    return html


def construir_es():
    cabecera = leer("partials/header.html").strip()
    pie = leer("partials/footer.html").strip()
    paginas = {}
    for clave, f_es, r_es, f_en, r_en, _ in PAGINAS + [("404", "404.html", None, None, None, None)]:
        html = leer(f_es)
        for nombre, parte in (("header", cabecera), ("footer", pie)):
            bloque = parte
            if nombre == "header":
                if r_es:
                    bloque = bloque.replace('href="/" hreflang="es"', 'href="%s" hreflang="es"' % r_es)
                    bloque = bloque.replace('href="/en/" hreflang="en"', 'href="%s" hreflang="en"' % r_en)
                bloque = bloque.replace('data-nav="%s"' % clave, 'data-nav="%s" aria-current="page"' % clave) if clave != "404" else bloque
            patron = re.compile(r"<!-- layout:%s:start -->.*?<!-- layout:%s:end -->" % (nombre, nombre), re.S)
            nuevo = "<!-- layout:%s:start -->\n%s\n<!-- layout:%s:end -->" % (nombre, bloque, nombre)
            html, n = patron.subn(lambda m: nuevo, html)
            if n == 0:
                avisos.append("%s: no tiene el marcador layout:%s" % (f_es, nombre))
        if r_es:
            html = preparar_cabecera(html, r_es, r_en, "es", clave)
        else:
            html = preparar_cabecera(html, None, None, "es", clave, es_404=True)
        escribir(f_es, html.rstrip("\n") + "\n")
        paginas[clave] = html
    return paginas


# ---------------------------------------------------------- 2. Páginas en inglés

ES_HTML = sorted(ES.get("html", {}).items(), key=lambda kv: -len(kv[1]))


def meta(soup, **atributos):
    return soup.find("meta", attrs=atributos)


def construir_en(clave, html_es, f_en, r_es, r_en):
    soup = BeautifulSoup(html_es, "html.parser")
    titulo, desc = META_EN[clave]

    soup.html["lang"] = "en"
    soup.title.string = titulo
    for etiqueta in (meta(soup, name="description"), meta(soup, property="og:description"), meta(soup, name="twitter:description")):
        if etiqueta is not None:
            etiqueta["content"] = desc
    for etiqueta in (meta(soup, property="og:title"), meta(soup, name="twitter:title")):
        if etiqueta is not None:
            etiqueta["content"] = titulo
    canon = soup.find("link", rel="canonical")
    if canon is not None:
        canon["href"] = BASE + r_en
    og_url = meta(soup, property="og:url")
    if og_url is not None:
        og_url["content"] = BASE + r_en

    # data-i18n → texto en inglés
    for el in soup.select("[data-i18n]"):
        valor = buscar(EN, el["data-i18n"])
        if valor is None:
            avisos.append("%s: falta la clave inglesa %s" % (f_en, el["data-i18n"]))
            continue
        el.clear()
        el.append(NavigableString(valor))
    for atributo, destino in (("data-i18n-aria-label", "aria-label"), ("data-i18n-alt", "alt"), ("data-i18n-placeholder", "placeholder")):
        for el in soup.select("[%s]" % atributo):
            valor = buscar(EN, el[atributo])
            if valor is None:
                avisos.append("%s: falta la clave inglesa %s" % (f_en, el[atributo]))
                continue
            el[destino] = valor

    # bloques legales (coincidencia exacta con el texto español de data/textos.json)
    cuerpo = soup.find("main")
    if cuerpo is not None and ES_HTML:
        for el in cuerpo.find_all(["p", "li"]):
            interior = norm(el.decode_contents())
            cambiado = interior
            for k, texto_es in ES_HTML:
                t = norm(texto_es)
                if t and t in cambiado:
                    cambiado = cambiado.replace(t, norm(EN["html"][k]))
            if cambiado != interior:
                el.clear()
                el.append(BeautifulSoup(cambiado, "html.parser"))
        if clave in ("aviso-legal", "politica-privacidad"):
            ultimo = [p for p in cuerpo.find_all("p") if p.get_text(strip=True).startswith("Last updated")]
            if ultimo:
                nota = soup.new_tag("p")
                if ultimo[0].get("class"):
                    nota["class"] = ultimo[0]["class"]
                nota.string = "In case of any discrepancy between the two versions, the Spanish version prevails."
                ultimo[0].insert_after(nota)

    # textos fijos de las plantillas
    for el in soup.find_all(True):
        for atributo in ("aria-label", "alt", "title"):
            valor = el.get(atributo)
            if valor in ATRIBUTOS_EN:
                el[atributo] = ATRIBUTOS_EN[valor]
    for nodo in soup.find_all(string=re.compile(r"Todos los derechos reservados")):
        nodo.replace_with(nodo.replace("Todos los derechos reservados.", EN["footer"]["derechos"]))

    # enlaces internos → versión inglesa
    for a in soup.find_all("a", href=True):
        if "idioma-btn" in (a.get("class") or []):
            continue  # el selector de idioma apunta a cada versión; no se toca
        destino, _, ancla = a["href"].partition("#")
        if destino in RUTAS_EN:
            a["href"] = RUTAS_EN[destino] + ("#" + ancla if ancla else "")
    # selector de idioma: ahora es EN la página actual
    for a in soup.select("a.idioma-btn"):
        if a.get("data-idioma") == "en":
            a["aria-current"] = "true"
        elif "aria-current" in a.attrs:
            del a["aria-current"]
    # datos estructurados y hreflang
    for s in soup.find_all("script", type="application/ld+json"):
        ld = json_ld(clave, "en")
        if ld:
            s.string = "\n" + json.dumps(ld, ensure_ascii=False, indent=2) + "\n  "
    og = meta(soup, property="og:locale")
    if og is not None:
        og["content"] = "en_GB"
    og_alt = meta(soup, property="og:locale:alternate")
    if og_alt is not None:
        og_alt["content"] = "es_ES"
    texto = str(soup)
    escribir(f_en, texto.rstrip("\n") + "\n")
    return texto


# --------------------------------------------- comprobación: ¿queda español en /en/?

PALABRAS_ES = re.compile(r"\b(de|la|el|los|las|que|para|con|por|una|del|nos|tu|tus|su|sus|más|como|pero|también|sobre|está|son|y|inicio|proyectos?|contacto|nosotros|escríbenos|aviso)\b|[áéíóúñ¿¡]", re.I)


FRAGMENTOS_MARCA = {"De Personas", "a Personas", "De Personas a Personas", "DPAP", "ES", "EN", "html"}


def es_eslogan(t):
    """El eslogan no se traduce: se acepta con o sin comillas y punto final."""
    return t.strip("«»“”\".· ").lower() == ESLOGAN.lower()


def textos_de(html):
    soup = BeautifulSoup(html, "html.parser")
    for s in soup(["script", "style"]):
        s.decompose()
    return [norm(str(n)) for n in soup.find_all(string=True) if type(n).__name__ != "Comment" and norm(str(n))]


def revisar_espanol(f_en, html, html_es):
    # 1) textos idénticos al español (salvo marca, eslogan, cifras, correos…)
    originales = set(textos_de(html_es))
    for t in textos_de(html):
        if t in originales and t not in FRAGMENTOS_MARCA and not es_eslogan(t) and re.search(r"[A-Za-zÀ-ÿ]{4,}", t) and not re.search(r"[@/]", t):
            avisos.append("%s → idéntico al español (¿sin traducir?): %s" % (f_en, t[:80]))
    soup = BeautifulSoup(html, "html.parser")
    for s in soup(["script", "style"]):
        s.decompose()
    hallazgos = []

    def limpio(t):
        t = t.replace(NOMBRE, "").replace(ESLOGAN, "")
        return re.sub(r"\S*[@/]\S*", "", t)

    for nodo in soup.find_all(string=True):
        t = limpio(str(nodo)).strip()
        if t and t not in FRAGMENTOS_MARCA and type(nodo).__name__ != "Comment" and PALABRAS_ES.search(t):
            hallazgos.append("texto: " + t[:80])
    for el in soup.find_all(True):
        for a in ("aria-label", "alt", "title", "placeholder", "content"):
            v = el.get(a)
            if isinstance(v, str) and PALABRAS_ES.search(limpio(v)) and el.name != "meta":
                hallazgos.append("%s=«%s»" % (a, v[:70]))
    for h in dict.fromkeys(hallazgos):
        avisos.append("%s → posible español sin traducir: %s" % (f_en, h))


# ------------------------------------------------------- 4. sitemap y diccionario

def escribir_sitemap():
    filas = ['<?xml version="1.0" encoding="UTF-8"?>',
             "<!-- sitemap.xml — lo genera tools/construir.py. Si cambias de dominio, cambia BASE en ese script y vuelve a ejecutarlo. -->",
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for _, _, r_es, _, r_en, prioridad in PAGINAS:
        for ruta in (r_es, r_en):
            filas.append("  <url>")
            filas.append("    <loc>%s</loc>" % (BASE + ruta))
            filas.append("    <lastmod>%s</lastmod>" % FECHA)
            filas.append("    <priority>%s</priority>" % prioridad)
            filas.append('    <xhtml:link rel="alternate" hreflang="es" href="%s"/>' % (BASE + r_es))
            filas.append('    <xhtml:link rel="alternate" hreflang="en" href="%s"/>' % (BASE + r_en))
            filas.append('    <xhtml:link rel="alternate" hreflang="x-default" href="%s"/>' % (BASE + r_es))
            filas.append("  </url>")
    filas.append("</urlset>")
    escribir("sitemap.xml", "\n".join(filas))


def incrustar_diccionario():
    sin_html = {idioma: {k: v for k, v in grupo.items() if k != "html"} for idioma, grupo in TEXTOS.items()}
    js = leer("assets/js/idiomas.js")
    nuevo = "/*TEXTOS:inicio*/\n  var TEXTOS = %s;\n  /*TEXTOS:fin*/" % json.dumps(sin_html, ensure_ascii=False, separators=(",", ":"))
    js, n = re.subn(r"/\*TEXTOS:inicio\*/.*?/\*TEXTOS:fin\*/", lambda m: nuevo, js, flags=re.S)
    if n == 0:
        avisos.append("idiomas.js: faltan los marcadores TEXTOS:inicio / TEXTOS:fin")
    escribir("assets/js/idiomas.js", js)


def main():
    paginas = construir_es()
    for clave, f_es, r_es, f_en, r_en, _ in PAGINAS:
        html_en = construir_en(clave, paginas[clave], f_en, r_es, r_en)
        revisar_espanol(f_en, html_en, paginas[clave])
        print("OK", f_es, "→", f_en)
    escribir_sitemap()
    incrustar_diccionario()
    print("OK sitemap.xml y assets/js/idiomas.js")
    if avisos:
        print("\nAVISOS (%d):" % len(avisos))
        for a in avisos:
            print(" -", a)
    else:
        print("\nSin avisos: no queda español sin traducir en /en/.")


if __name__ == "__main__":
    main()
