# Script para instalar todas as dependências necessárias para o MeuEncarte

Write-Host "📦 Instalando dependências do projeto MeuEncarte..." -ForegroundColor Cyan

# Verifica se o Node.js está instalado
try {
    $nodeVersion = node -v
    Write-Host "✓ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não está instalado. Por favor, instale-o de https://nodejs.org/" -ForegroundColor Red
    exit
}

# Verificar se o npm está instalado
try {
    $npmVersion = npm -v
    Write-Host "✓ NPM detectado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ NPM não está instalado corretamente." -ForegroundColor Red
    exit
}

# Remover a pasta node_modules se existir para instalação limpa
if (Test-Path "node_modules") {
    Write-Host "🗑️ Removendo node_modules existente para instalação limpa..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
}

# Remover o arquivo package-lock.json
if (Test-Path "package-lock.json") {
    Write-Host "🗑️ Removendo package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Force "package-lock.json"
}

# Instalar pacotes principais
Write-Host "📥 Instalando dependências do projeto..." -ForegroundColor Cyan
npm install express body-parser cors

# Instalar o Puppeteer (pode demorar um pouco)
Write-Host "📥 Instalando Puppeteer para geração de PDF (pode demorar alguns minutos)..." -ForegroundColor Cyan
npm install puppeteer@21.5.1

# Instalar nodemon como dependência de desenvolvimento
Write-Host "📥 Instalando nodemon para desenvolvimento..." -ForegroundColor Cyan
npm install --save-dev nodemon

# Verificar se todas as dependências foram instaladas corretamente
Write-Host "🔍 Verificando instalações..." -ForegroundColor Cyan

$dependencies = @("express", "body-parser", "cors", "puppeteer")
$devDependencies = @("nodemon")

$problemaEncontrado = $false

foreach ($dep in $dependencies) {
    $modulePath = "node_modules/$dep"
    if (Test-Path $modulePath) {
        Write-Host "✓ $dep instalado com sucesso" -ForegroundColor Green
    } else {
        Write-Host "❌ $dep não foi instalado corretamente" -ForegroundColor Red
        $problemaEncontrado = $true
    }
}

foreach ($dep in $devDependencies) {
    $modulePath = "node_modules/$dep"
    if (Test-Path $modulePath) {
        Write-Host "✓ $dep instalado com sucesso (dev)" -ForegroundColor Green
    } else {
        Write-Host "❌ $dep não foi instalado corretamente (dev)" -ForegroundColor Red
        $problemaEncontrado = $true
    }
}

if ($problemaEncontrado) {
    Write-Host "⚠️ Alguns pacotes não foram instalados corretamente. Tente executar 'npm install' manualmente." -ForegroundColor Yellow
} else {
    Write-Host "✅ Todas as dependências foram instaladas com sucesso!" -ForegroundColor Green
}

Write-Host "`n🚀 Próximos passos:`n" -ForegroundColor Cyan
Write-Host "1. Execute 'npm start' para iniciar o servidor"
Write-Host "2. Acesse o aplicativo em http://localhost:3000"
Write-Host "3. Para desenvolvimento com recarga automática, use 'npm run dev'"

Write-Host "`nPressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
