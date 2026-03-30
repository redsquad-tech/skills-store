$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$BundleFile = Join-Path $RootDir "bundle.yml"

function Write-Info($Message) {
  Write-Host "[bundle-verify] $Message"
}

function Write-Warn($Message) {
  Write-Warning "[bundle-verify] $Message"
}

function Test-CommandExists($Name) {
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

Write-Info "Starting verification..."

if (Test-Path $BundleFile) {
  Write-Info "bundle.yml found"
} else {
  Write-Warn "bundle.yml is missing"
}

$checks = @("git", "node", "python", "uv", "qmd", "weavmail", "markitdown", "rclone")
foreach ($cmd in $checks) {
  if (Test-CommandExists $cmd) {
    Write-Info "$cmd found"
  } else {
    Write-Warn "$cmd is missing"
  }
}

$vaultDirs = @(
  "vault",
  "vault/mail/raw",
  "vault/mail/threads",
  "vault/events",
  "vault/contacts",
  "vault/orgs",
  "vault/projects",
  "vault/docs/source",
  "vault/docs/derived-md",
  "vault/tasks/todo",
  "vault/tasks/done",
  "vault/drafts/email",
  "vault/drafts/meeting",
  "vault/tmp/screens"
)

foreach ($dir in $vaultDirs) {
  $full = Join-Path $RootDir $dir
  if (Test-Path $full) {
    Write-Info "$dir exists"
  } else {
    Write-Warn "$dir is missing"
  }
}

Write-Info "Verification finished."
