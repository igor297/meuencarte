@echo off
echo Limpando cache e reiniciando servidor...

:: Parar quaisquer processos Node.js rodando na porta 3000
FOR /F "tokens=5" %%P IN ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') DO (
  echo Encerrando processo: %%P
  taskkill /PID %%P /F
)

:: Remover arquivos temporários
if exist "temp_pdf.html" del "temp_pdf.html"

:: Limpar o cache do node
echo Limpando cache do Node...
npx rimraf node_modules/.cache

:: Instruções para o usuário
echo.
echo [IMPORTANTE] Antes de continuar:
echo 1. Abra seu navegador e pressione Ctrl+Shift+Delete
echo 2. Selecione "Imagens e arquivos em cache" e limpe-os
echo 3. Feche todas as guias onde o projeto estava aberto
echo.
echo Pressione qualquer tecla para iniciar o servidor...
pause > nul

:: Iniciar o servidor
echo Iniciando servidor...
node server.js
