# Script para limpar cache e reiniciar o servidor

Write-Host "🧹 Limpando cache e reiniciando servidor..." -ForegroundColor Cyan

# 1. Parar servidor existente (busca todos os processos node que podem estar rodando o server.js)
Write-Host "🛑 Parando servidores existentes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*server.js*"}
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "   Encerrando processo node: $($_.Id)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force
    }
    Write-Host "✓ Processos encerrados" -ForegroundColor Green
} else {
    Write-Host "✓ Nenhum processo node rodando" -ForegroundColor Green
}

# 2. Limpar cache do navegador (por meio de mensagem para o usuário)
Write-Host "🧹 Para certificar-se que o cache do navegador está limpo:" -ForegroundColor Yellow
Write-Host "   - Chrome/Edge: Use Ctrl+Shift+Delete e selecione 'Imagens e arquivos em cache'" -ForegroundColor White
Write-Host "   - Firefox: Use Ctrl+Shift+Delete e selecione 'Cache'" -ForegroundColor White

# 3. Limpar arquivos temporários
if (Test-Path "temp_pdf.html") {
    Write-Host "🗑️ Removendo arquivos temporários..." -ForegroundColor Yellow
    Remove-Item -Force "temp_pdf.html"
}

# 4. Iniciar o servidor com nodemon para desenvolvimento
Write-Host "🚀 Iniciando servidor em modo de desenvolvimento..." -ForegroundColor Cyan
Write-Host "📝 Use Ctrl+C para encerrar o servidor quando necessário" -ForegroundColor White
npx nodemon server.js
