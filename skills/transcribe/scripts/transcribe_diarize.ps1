param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$scriptPath = Join-Path $scriptDir "transcribe_diarize.py"

if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "transcribe_diarize.py not found at $scriptPath"
}

if (Get-Command py -ErrorAction SilentlyContinue) {
  & py -3 $scriptPath @Args
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
  & python $scriptPath @Args
} else {
  throw "Python not found. Install Python 3 and retry."
}
