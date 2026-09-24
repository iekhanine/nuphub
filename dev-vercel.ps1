$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot ".env.local"

if (-not (Test-Path $envFile)) {
    Write-Error ".env.local was not found in $PSScriptRoot"
    exit 1
}

Write-Host "Loading .env.local into the current process..." -ForegroundColor Cyan

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()

    if (-not $line -or $line.StartsWith("#") -or -not $line.Contains("=")) {
        return
    }

    $parts = $line -split "=", 2
    $name = $parts[0].Trim()
    $value = $parts[1].Trim()

    if (
        ($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))
    ) {
        $value = $value.Substring(1, $value.Length - 2)
    }

    [Environment]::SetEnvironmentVariable(
        $name,
        $value,
        [EnvironmentVariableTarget]::Process
    )
}

$required = @(
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_ANON_KEY"
)

$missing = @()

foreach ($name in $required) {
    $value = [Environment]::GetEnvironmentVariable(
        $name,
        [EnvironmentVariableTarget]::Process
    )

    if ([string]::IsNullOrWhiteSpace($value)) {
        $missing += $name
    }
}

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "Missing required variables:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
    exit 1
}

Write-Host "Supabase variables loaded." -ForegroundColor Green

$squareVars = @(
    "SQUARE_ENVIRONMENT",
    "SQUARE_ACCESS_TOKEN",
    "SQUARE_LOCATION_ID",
    "SITE_URL"
)

$squareMissing = @()

foreach ($name in $squareVars) {
    $value = [Environment]::GetEnvironmentVariable(
        $name,
        [EnvironmentVariableTarget]::Process
    )

    if ([string]::IsNullOrWhiteSpace($value)) {
        $squareMissing += $name
    }
}

if ($squareMissing.Count -gt 0) {
    Write-Host ""
    Write-Host "Square checkout is not fully configured yet." -ForegroundColor Yellow
    Write-Host "Missing:" -ForegroundColor Yellow
    $squareMissing | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    Write-Host ""
}

Write-Host "Starting Vercel dev..." -ForegroundColor Cyan
Write-Host ""

npx vercel dev
