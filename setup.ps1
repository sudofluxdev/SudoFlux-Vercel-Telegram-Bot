# BotSudo V1.0 - Automation Setup Script

Write-Host "🛰️ BotSudo Hyper-Core - Initializing Setup..." -ForegroundColor Cyan

# 1. Check for Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "✅ Node.js detected: $(node -v)" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install it from https://nodejs.org/" -ForegroundColor Red
    exit
}

# 2. Install Dependencies
Write-Host "📦 Installing dependencies (npm install)..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully." -ForegroundColor Green
} else {
    Write-Host "❌ Error installing dependencies." -ForegroundColor Red
    exit
}

# 3. Environment Variable Template
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env template..." -ForegroundColor Yellow
    $envContent = @"
TELEGRAM_BOT_TOKEN=""
FIREBASE_SERVICE_ACCOUNT_KEY='{}'
X-Telegram-Bot-Api-Secret-Token="SUDO_FLUX_SECURE_TOKEN_$(Get-Random)"
"@
    $envContent | Out-File -FilePath .env -Encoding utf8
    Write-Host "✅ .env file created. Please fill it with your credentials." -ForegroundColor Green
}

Write-Host "`n🚀 Setup Complete!" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. Fill the .env file with your Telegram and Firebase keys." -ForegroundColor White
Write-Host "2. Run 'npm run dev' to start locally." -ForegroundColor White
Write-Host "3. Deploy to Vercel for production." -ForegroundColor White
Write-Host "`nHappy Botting! 🛰️" -ForegroundColor Cyan
