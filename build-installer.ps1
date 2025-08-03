# BtwBuddy Installer Builder - PowerShell Script
# Dit script bouwt een professionele Windows installer voor BtwBuddy

param(
    [switch]$Verbose,
    [switch]$SkipDependencies
)

# Kleuren voor output
$Colors = @{
    Success = "Green"
    Error = "Red"
    Warning = "Yellow"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Colors[$Color]
}

function Write-Header {
    param([string]$Message)
    Write-ColorOutput "`n========================================" $Colors.Header
    Write-ColorOutput $Message $Colors.Header
    Write-ColorOutput "========================================" $Colors.Header
    Write-Host ""
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

# Controleer vereisten
Write-Header "BtwBuddy Installer Builder"
Write-ColorOutput "Controleer vereisten..." $Colors.Info

if (-not (Test-Command "node")) {
    Write-ColorOutput "❌ Node.js is niet geïnstalleerd!" $Colors.Error
    Write-ColorOutput "Download en installeer Node.js van https://nodejs.org/" $Colors.Warning
    exit 1
}

if (-not (Test-Command "npm")) {
    Write-ColorOutput "❌ npm is niet geïnstalleerd!" $Colors.Error
    exit 1
}

Write-ColorOutput "✅ Node.js en npm gevonden" $Colors.Success

# Stap 1: Dependencies installeren
if (-not $SkipDependencies) {
    Write-Header "Stap 1: Dependencies installeren"
    
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "npm install failed"
        }
        Write-ColorOutput "✅ Dependencies succesvol geïnstalleerd" $Colors.Success
    }
    catch {
        Write-ColorOutput "❌ Fout bij installeren van dependencies!" $Colors.Error
        Write-ColorOutput $_.Exception.Message $Colors.Error
        exit 1
    }
}
else {
    Write-ColorOutput "⏭️  Dependencies overslaan (--SkipDependencies gebruikt)" $Colors.Warning
}

# Stap 2: Applicatie bouwen
Write-Header "Stap 2: Applicatie bouwen"

try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "npm run build failed"
    }
    Write-ColorOutput "✅ Applicatie succesvol gebouwd" $Colors.Success
}
catch {
    Write-ColorOutput "❌ Fout bij bouwen van applicatie!" $Colors.Error
    Write-ColorOutput $_.Exception.Message $Colors.Error
    exit 1
}

# Stap 3: Windows installer maken
Write-Header "Stap 3: Windows installer maken"

try {
    npm run dist:win
    if ($LASTEXITCODE -ne 0) {
        throw "npm run dist:win failed"
    }
    Write-ColorOutput "✅ Windows installer succesvol gemaakt" $Colors.Success
}
catch {
    Write-ColorOutput "❌ Fout bij maken van installer!" $Colors.Error
    Write-ColorOutput $_.Exception.Message $Colors.Error
    exit 1
}

# Succes bericht
Write-Header "🎉 Installer succesvol gemaakt!"
Write-ColorOutput "De installer vind je in de 'release' map:" $Colors.Info
Write-ColorOutput "- BtwBuddy-Setup-1.0.0.exe" $Colors.Info

Write-ColorOutput "`nDeze installer bevat:" $Colors.Info
Write-ColorOutput "✅ Desktop shortcut" $Colors.Success
Write-ColorOutput "✅ Start menu shortcut" $Colors.Success
Write-ColorOutput "✅ Professionele installatie wizard" $Colors.Success
Write-ColorOutput "✅ Automatische uninstaller" $Colors.Success
Write-ColorOutput "✅ Nederlandse interface" $Colors.Success

Write-ColorOutput "`nGebruik: Dubbelklik op de .exe om te installeren" $Colors.Info

# Toon bestandslocatie
$ReleasePath = Join-Path $PSScriptRoot "release"
if (Test-Path $ReleasePath) {
    $InstallerFiles = Get-ChildItem $ReleasePath -Filter "*.exe" | Sort-Object LastWriteTime -Descending
    if ($InstallerFiles) {
        Write-ColorOutput "`nGevonden installers:" $Colors.Info
        foreach ($file in $InstallerFiles) {
            $Size = [math]::Round($file.Length / 1MB, 2)
            Write-ColorOutput "- $($file.Name) ($Size MB)" $Colors.Info
        }
    }
}

Write-Host "" 