#!/usr/bin/env python3
"""Vuelve a inyectar partials/header.html y partials/footer.html dentro de cada .html.

El encabezado y el pie van escritos directamente en el HTML (entre los marcadores
<!-- layout:header:start --> ... <!-- layout:header:end -->) para que los buscadores y
cualquier lector vean la navegación sin ejecutar JavaScript. Si editas los archivos de
partials/, ejecuta desde la raíz del proyecto:   python tools/inyectar-layout.py
"""
import glob, re, io

def leer(ruta):
    with io.open(ruta, encoding="utf-8-sig", newline="") as f:
        return f.read().replace("\r\n", "\n").strip()

PARTES = {"header": leer("partials/header.html"), "footer": leer("partials/footer.html")}

for pagina in sorted(glob.glob("*.html")):
    html = leer(pagina)
    clave = re.search(r'data-pagina="([^"]*)"', html)
    clave = clave.group(1) if clave else ""
    for nombre, parte in PARTES.items():
        bloque = parte
        if nombre == "header" and clave:
            bloque = bloque.replace('data-nav="%s"' % clave, 'data-nav="%s" aria-current="page"' % clave)
        patron = re.compile(r"<!-- layout:%s:start -->.*?<!-- layout:%s:end -->" % (nombre, nombre), re.S)
        nuevo = "<!-- layout:%s:start -->\n%s\n<!-- layout:%s:end -->" % (nombre, bloque, nombre)
        html, n = patron.subn(lambda m: nuevo, html)
        if n == 0:
            print("  (sin marcador %s en %s)" % (nombre, pagina))
    with io.open(pagina, "w", encoding="utf-8", newline="\n") as f:
        f.write(html + "\n")
    print("OK", pagina)
