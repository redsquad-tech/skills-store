param(
  [Parameter(Mandatory = $true, Position = 0)][string]$InputPdf,
  [Parameter(Position = 1)][string]$OutputPrefix = "output/pdf/page"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Get-Command pdftoppm -ErrorAction SilentlyContinue)) {
  throw "Required command not found: pdftoppm"
}
if (-not (Test-Path -LiteralPath $InputPdf)) {
  throw "Input PDF not found: $InputPdf"
}

$outputDir = Split-Path -Parent $OutputPrefix
if ($outputDir) {
  New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

$inputFull = (Resolve-Path -LiteralPath $InputPdf).Path
& pdftoppm -png $inputFull $OutputPrefix
Write-Output "PNG prefix: $OutputPrefix"
