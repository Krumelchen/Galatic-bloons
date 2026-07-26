# Galactic Bloons – Deploy Script
#===============================
# 1. Dieses Skript pushed alle Änderungen zu GitHub
# 2. Render.com erkennt das und deployed automatisch neu
# 3. Nach ~2 Minuten ist dein Spiel live!
#===============================

$REPO_NAME = "galactic-bloons"
$GITHUB_USER = Read-Host "Gib deinen GitHub-Benutzernamen ein"

Write-Host "`n=== Schritt 1: Repository initialisieren ===" -ForegroundColor Cyan
git init
git branch -M main

# Prüfen ob Remote schon existiert
$remote = git remote get-url origin 2>$null
if (-not $remote) {
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
    Write-Host "Remote hinzugefügt: origin → $GITHUB_USER/$REPO_NAME" -ForegroundColor Green
} else {
    Write-Host "Remote existiert bereits: $remote" -ForegroundColor Yellow
}

Write-Host "`n=== Schritt 2: Dateien committen ===" -ForegroundColor Cyan
git add -A
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
git commit -m "Auto-Update $timestamp"

Write-Host "`n=== Schritt 3: Zu GitHub pushen ===" -ForegroundColor Cyan
Write-Host "Jetzt musst du dich bei GitHub anmelden." -ForegroundColor Yellow
Write-Host "Ein Browser-Fenster öffnet sich für die Anmeldung." -ForegroundColor Yellow
Write-Host "`nAlternativ: Git Credential Manager fragt nach Login." -ForegroundColor Yellow

try {
    git push -u origin main
    Write-Host "`n✅ Erfolgreich zu GitHub gepusht!" -ForegroundColor Green
    Write-Host "⏳ Render.com startet automatisch das Deployment..." -ForegroundColor Cyan
    Write-Host "🌐 Nach ~2 Minuten live unter: https://$REPO_NAME.onrender.com" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Fehler beim Pushen!" -ForegroundColor Red
    Write-Host "Mögliche Lösungen:" -ForegroundColor Yellow
    Write-Host "1. Repository auf GitHub erstellen: github.com/new → Name: $REPO_NAME" -ForegroundColor White
    Write-Host "2. Token erstellen: GitHub → Settings → Developer Settings → Personal Access Tokens" -ForegroundColor White
    Write-Host "3. Dann ausführen: git remote set-url origin https://TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git" -ForegroundColor White
    Write-Host "4. Und dann dieses Skript nochmal ausführen" -ForegroundColor White
}

Read-Host "`nEnter drücken zum Beenden"
