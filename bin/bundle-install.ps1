param(
  [Parameter(Position = 0)]
  [string]$Command = "help",

  [Parameter(Position = 1)]
  [string]$Target = ""
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$BundleFile = Join-Path $RootDir "bundle.yml"

function Write-Info($Message) {
  Write-Host "[bundle-install] $Message"
}

function Write-Warn($Message) {
  Write-Warning "[bundle-install] $Message"
}

function Test-CommandExists($Name) {
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Ensure-Core {
  Write-Info "Checking core tools..."
  $required = @("git", "node", "python")
  foreach ($tool in $required) {
    if (Test-CommandExists $tool) {
      Write-Info "$tool found"
    } else {
      Write-Warn "$tool is not installed"
    }
  }
}

function Ensure-Vault {
  Write-Info "Ensuring vault structure..."

  $paths = @(
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

  foreach ($p in $paths) {
    $full = Join-Path $RootDir $p
    if (-not (Test-Path $full)) {
      New-Item -ItemType Directory -Path $full -Force | Out-Null
      Write-Info "$p created"
    } else {
      Write-Info "$p already exists"
    }
  }

  Write-Info "Vault structure is ready"
}

function Ensure-Tool($Name) {
  switch ($Name) {
    "core" { Ensure-Core }
    "vault" { Ensure-Vault }
    "qmd" {
      if (Test-CommandExists "qmd") { Write-Info "qmd found" } else { Write-Warn "qmd is not installed" }
    }
    "markitdown" {
      if (Test-CommandExists "markitdown") { Write-Info "markitdown found" } else { Write-Warn "markitdown is not installed" }
    }
    "weavmail" {
      if (Test-CommandExists "weavmail") { Write-Info "weavmail found" } else { Write-Warn "weavmail is not installed" }
    }
    "sogcli" {
      if (Test-CommandExists "sogcli") { Write-Info "sogcli found" } else { Write-Warn "sogcli is not installed" }
    }
    "rclone" {
      if (Test-CommandExists "rclone") { Write-Info "rclone found" } else { Write-Warn "rclone is not installed" }
    }
    "gogcli" {
      if (Test-CommandExists "gogcli") { Write-Info "gogcli found" } else { Write-Warn "gogcli is not installed" }
    }
    default {
      Write-Warn "Unknown ensure target: $Name"
      exit 1
    }
  }
}

function Show-Help {
  Write-Host "Usage:"
  Write-Host "  ./bin/bundle-install.ps1 ensure core"
  Write-Host "  ./bin/bundle-install.ps1 ensure vault"
  Write-Host "  ./bin/bundle-install.ps1 ensure qmd"
  Write-Host "  ./bin/bundle-install.ps1 ensure markitdown"
  Write-Host "  ./bin/bundle-install.ps1 verify"
  Write-Host ""
  Write-Host "bundle.yml: $BundleFile"
}

if (-not (Test-Path $BundleFile)) {
  Write-Warn "bundle.yml not found: $BundleFile"
}

switch ($Command) {
  "ensure" {
    if ([string]::IsNullOrWhiteSpace($Target)) {
      Write-Warn "Specify ensure target, for example: ensure core"
      exit 1
    }
    Ensure-Tool $Target
  }
  "verify" {
    & (Join-Path $ScriptDir "bundle-verify.ps1")
  }
  default {
    Show-Help
  }
}
