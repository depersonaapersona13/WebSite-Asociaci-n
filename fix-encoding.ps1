$files = @('index.html', 'sobre-nosotros.html', 'proyectos.html', 'contacto.html', 'aviso-legal.html', 'politica-privacidad.html', '404.html')
$baseDir = 'c:\Users\Poley\Desktop\Proyectos\deperaper13-web\'

# Build replacements using Unicode escape sequences
$replacements = @{}
$replacements.Add(([char]0x00C2 + [char]0x00B7), [char]0x00B7)  # Â· -> · (middle dot)
$replacements.Add(([char]0x00C3 + [char]0x00B3), [char]0x00F3)  # Ã³ -> ó
$replacements.Add(([char]0x00C3 + [char]0x00B1), [char]0x00F1)  # Ã± -> ñ
$replacements.Add(([char]0x00C3 + [char]0x00A1), [char]0x00E1)  # Ã¡ -> á
$replacements.Add(([char]0x00C3 + [char]0x00A9), [char]0x00E9)  # Ã© -> é
$replacements.Add(([char]0x00C3 + [char]0x00AD), [char]0x00ED)  # Ã­ -> í
$replacements.Add(([char]0x00C3 + [char]0x00BA), [char]0x00FA)  # Ãº -> ú

foreach ($f in $files) {
    $path = $baseDir + $f
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    $original = $content
    foreach ($kvp in $replacements.GetEnumerator()) {
        $content = $content.Replace($kvp.Key, $kvp.Value)
    }
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Fixed mojibake: $f"
    } else {
        Write-Host "No changes needed: $f"
    }
}