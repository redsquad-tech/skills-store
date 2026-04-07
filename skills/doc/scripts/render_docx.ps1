param(
  [Parameter(Mandatory = $true, Position = 0)][string]$InputDocx,
  [Parameter(Position = 1)][string]$OutputDir = "output/doc"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Require-Command {
  param([Parameter(Mandatory = $true)][string]$Name)
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Name"
  }
}

if (-not (Test-Path -LiteralPath $InputDocx)) {
  throw "Input DOCX not found: $InputDocx"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$inputFull = (Resolve-Path -LiteralPath $InputDocx).Path
$outputFull = (Resolve-Path -LiteralPath $OutputDir).Path
$baseName = [System.IO.Path]::GetFileNameWithoutExtension($inputFull)
$pdfPath = Join-Path $outputFull "$baseName.pdf"
$prefix = Join-Path $outputFull $baseName

Require-Command -Name "soffice"
Require-Command -Name "pdftoppm"

& soffice --headless --convert-to pdf --outdir $outputFull $inputFull
if (-not (Test-Path -LiteralPath $pdfPath)) {
  throw "Expected converted PDF was not created: $pdfPath"
}

& pdftoppm -png $pdfPath $prefix
Write-Output "PDF: $pdfPath"
Write-Output "PNG prefix: $prefix"
