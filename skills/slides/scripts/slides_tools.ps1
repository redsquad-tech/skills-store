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
$python = if (Get-Command py -ErrorAction SilentlyContinue) { "py" } else { "python" }

switch ($Action) {
  "render" {
    if (-not $Deck) { throw "-Deck is required for render" }
    $outDir = if ($Output) { $Output } else { "rendered" }
    & $python "$scriptDir/render_slides.py" $Deck --output_dir $outDir
  }
  "montage" {
    if (-not $InputDir) { throw "-InputDir is required for montage" }
    $outFile = if ($Output) { $Output } else { "montage.png" }
    & $python "$scriptDir/create_montage.py" --input_dir $InputDir --output_file $outFile
  }
  "overflow" {
    if (-not $Deck) { throw "-Deck is required for overflow" }
    & $python "$scriptDir/slides_test.py" $Deck
  }
  "fonts" {
    if (-not $Deck) { throw "-Deck is required for fonts" }
    if ($Json) {
      & $python "$scriptDir/detect_font.py" $Deck --json
    } else {
      & $python "$scriptDir/detect_font.py" $Deck
    }
  }
}
