# Wuzzekerb-App mit Team-PIN veröffentlichen

## 1. TEAM_PIN in Cloudflare kontrollieren

1. Cloudflare Dashboard öffnen.
2. **Workers & Pages** auswählen.
3. Das Projekt **wuzzekerb-2026** öffnen.
4. **Settings** öffnen und als Umgebung **Production** auswählen.
5. Unter **Variables and secrets** muss `TEAM_PIN` als **Secret** vorhanden angelegt sein.
6. Falls nötig, den gewünschten PIN eintragen und speichern.
7. Unter **Bindings** kontrollieren, dass `WUZZE_KV` als KV Namespace verbunden ist.

## 2. Dateien bei GitHub ersetzen

Die ZIP-Datei entpacken. Anschließend im GitHub-Repository `wuzzekerb-2026` die Dateien aus
dem entpackten Ordner hochladen. Die Ordnerstruktur `public/` und `functions/api/` muss erhalten
bleiben. Die alte Datei `public/team-tasks.json` muss gelöscht werden, da der Aufbauplan jetzt
geschützt über `functions/api/team-build-plan.js` ausgegeben wird.

Geänderte oder neue Dateien:

- `public/app.js`
- `public/index.html`
- `public/styles.css`
- `public/sw.js`
- `functions/api/_lib.js`
- `functions/api/team-dates-live.js`
- `functions/api/team-build-plan.js`
- `functions/api/_team-build-plan.js`
- `README-CLOUDFLARE.md`

## 3. Deployment prüfen

1. In Cloudflare das Projekt **wuzzekerb-2026** öffnen.
2. **Deployments** auswählen.
3. Warten, bis das neue Deployment den Status **Success** hat.
4. Falls kein automatisches Deployment startet, beim letzten Deployment über das Menü
   **Retry deployment** auswählen.

## 4. Zugang testen

1. App in einem privaten Browserfenster öffnen.
2. **TEAM** auswählen.
3. Ohne PIN darf der interne Inhalt nicht sichtbar sein.
4. Einen falschen PIN eingeben: Es muss **Team-PIN falsch** erscheinen.
5. Den richtigen `TEAM_PIN` eingeben: Aufbauplan, Termine, Dienste, Aufgaben und
   „Wo muss ich wann sein?“ müssen geladen werden.
6. **Abmelden** auswählen: Der interne Bereich muss wieder gesperrt werden.

Der PIN wird nur im `sessionStorage` des Browsers gespeichert und nicht in den öffentlichen
App-Dateien hinterlegt.
