# Script PowerShell para preparar e enviar o projeto para GitHub
# Versão aprimorada com tratamento de erros de push

# Verifica se o Git está instalado
try {
    $gitVersion = git --version
    Write-Host "Git detectado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git não está instalado ou não está no PATH. Por favor, instale Git de https://git-scm.com/downloads" -ForegroundColor Red
    exit
}

# Configurações do repositório
$repoUrl = "https://github.com/igor297/meuencarte.git"
$branch = "main"
$commitMessage = "Atualização do sistema de encarte"

# Pergunta ao usuário nome e email para configuração do Git
$gitUserName = Read-Host "Digite seu nome para a configuração do Git"
$gitEmail = Read-Host "Digite seu email para a configuração do Git"

# Configura o Git com as informações do usuário
Write-Host "Configurando Git..." -ForegroundColor Cyan
git config --global user.name "$gitUserName"
git config --global user.email "$gitEmail"

# Navega para o diretório do projeto
Set-Location -Path "c:\Users\HP\Documents\meuencarte2"

# Verifica se já existe um repositório Git
$gitExists = Test-Path ".git"
if (-not $gitExists) {
    # Inicializa um novo repositório Git
    Write-Host "Inicializando novo repositório Git..." -ForegroundColor Cyan
    git init
    
    # Cria um arquivo .gitignore para excluir arquivos desnecessários
    $gitignore = @"
# Dependências
node_modules/
npm-debug.log
yarn-error.log
yarn-debug.log
.pnp/
.pnp.js

# Arquivos temporários
temp_pdf.html
*.tmp
*.temp
.DS_Store
Thumbs.db

# Ambiente
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Ferramentas de desenvolvimento
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# Build e distribuição
dist/
build/
coverage/

# Logs
logs/
*.log
"@

    $gitignore | Out-File -FilePath ".gitignore" -Encoding utf8
    Write-Host "Arquivo .gitignore criado" -ForegroundColor Green
} else {
    Write-Host "Repositório Git existente encontrado." -ForegroundColor Yellow
}

# Adiciona todos os arquivos ao Git
Write-Host "Adicionando arquivos ao repositório..." -ForegroundColor Cyan
git add .

# Commita as mudanças
Write-Host "Commitando arquivos..." -ForegroundColor Cyan
git commit -m "$commitMessage"

# Verifica se o remote origin já está configurado
$remoteExists = git remote -v | Select-String -Pattern "origin"
if (-not $remoteExists) {
    # Configura o remote origin
    Write-Host "Configurando remote origin para $repoUrl" -ForegroundColor Cyan
    git remote add origin $repoUrl
} else {
    Write-Host "Remote origin já está configurado." -ForegroundColor Yellow
}

# Configura o branch principal
Write-Host "Configurando branch para $branch" -ForegroundColor Cyan
git branch -M $branch

# Tenta fazer push para o repositório remoto
try {
    Write-Host "Tentando push normal para GitHub..." -ForegroundColor Cyan
    git push -u origin $branch
    Write-Host "Projeto enviado com sucesso para o GitHub!" -ForegroundColor Green
} catch {
    Write-Host "Push normal falhou. Tentando opções alternativas..." -ForegroundColor Yellow
    
    $choice = Read-Host @"

Escolha uma opção:
1. Pull e depois push (tenta mesclar alterações remotas)
2. Force push (sobrescreve alterações remotas - CUIDADO!)
3. Cancelar

Digite o número da opção
"@

    switch ($choice) {
        "1" {
            Write-Host "Tentando pull e depois push..." -ForegroundColor Cyan
            try {
                git pull --allow-unrelated-histories origin $branch
                git push -u origin $branch
                Write-Host "Merge e push bem-sucedidos!" -ForegroundColor Green
            } catch {
                Write-Host "Falha ao tentar pull e push: $_" -ForegroundColor Red
            }
        }
        "2" {
            Write-Host "ATENÇÃO: Você escolheu force push. Isso sobrescreverá as alterações remotas!" -ForegroundColor Red
            $confirm = Read-Host "Digite 'SIM' para confirmar o force push"
            if ($confirm -eq "SIM") {
                try {
                    git push -f origin $branch
                    Write-Host "Force push concluído com sucesso!" -ForegroundColor Green
                } catch {
                    Write-Host "Falha ao tentar force push: $_" -ForegroundColor Red
                }
            } else {
                Write-Host "Force push cancelado." -ForegroundColor Yellow
            }
        }
        default {
            Write-Host "Operação cancelada." -ForegroundColor Yellow
        }
    }
}

Write-Host "Acesse seu repositório em: https://github.com/igor297/meuencarte" -ForegroundColor Green
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
