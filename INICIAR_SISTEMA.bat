@echo off
chcp 65001 >nul
title MIMPO - Panel de Facturas | Iniciando...
color 0A

echo.
echo  ===================================================================
echo    MIMPO ? Panel de Facturas y Equipos - Global Logistics v1.0
echo  ===================================================================
echo.

:: --- PASO 0: Matar procesos previos en los puertos 5000 y 5173 ---
echo  [1/5] Limpiando procesos anteriores en puertos 5000 y 5173...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 1 /nobreak >nul
echo     OK - Puertos liberados.
echo.

:: --- PASO 1: Verificar Python ---
echo  [2/5] Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Python no encontrado. Instala Python 3.8+
    echo          desde https://www.python.org/downloads/
    echo          Marca "Add Python to PATH" durante la instalacion.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo     OK - %%v detectado.
echo.

:: --- PASO 2: Verificar Node.js ---
echo  [3/5] Verificando Node.js / npm...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  [ERROR] Node.js no encontrado. Instala desde https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version 2^>^&1') do echo     OK - Node %%v detectado.
for /f "tokens=*" %%v in ('npm --version 2^>^&1') do echo     OK - npm  %%v detectado.
echo.

:: --- PASO 3: Instalar dependencias Python (si faltan) ---
echo  [4/5] Verificando dependencias Python (Flask, pyodbc, pandas...)
python -c "import flask, flask_cors, pyodbc, pandas, openpyxl" >nul 2>&1
if %errorlevel% neq 0 (
    echo     Instalando dependencias Python, por favor espera...
    python -m pip install flask flask-cors pyodbc pandas openpyxl --quiet
    if %errorlevel% neq 0 (
        echo  [ERROR] Fallo la instalacion de dependencias Python.
        echo          Corre manualmente: pip install flask flask-cors pyodbc pandas openpyxl
        pause
        exit /b 1
    )
    echo     OK - Dependencias Python instaladas.
) else (
    echo     OK - Dependencias Python ya instaladas.
)
echo.

:: --- PASO 4: Instalar dependencias Node (si faltan) ---
echo  [5/5] Verificando dependencias Node (React, Vite...)
if not exist "mi-frontend\node_modules" (
    echo     Instalando node_modules en mi-frontend, por favor espera...
    pushd mi-frontend
    npm install
    if %errorlevel% neq 0 (
        echo  [ERROR] Fallo la instalacion de dependencias Node.
        echo          Corre manualmente: cd mi-frontend ^&^& npm install
        popd
        pause
        exit /b 1
    )
    popd
    echo     OK - Dependencias Node instaladas.
) else (
    echo     OK - node_modules ya existe.
)
echo.

:: --- INICIO DE SERVICIOS ---
echo  -------------------------------------------------------------------
echo   Arrancando servicios...
echo  -------------------------------------------------------------------
echo.

:: Iniciar Backend Flask en ventana separada
echo  - Backend Flask  -> http://localhost:5000
start "MIMPO Backend (Flask)" cmd /k "title MIMPO Backend ^| Flask:5000 && color 0B && python app.py"

:: Esperar a que Flask arranque completamente
timeout /t 3 /nobreak >nul

:: Iniciar Frontend Vite en ventana separada
:: (Vite esta configurado para abrir el navegador automaticamente al puerto 5173)
echo  - Frontend React -> http://localhost:5173
start "MIMPO Frontend (React)" cmd /k "title MIMPO Frontend ^| Vite:5173 && color 0D && cd mi-frontend && npm run dev"

echo.
echo  -------------------------------------------------------------------
echo   Esperando que el frontend arranque (puede tardar 5-10 segundos)...
echo   El navegador se abrira automaticamente.
echo  -------------------------------------------------------------------
echo.
echo   Si el navegador NO abre, ve manualmente a:
echo     http://localhost:5173
echo.
echo  Para DETENER el sistema, cierra las dos ventanas negras:
echo    "MIMPO Backend (Flask)"  y  "MIMPO Frontend (React)"
echo  -------------------------------------------------------------------
echo.
pause
