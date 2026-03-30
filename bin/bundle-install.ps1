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

function Install-WithWinget($PackageId) {
  if (-not (Test-CommandExists "winget")) {
    Write-Warn "winget not found"
    return $false
  }

  try {
    winget install --id $PackageId --exact --silent --accept-package-agreements --accept-source-agreements | Out-Null
    return $true
  } catch {
    Write-Warn "winget install failed for $PackageId"
    return $false
  }
}

function Install-Tool($Name) {
  switch ($Name) {
    "git" {
      return (Install-WithWinget "Git.Git")
    }
    "node" {
      return (Install-WithWinget "OpenJS.NodeJS.LTS")
    }
    "python" {
      return (Install-WithWinget "Python.Python.3.12")
    }
    "uv" {
      return (Install-WithWinget "Astral-sh.uv")
    }
    "rclone" {
      return (Install-WithWinget "Rclone.Rclone")
    }
    "qmd" {
      if (-not (Test-CommandExists "uv")) {
        if (-not (Install-Tool "uv")) {
          return $false
        }
      }
      try {
        uv tool install qmd | Out-Null
      } catch {
        try { uv tool upgrade qmd | Out-Null } catch { return $false }
      }
      return $true
    }
    "weavmail" {
      if (-not (Test-CommandExists "uv")) {
        if (-not (Install-Tool "uv")) {
          return $false
        }
      }
      try {
        uv tool install weavmail | Out-Null
      } catch {
        try { uv tool upgrade weavmail | Out-Null } catch { return $false }
      }
      return $true
    }
    "markitdown" {
      if (-not (Test-CommandExists "python")) {
        if (-not (Install-Tool "python")) {
          return $false
        }
      }
      try {
        python -m pip install --user -U "markitdown[all]" | Out-Null
        return $true
      } catch {
        Write-Warn "pip installation failed for markitdown"
        return $false
      }
    }
    "sogcli" {
      Write-Warn "Automatic install for sogcli is not configured yet"
      return $false
    }
    "gogcli" {
      Write-Warn "Automatic install for gogcli is not configured yet"
      return $false
    }
    default {
      Write-Warn "Unknown install target: $Name"
      return $false
    }
  }
}

function Ensure-ToolInstalled($ToolName, $CheckCmd) {
  if (Test-CommandExists $CheckCmd) {
    Write-Info "$ToolName found"
    return $true
  }

  Write-Warn "$ToolName is not installed. Attempting installation..."
  if ((Install-Tool $ToolName) -and (Test-CommandExists $CheckCmd)) {
    Write-Info "$ToolName installed successfully"
    return $true
  }

  Write-Warn "$ToolName installation failed"
  return $false
}

function Ensure-Core {
  Write-Info "Ensuring core dependencies..."

  $failed = $false

  if (-not (Ensure-ToolInstalled "git" "git")) { $failed = $true }
  if (-not (Ensure-ToolInstalled "node" "node")) { $failed = $true }

  if (-not (Test-CommandExists "python")) {
    if (-not (Ensure-ToolInstalled "python" "python")) { $failed = $true }
  } else {
    Write-Info "python found"
  }

  if (-not (Ensure-ToolInstalled "uv" "uv")) { $failed = $true }
  if (-not (Ensure-ToolInstalled "qmd" "qmd")) { $failed = $true }
  if (-not (Ensure-ToolInstalled "weavmail" "weavmail")) { $failed = $true }
  if (-not (Ensure-ToolInstalled "markitdown" "markitdown")) { $failed = $true }
  if (-not (Ensure-ToolInstalled "rclone" "rclone")) { $failed = $true }

  if ($failed) {
    Write-Warn "Core dependencies have unresolved issues"
    exit 1
  }

  Write-Info "Core dependencies are ready"
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
    "qmd" { if (-not (Ensure-ToolInstalled "qmd" "qmd")) { exit 1 } }
    "markitdown" { if (-not (Ensure-ToolInstalled "markitdown" "markitdown")) { exit 1 } }
    "weavmail" { if (-not (Ensure-ToolInstalled "weavmail" "weavmail")) { exit 1 } }
    "sogcli" { if (-not (Ensure-ToolInstalled "sogcli" "sogcli")) { exit 1 } }
    "rclone" { if (-not (Ensure-ToolInstalled "rclone" "rclone")) { exit 1 } }
    "gogcli" { if (-not (Ensure-ToolInstalled "gogcli" "gogcli")) { exit 1 } }
    "uv" { if (-not (Ensure-ToolInstalled "uv" "uv")) { exit 1 } }
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
  Write-Host "  ./bin/bundle-install.ps1 ensure weavmail"
  Write-Host "  ./bin/bundle-install.ps1 ensure markitdown"
  Write-Host "  ./bin/bundle-install.ps1 ensure uv"
  Write-Host "  ./bin/bundle-install.ps1 ensure rclone"
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
