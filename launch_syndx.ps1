# synDx Clinical Platform Launcher (PowerShell)
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                 synDx CLINICAL PLATFORM LAUNCHER" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

$PythonExe = Join-Path $ScriptDir ".venv\Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    Write-Error "[ERROR] Python virtual environment not found at $PythonExe"
    exit 1
}

# 1. Check if FastAPI ML Microservice is already running
$FastApiRunning = $false
try {
    $res = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -TimeoutSec 1 -ErrorAction Stop
    if ($res.status -eq "healthy") {
        $FastApiRunning = $true
        Write-Host "[+] Clinical ML Microservice (FastAPI Port 8000) is already active." -ForegroundColor Green
    }
} catch {}

if (-not $FastApiRunning) {
    Write-Host "[*] Launching Clinical ML Microservice (FastAPI Port 8000)..." -ForegroundColor Yellow
    $FastApiProcess = Start-Process -FilePath $PythonExe -ArgumentList "-m uvicorn pipeline.clinical_service:app --host 127.0.0.1 --port 8000" -PassThru
    Write-Host "[+] Clinical ML Microservice started (PID: $($FastApiProcess.Id))." -ForegroundColor Green
    Start-Sleep -Seconds 3
}

# 2. Check active port & check if Express is already running
$PortFile = Join-Path $ScriptDir ".active_port"
$Port = 3050
if (Test-Path $PortFile) {
    $SavedPort = Get-Content $PortFile -ErrorAction SilentlyContinue
    if ($SavedPort -match '^\d+$') {
        $Port = [int]$SavedPort
    }
}

$ExpressRunning = $false
try {
    $res = Invoke-RestMethod -Uri "http://localhost:$Port/api/health" -TimeoutSec 1 -ErrorAction Stop
    if ($res.status -eq "online") {
        $ExpressRunning = $true
        Write-Host "[+] synDx Web Server (Port $Port) is already active." -ForegroundColor Green
    }
} catch {}

if (-not $ExpressRunning) {
    Write-Host "[*] Launching Express Production Server..." -ForegroundColor Yellow
    $ExpressProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru
    Write-Host "[+] Express Production Server started (PID: $($ExpressProcess.Id))." -ForegroundColor Green
    Start-Sleep -Seconds 2
    if (Test-Path $PortFile) {
        $SavedPort = Get-Content $PortFile -ErrorAction SilentlyContinue
        if ($SavedPort -match '^\d+$') {
            $Port = [int]$SavedPort
        }
    }
}

Write-Host "[*] Opening synDx Doctor Review Console..." -ForegroundColor Green
Start-Process "http://localhost:$Port/index.html"

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "[OK] synDx Platform is running!" -ForegroundColor Green
Write-Host "  - Web Doctor Review Console : http://localhost:$Port/index.html"
Write-Host "  - Express Backend API       : http://localhost:$Port/api/health"
Write-Host "  - Clinical ML Microservice  : http://localhost:8000/api/health"
Write-Host "  - Swagger API Docs          : http://localhost:8000/docs"
Write-Host "======================================================================" -ForegroundColor Green


