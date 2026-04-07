param(
  [Parameter(Mandatory = $true)][ValidateSet("render", "montage", "overflow", "fonts")][string]$Action,
  [string]$Deck,
  [string]$InputDir,
  [string]$Output,
  [switch]$Json
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonCmd = if (Get-Command py -ErrorAction SilentlyContinue) {
  @("py", "-3")
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
  @("python")
} else {
  throw "Python not found. Install Python 3 and retry."
}

function Invoke-CheckedCommand {
  param([Parameter(Mandatory = $true)][string[]]$Command)
  & $Command[0] $Command[1..($Command.Length - 1)]
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code $LASTEXITCODE: $($Command -join ' ')"
  }
}

switch ($Action) {
  "render" {
    if (-not $Deck) { throw "-Deck is required for render" }
    $outDir = if ($Output) { $Output } else { "rendered" }
    Invoke-CheckedCommand -Command ($pythonCmd + @("$scriptDir/render_slides.py", $Deck, "--output_dir", $outDir))
  }
  "montage" {
    if (-not $InputDir) { throw "-InputDir is required for montage" }
    $outFile = if ($Output) { $Output } else { "montage.png" }
    Invoke-CheckedCommand -Command ($pythonCmd + @("$scriptDir/create_montage.py", "--input_dir", $InputDir, "--output_file", $outFile))
  }
  "overflow" {
    if (-not $Deck) { throw "-Deck is required for overflow" }
    Invoke-CheckedCommand -Command ($pythonCmd + @("$scriptDir/slides_test.py", $Deck))
  }
  "fonts" {
    if (-not $Deck) { throw "-Deck is required for fonts" }
    if ($Json) {
      Invoke-CheckedCommand -Command ($pythonCmd + @("$scriptDir/detect_font.py", $Deck, "--json"))
    } else {
      Invoke-CheckedCommand -Command ($pythonCmd + @("$scriptDir/detect_font.py", $Deck))
    }
  }
}
