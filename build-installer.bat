@echo off
echo ========================================
echo BtwBuddy Installer Builder
echo ========================================
echo.

echo Stap 1: Dependencies installeren...
call npm install
if %errorlevel% neq 0 (
    echo Fout bij installeren van dependencies!
    pause
    exit /b 1
)

echo.
echo Stap 2: Applicatie bouwen...
call npm run build
if %errorlevel% neq 0 (
    echo Fout bij bouwen van applicatie!
    pause
    exit /b 1
)

echo.
echo Stap 3: Windows installer maken...
call npm run dist:win
if %errorlevel% neq 0 (
    echo Fout bij maken van installer!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installer succesvol gemaakt!
echo ========================================
echo.
echo De installer vind je in de 'release' map:
echo - BtwBuddy-Setup-1.0.0.exe
echo.
echo Deze installer bevat:
echo - Desktop shortcut
echo - Start menu shortcut
echo - Professionele installatie wizard
echo - Automatische uninstaller
echo.
pause 