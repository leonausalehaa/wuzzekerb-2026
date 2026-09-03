# Wuzzekerb 2026 – Cloudflare V5

Diese Version ersetzt Netlify durch Cloudflare Pages Functions.

## Struktur
- `public/` – öffentliche App
- `functions/api/` – Cloudflare Pages Functions
- Workers KV Binding: `WUZZE_KV`
- R2 Binding: `WUZZE_PHOTOS`

## Erforderliche Variablen / Secrets
- `TEAM_PIN`
- `ADMIN_PIN`
- optional für Push:
  - `VAPID_PUBLIC_KEY`
  - `VAPID_PRIVATE_KEY`
  - `VAPID_SUBJECT`

## Cloudflare Pages
Produktions-Branch: `main`
Build command: `exit 0`
Build output directory: `public`

## Bindings
Unter Settings > Bindings:
- KV namespace mit Variablenname `WUZZE_KV`
- R2 bucket mit Variablenname `WUZZE_PHOTOS`

## Hinweis zur Migration
Bestehende Netlify-Blob-Daten werden nicht automatisch übernommen. Der in V5 fest hinterlegte
Kerbeborsch-Terminplan wird beim ersten Aufruf automatisch in KV angelegt. Neue Aufgaben,
Dienste, Status, News und Fotos werden anschließend in Cloudflare gespeichert.

## Geschützter Team-Bereich
- Der Team-Bereich wird mit dem Secret `TEAM_PIN` entsperrt.
- Der PIN bleibt nur für die aktuelle Browsersitzung in `sessionStorage` gespeichert.
- Sämtliche Team-APIs einschließlich des Auf-/Abbauplans erwarten den Header `x-team-pin`.
- Der Aufbauplan liegt nicht mehr als öffentlich abrufbare Datei unter `public/`.
