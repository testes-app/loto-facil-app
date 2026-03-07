@echo off
title LotoMatrix - Inicialização Automática
echo ==========================================
echo       INICIANDO LOTOMATRIX SUPER APP
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/2] Iniciando Servidor Python...
start /min cmd /c "python serve_app.py"

echo [2/2] Abrindo Dashboard no Navegador...
timeout /t 3 >nul
start http://localhost:8000/super_app/index.html

echo.
echo ==========================================
echo   PRONTO! O Dashboard ja deve estar aberto.
echo   Nao feche a janela do Python (minimizada).
echo ==========================================
pause
