#Requires -Version 5.1
<#
.SYNOPSIS
frontend-design-pro — native adapter installer (PowerShell port of setup.sh).

.DESCRIPTION
Copies one agent's native rules/instructions file into YOUR project, so the
agent routes through the registry without you hand-writing the file.

It does NOT install the pack itself. Expand the .skill archive first — the
adapters reference `frontend-design-pro/SKILL.md`, so the pack has to be
present at that path relative to the project root:

    Expand-Archive frontend-design-pro-v*.skill -DestinationPath .

Nothing is overwritten without -Force, because these are filenames other tools
legitimately own: a project may already have a .cursor/rules/ entry or a
CONVENTIONS.md, and silently replacing one to save a prompt is not a trade an
installer gets to make.

.EXAMPLE
.\setup.ps1
Auto-detect the agent from the current directory.

.EXAMPLE
.\setup.ps1 cursor -Target ..\app
Install the Cursor adapter into a directory other than the current one.

.EXAMPLE
.\setup.ps1 -List
Show every adapter and how it installs.

.EXAMPLE
.\setup.ps1 cursor -DryRun
Print what would be written, write nothing.
#>
[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Agent,
    [string]$Target,
    [switch]$Force,
    [switch]$DryRun,
    [switch]$List
)

$ErrorActionPreference = 'Stop'

$PackRoot   = $PSScriptRoot
$InstallDir = Join-Path $PackRoot 'install'

# Adapters whose payload is a file the installer can safely drop into a project.
# Everything else needs a web UI, a JSON merge, or a decision only the user can
# make, so those print their card instead of pretending to automate it.
$AutoAgents = @('cursor', 'copilot', 'windsurf', 'aider', 'continue')

function Write-Ok   { param([string]$m) Write-Host "  ok $m"   -ForegroundColor Green }
function Write-Warn { param([string]$m) Write-Host "  -- $m"   -ForegroundColor Yellow }
function Write-Note { param([string]$m) Write-Host "     $m"   -ForegroundColor DarkGray }
function Write-Bad  { param([string]$m) Write-Host "  !! $m"   -ForegroundColor Red }

function Stop-WithMessage {
    param([string]$m)
    Write-Bad $m
    exit 1
}

# Every directory under install/ is an adapter. Derived, not hardcoded, so this
# cannot drift out of sync with what actually ships.
function Get-AllAgents {
    if (-not (Test-Path -LiteralPath $InstallDir -PathType Container)) {
        Stop-WithMessage "install/ not found next to setup.ps1 (looked in $InstallDir)"
    }
    Get-ChildItem -LiteralPath $InstallDir -Directory | Select-Object -ExpandProperty Name | Sort-Object
}

function Test-IsAuto { param([string]$name) return $AutoAgents -contains $name }

# Detect from marker files the agent itself creates. Returns every match rather
# than the first: two markers means the answer is genuinely ambiguous, and
# guessing would write a file into a project on the strength of a coin flip.
function Get-DetectedAgents {
    param([string]$dir)
    $found = New-Object System.Collections.Generic.List[string]
    $has = { param($p) Test-Path -LiteralPath (Join-Path $dir $p) }

    if ((& $has '.cursor') -or (& $has '.cursorrules'))       { $found.Add('cursor') }
    if ((& $has '.windsurf') -or (& $has '.windsurfrules'))   { $found.Add('windsurf') }
    if (& $has '.continue')                                   { $found.Add('continue') }
    if ((& $has '.aider.conf.yml') -or (& $has '.aider.conf.yaml') -or
        (& $has '.aider.input.history'))                      { $found.Add('aider') }
    if ((& $has '.github/copilot-instructions.md') -or
        (& $has '.github/instructions'))                      { $found.Add('copilot') }
    return $found
}

function Show-AgentList {
    Write-Host ""
    Write-Host "Adapters in install/:"
    Write-Host ""
    foreach ($a in Get-AllAgents) {
        if (Test-IsAuto $a) {
            Write-Host ("  {0,-10} .\setup.ps1 {1}" -f $a, $a)
        } else {
            Write-Host ("  {0,-10} " -f $a) -NoNewline
            Write-Host "manual - see install/$a/README.md" -ForegroundColor DarkGray
        }
    }
    Write-Host ""
    Write-Host "Compatibility matrix: docs/AGENT_COMPATIBILITY.md"
}

function Install-Adapter {
    param([string]$name, [string]$targetDir)

    $src = Join-Path $InstallDir $name
    if (-not (Test-Path -LiteralPath $src -PathType Container)) {
        Stop-WithMessage "no adapter for '$name' - run: .\setup.ps1 -List"
    }

    if (-not (Test-IsAuto $name)) {
        Write-Host ""
        Write-Host "$name needs manual setup - there is no file to drop in."
        Write-Host ""
        Write-Note "steps: install/$name/README.md"
        return
    }

    $copied = 0
    $skipped = 0
    # Everything under install/<agent>/ is laid out exactly as it should appear
    # at the project root. README.md is the install card, not payload.
    $files = Get-ChildItem -LiteralPath $src -Recurse -File -Force | Sort-Object FullName
    foreach ($f in $files) {
        $rel = $f.FullName.Substring($src.Length + 1)
        if ($rel -eq 'README.md') { continue }
        $show = $rel -replace '\\', '/'
        $dest = Join-Path $targetDir $rel

        if ((Test-Path -LiteralPath $dest) -and (-not $Force)) {
            Write-Warn "exists, left alone: $show"
            $skipped++
            continue
        }
        if ($DryRun) {
            Write-Ok "would write: $show"
            $copied++
            continue
        }
        $destDir = Split-Path -Parent $dest
        if (-not (Test-Path -LiteralPath $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item -LiteralPath $f.FullName -Destination $dest -Force
        Write-Ok "wrote: $show"
        $copied++
    }

    if ($skipped -gt 0 -and $copied -eq 0) {
        Write-Host ""
        Write-Host "Nothing written - every target already exists. Re-run with -Force to replace them."
        return
    }
    if ($skipped -gt 0) { Write-Note "$skipped file(s) skipped; -Force replaces them" }

    if ($DryRun) {
        Write-Host ""
        Write-Host "Dry run - nothing was written."
        return
    }

    Write-Host ""
    Write-Host "Next: put the pack where the adapter expects it, if it is not there already."
    Write-Host ""
    Write-Note "Expand-Archive frontend-design-pro-v*.skill -DestinationPath `"$targetDir`""
    Write-Host ""
    Write-Host "The adapter references frontend-design-pro/SKILL.md relative to the project"
    Write-Host "root, so that expand has to land beside the file just written."
    Write-Host ""
    Write-Note "detail + troubleshooting: install/$name/README.md"
}

if ($List) { Show-AgentList; exit 0 }

if ([string]::IsNullOrWhiteSpace($Target)) { $Target = (Get-Location).Path }
if (-not (Test-Path -LiteralPath $Target -PathType Container)) {
    Stop-WithMessage "target is not a directory: $Target"
}
$Target = (Resolve-Path -LiteralPath $Target).ProviderPath.TrimEnd('\', '/')
$PackRootResolved = (Resolve-Path -LiteralPath $PackRoot).ProviderPath.TrimEnd('\', '/')

# The footgun this guard exists for: running .\setup.ps1 from inside the pack
# itself. This repo contains a .github/ directory, so detection would match
# copilot and write an adapter into the pack rather than into a project.
if ($Target -eq $PackRootResolved) {
    Write-Bad "target is the pack directory itself: $Target"
    Write-Note "run this from your project, or pass one:"
    Write-Note "  cd C:\path\to\your\project; & '$PackRootResolved\setup.ps1'"
    Write-Note "  .\setup.ps1 -Target C:\path\to\your\project"
    exit 1
}

if ([string]::IsNullOrWhiteSpace($Agent)) {
    $matched = Get-DetectedAgents -dir $Target
    if ($matched.Count -eq 1) {
        $Agent = $matched[0]
        Write-Host "Detected: $Agent " -NoNewline
        Write-Host "(in $Target)" -ForegroundColor DarkGray
    }
    elseif ($matched.Count -eq 0) {
        Write-Host "No agent detected in $Target - nothing here identifies one."
        Show-AgentList
        exit 1
    }
    else {
        Write-Host "Ambiguous - markers for more than one agent in ${Target}: $($matched -join ', ')"
        Write-Host ""
        Write-Host "Name the one you want rather than letting this guess:"
        Write-Host ""
        foreach ($a in $matched) { Write-Note ".\setup.ps1 $a" }
        exit 1
    }
}

Install-Adapter -name $Agent -targetDir $Target
