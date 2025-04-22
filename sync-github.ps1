# Script para sincronização rápida com GitHub
# Para uso após configuração inicial

$commitMessage = Read-Host "Digite uma mensagem para o commit (ou pressione Enter para mensagem padrão)"
if ([string]::IsNullOrEmpty($commitMessage)) {
    $commitMessage = "Atualização do projeto $(Get-Date -Format 'dd/MM/yyyy HH:mm')"
}

Write-Host "Adicionando arquivos modificados..." -ForegroundColor Cyan
git add .

Write-Host "Commitando alterações: '$commitMessage'" -ForegroundColor Cyan
git commit -m "$commitMessage"

Write-Host "Enviando para GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Sincronização com GitHub concluída com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro na sincronização. Tente usar o script upload-to-github.ps1" -ForegroundColor Red
}

Write-Host "`nPressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
