# Script PowerShell para preparar e enviar o projeto para GitHub
# Criado para o projeto MeuEncarte - Versão sem token

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
$branch = "main"  # ou "master" se o repositório usar o branch master como padrão
$commitMessage = "Versão inicial do sistema de encarte"

# Pergunta ao usuário nome e email para configuração do Git
$gitUserName = Read-Host "Digite seu nome para a configuração do Git"
$gitEmail = Read-Host "Digite seu email para a configuração do Git"

# Configura o Git com as informações do usuário
Write-Host "Configurando Git..." -ForegroundColor Cyan
git config --global user.name "$gitUserName"
git config --global user.email "$gitEmail"

# Navega para o diretório do projeto
Set-Location -Path "c:\Users\HP\Documents\meuencarte2"

# Exclui a pasta .git se já existir
if (Test-Path ".git") {
    Write-Host "Removendo configuração Git existente..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".git"
}

# Inicializa um novo repositório Git
Write-Host "Inicializando repositório Git..." -ForegroundColor Cyan
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

# Adiciona todos os arquivos ao Git
Write-Host "Adicionando arquivos ao repositório..." -ForegroundColor Cyan
git add .

# Commita as mudanças
Write-Host "Commitando arquivos..." -ForegroundColor Cyan
git commit -m "$commitMessage"

# Configura o remote origin
Write-Host "Configurando remote origin para $repoUrl" -ForegroundColor Cyan
git remote add origin $repoUrl

# Configura o branch principal
Write-Host "Configurando branch para $branch" -ForegroundColor Cyan
git branch -M $branch

# Tenta fazer push para o repositório remoto
try {
    Write-Host "Enviando arquivos para GitHub..." -ForegroundColor Cyan
    
    # Usa a autenticação padrão configurada no sistema
    # Isso usará credenciais armazenadas ou SSH, se configurado
    git push -u origin $branch
    
    Write-Host "Projeto enviado com sucesso para o GitHub!" -ForegroundColor Green
    Write-Host "Acesse seu repositório em: https://github.com/igor297/meuencarte" -ForegroundColor Green
} catch {
    Write-Host "Ocorreu um erro ao fazer push para o GitHub: $_" -ForegroundColor Red
    
    Write-Host @"

Se o GitHub pedir credenciais durante o push, você tem algumas opções:

1. Use seu nome de usuário GitHub e a senha (ou token pessoal se 2FA estiver ativado)
2. Configure a credencial manager do Git:
   git config --global credential.helper manager

Se o repositório já existir com conteúdo, pode ser necessário um merge ou force push:
3. Para fazer merge: git pull origin $branch --allow-unrelated-histories
4. Para forçar push (cuidado!): git push -f origin $branch

Para configurar SSH e evitar inserir senha (recomendado):
5. Gere uma chave SSH: ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
6. Adicione ao GitHub: https://github.com/settings/keys
7. Mude o remote: git remote set-url origin git@github.com:igor297/meuencarte.git

"@ -ForegroundColor Yellow
}

Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
