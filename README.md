# Wuzzekerb Altenhain 2026 – Netlify App

Enthalten: Start/Countdown, komplettes Programm mit ICS, schematischer Lageplan, echte Web-Push-Abos, Push-News, moderierte Besucher-Fotogalerie und Adminbereich.

## Veröffentlichung auf Netlify
1. Projektordner **entpackt** in ein Git-Repository legen und mit Netlify verbinden. Für Functions + npm-Abhängigkeiten ist Git/CLI zuverlässiger als ein reiner Einzeldatei-Drop.
2. Netlify erkennt `netlify.toml`, installiert die Abhängigkeiten aus `package.json` und deployt `netlify/functions`.
3. Unter **Project configuration → Environment variables** setzen:
   - `ADMIN_PIN` = eure geheime Admin-PIN
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` = z. B. `mailto:info@altenhainer-kerbeverein.de`
4. VAPID-Schlüssel lokal erzeugen: `npm install` und danach `node generate-vapid.mjs`.
5. Neu deployen.

## Admin öffnen
In der veröffentlichten App `#admin` an die URL hängen, z. B. `https://DEINNAME.netlify.app/#admin`.

## Fotos
Besucher können JPG/PNG/WebP bis 5 MB einreichen. Die Datei landet in Netlify Blobs, ist zunächst `pending` und wird erst nach Freigabe im Adminbereich öffentlich in der Galerie angezeigt.

## Lageplan
Der enthaltene Lageplan ist absichtlich schematisch. Vor Veröffentlichung bitte die Positionen von Zelt, Bühne, Getränken, Essen, WC, Eingang und Erste Hilfe an euren tatsächlichen Aufbau anpassen.
