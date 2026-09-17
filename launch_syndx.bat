
@echo off
title synDx Production and Clinical ML Platform
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch_syndx.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Launcher encountered an issue. Please review the output above.
    pause
)

