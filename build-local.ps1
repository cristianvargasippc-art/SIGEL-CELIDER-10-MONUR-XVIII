$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeDir = Join-Path $projectRoot ".tools\node-v22.11.0-win-x64"
$npm = Join-Path $nodeDir "npm.cmd"

if (-not (Test-Path $npm)) {
  Write-Error "No se encontro Node portable en .tools. Ejecuta primero la instalacion indicada por Codex."
}

$env:Path = "$nodeDir;$env:Path"
Set-Location $projectRoot
& $npm run build
