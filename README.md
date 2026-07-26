# 🌐 Galactic Bloons – Tower Defense

**BTD6-inspiriertes Tower Defense** – spielbar im Browser!

## 🎮 Features

- 30 Wellen mit 18 Gegnertypen (Red → B.A.D.)
- 8 Tier-Charakter-Türme (🐵🐶🐱🐰🦊🐼🦄🐝)
- Auto-Wave, Speed-Controls (1×/2×/3×)
- Shop mit globalen Upgrades
- 4 verschiedene Maps
- Pause, Sound-Toggle
- Score-System mit Highscore

## 🚀 Deployment (Render.com)

### 1. Repository erstellen
```bash
git init
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/DEIN_USERNAME/galactic-bloons.git
git push -u origin main
```

### 2. Auf Render.com deployen
1. **render.com** → New+ → Static Site
2. GitHub-Repo verbinden
3. Einstellungen:
   - **Name**: `galactic-bloons`
   - **Branch**: `main`
   - **Build Command**: *(leer)*
   - **Publish Directory**: `web/`
4. **Create Static Site**

### 3. Automatische Updates
Einfach `deploy.ps1` ausführen – das pushed alle Änderungen zu GitHub und Render deployed automatisch neu:

```powershell
.\deploy.ps1
```

## 📁 Dateien
- `web/index.html` – Einstiegspunkt
- `web/game.js` – Komplettes Spiel (Canvas)
- `web/style.css` – Mobile-optimiertes Design
- `deploy.ps1` – Auto-Deploy Skript

## 🎯 Spiel starten
`web/index.html` im Browser öffnen (auch lokal möglich!)

- iOS 16+
- Xcode 15+
- Swift 5.9+

## Web Version (No Mac required)

A browser version is available in `web/`.

### Run locally

1. Open a terminal in the repository root.
2. Start a local server:
   - `python -m http.server 8080`
3. Open `http://localhost:8080/web/` in your browser.
4. On iPhone, open the same URL from your local network (same Wi-Fi) and optionally add it to Home Screen.
