param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (Get-Command weavmail -ErrorAction SilentlyContinue) {
  & weavmail @Args
  exit $LASTEXITCODE
}

if (Get-Command uv -ErrorAction SilentlyContinue) {
  & uv tool run weavmail @Args
  exit $LASTEXITCODE
}

throw "weavmail CLI not found. Install with: uv tool install weavmail"
