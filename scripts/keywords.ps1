<#
.SYNOPSIS
  Naver + Google autocomplete suggestions for mid-tail keyword research.

.DESCRIPTION
  For every seed the script asks
    - Naver  : https://ac.search.naver.com/nx/ac
    - Google : https://suggestqueries.google.com/complete/search (client=firefox, hl=ko, gl=kr)
  and prints the suggestions per engine plus the ones both engines return ("Both").
  Each endpoint is handled separately: a failure is printed as ERROR and the run goes on.
  Requests are spaced by -DelayMs and retried once.

  Run from the project root:
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/keywords.ps1 "seed one" "seed two"
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/keywords.ps1 -Expand -Top 3 "seed"
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/keywords.ps1 -SeedFile seeds.txt -OutFile kw.txt

  Output legend
    N / G / Both   suggestions from Naver / Google / both engines (Naver spelling is shown)
    -> query       -Expand: a suggestion queried one level deeper
    [NG 3] text    summary: seen in Naver (N) and Google (G), returned for 3 different queries

  Keep this file ASCII only. Windows PowerShell 5.1 reads a .ps1 without BOM in the system
  code page, so Korean string literals in here would break. Korean seeds on the command line are fine.
#>
[CmdletBinding()]
param(
  [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
  [string[]]$Seeds,
  # UTF-8 text file with one seed per line. Empty lines and lines starting with # are skipped.
  [string]$SeedFile,
  # Also query the top suggestions of each seed, one level deeper.
  [switch]$Expand,
  # Number of suggestions per seed that -Expand re-queries.
  [ValidateRange(1, 10)]
  [int]$Top = 5,
  # Minimum pause between HTTP requests, in milliseconds.
  [ValidateRange(0, 5000)]
  [int]$DelayMs = 300,
  # Also save the report to this file (UTF-8).
  [string]$OutFile
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12 } catch { }

$Utf8 = New-Object System.Text.UTF8Encoding($false)
$PreviousConsoleEncoding = $null
try { $PreviousConsoleEncoding = [Console]::OutputEncoding; [Console]::OutputEncoding = $Utf8 } catch { }
$OutputEncoding = $Utf8

$UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
$script:LastRequestAt = [DateTime]::MinValue
$script:Cache = @{}
$script:Seen = [ordered]@{}
$script:Stats = @{ NaverOk = 0; NaverFail = 0; GoogleOk = 0; GoogleFail = 0 }
$script:Report = New-Object System.Collections.Generic.List[string]

function Write-Line([string]$Text = '') {
  $script:Report.Add($Text)
  Write-Output $Text
}

function Get-Key([string]$Text) {
  return ($Text -replace '\s+', '').ToLowerInvariant()
}

function Invoke-Utf8Get([string]$Url) {
  $lastError = 'unknown error'
  for ($attempt = 1; $attempt -le 2; $attempt++) {
    $wait = $DelayMs - ([DateTime]::UtcNow - $script:LastRequestAt).TotalMilliseconds
    if ($wait -gt 0) { Start-Sleep -Milliseconds ([int][Math]::Ceiling($wait)) }
    $script:LastRequestAt = [DateTime]::UtcNow
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -UserAgent $UserAgent -TimeoutSec 15 -Headers @{ 'Accept-Language' = 'ko-KR,ko;q=0.9' }
      return [Text.Encoding]::UTF8.GetString($response.RawContentStream.ToArray())
    } catch {
      $lastError = $_.Exception.Message
      if ($attempt -lt 2) { Start-Sleep -Milliseconds 1200 }
    }
  }
  throw $lastError
}

function Get-NaverSuggestions([string]$Query) {
  $q = [uri]::EscapeDataString($Query)
  $url = "https://ac.search.naver.com/nx/ac?q=$q&con=0&frm=nv&ans=2&r_format=json&r_enc=UTF-8&r_unicode=0&t_koreng=1&run=2&rev=4&q_enc=UTF-8&st=100"
  $json = (Invoke-Utf8Get $url) | ConvertFrom-Json
  $list = New-Object System.Collections.Generic.List[string]
  foreach ($group in @($json.items)) {
    foreach ($item in @($group)) {
      $text = ([string](@($item)[0])).Trim()
      if ($text -and -not $list.Contains($text)) { $list.Add($text) }
    }
  }
  return , $list.ToArray()
}

function Get-GoogleSuggestions([string]$Query) {
  $q = [uri]::EscapeDataString($Query)
  $url = "https://suggestqueries.google.com/complete/search?client=firefox&hl=ko&gl=kr&ie=UTF-8&oe=UTF-8&q=$q"
  $json = (Invoke-Utf8Get $url) | ConvertFrom-Json
  $list = New-Object System.Collections.Generic.List[string]
  foreach ($suggestion in @($json[1])) {
    $text = ([string]$suggestion).Trim()
    if ($text -and -not $list.Contains($text)) { $list.Add($text) }
  }
  return , $list.ToArray()
}

function Add-Seen([string]$Text, [string]$Engine, [string]$QueryKey) {
  $key = Get-Key $Text
  if (-not $script:Seen.Contains($key)) {
    $script:Seen[$key] = [pscustomobject]@{ Text = $Text; Naver = $false; Google = $false; Queries = @{}; Order = $script:Seen.Count }
  }
  $entry = $script:Seen[$key]
  if ($Engine -eq 'N') { $entry.Naver = $true; $entry.Text = $Text } else { $entry.Google = $true }
  $entry.Queries[$QueryKey] = $true
}

function Get-Suggestions([string]$Query) {
  $key = Get-Key $Query
  if ($script:Cache.ContainsKey($key)) { return $script:Cache[$key] }
  $result = [pscustomobject]@{ Query = $Query; Naver = @(); Google = @(); NaverError = $null; GoogleError = $null }
  try { $result.Naver = Get-NaverSuggestions $Query; $script:Stats.NaverOk++ }
  catch { $result.NaverError = $_.Exception.Message; $script:Stats.NaverFail++ }
  try { $result.Google = Get-GoogleSuggestions $Query; $script:Stats.GoogleOk++ }
  catch { $result.GoogleError = $_.Exception.Message; $script:Stats.GoogleFail++ }
  foreach ($s in $result.Naver) { Add-Seen $s 'N' $key }
  foreach ($s in $result.Google) { Add-Seen $s 'G' $key }
  $script:Cache[$key] = $result
  return $result
}

function Get-Both($Result) {
  $googleKeys = @{}
  foreach ($s in $Result.Google) { $googleKeys[(Get-Key $s)] = $true }
  $list = New-Object System.Collections.Generic.List[string]
  foreach ($s in $Result.Naver) { if ($googleKeys.ContainsKey((Get-Key $s))) { $list.Add($s) } }
  return , $list.ToArray()
}

function Format-Suggestions([string]$Label, $Suggestions, [string]$ErrorText) {
  if ($ErrorText) { return "${Label}: ERROR ($ErrorText)" }
  $list = @($Suggestions)
  if ($list.Count -eq 0) { return "$Label (0): -" }
  return "$Label ($($list.Count)): " + ($list -join ' | ')
}

function Write-Result($Result, [string]$Indent) {
  Write-Line ($Indent + (Format-Suggestions 'N' $Result.Naver $Result.NaverError))
  Write-Line ($Indent + (Format-Suggestions 'G' $Result.Google $Result.GoogleError))
  if (-not $Result.NaverError -and -not $Result.GoogleError) {
    Write-Line ($Indent + (Format-Suggestions 'Both' (Get-Both $Result) $null))
  }
}

function Get-ExpandCandidates($Result, [int]$Count) {
  # Both engines first, then Naver order, then Google order. Skip the query itself and anything already queried.
  $ordered = New-Object System.Collections.Generic.List[string]
  foreach ($s in (Get-Both $Result)) { $ordered.Add($s) }
  foreach ($s in $Result.Naver) { $ordered.Add($s) }
  foreach ($s in $Result.Google) { $ordered.Add($s) }
  $picked = New-Object System.Collections.Generic.List[string]
  $keys = @{ (Get-Key $Result.Query) = $true }
  foreach ($s in $ordered) {
    $k = Get-Key $s
    if ($keys.ContainsKey($k) -or $script:Cache.ContainsKey($k)) { continue }
    $keys[$k] = $true
    $picked.Add($s)
    if ($picked.Count -ge $Count) { break }
  }
  return , $picked.ToArray()
}

try {
  $allSeeds = New-Object System.Collections.Generic.List[string]
  if ($SeedFile) {
    $seedPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($SeedFile)
    foreach ($line in [IO.File]::ReadAllLines($seedPath, [Text.Encoding]::UTF8)) { $allSeeds.Add($line) }
  }
  foreach ($s in @($Seeds)) { if ($null -ne $s) { $allSeeds.Add($s) } }

  $unique = New-Object System.Collections.Generic.List[string]
  $uniqueKeys = @{}
  foreach ($s in $allSeeds) {
    $t = ($s -replace '\s+', ' ').Trim()
    if (-not $t -or $t.StartsWith('#')) { continue }
    $k = Get-Key $t
    if ($uniqueKeys.ContainsKey($k)) { continue }
    $uniqueKeys[$k] = $true
    $unique.Add($t)
  }

  if ($unique.Count -eq 0) {
    Write-Output 'Usage: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/keywords.ps1 [-Expand] [-Top 5] [-DelayMs 300] [-SeedFile seeds.txt] [-OutFile report.txt] "seed 1" "seed 2" ...'
    exit 1
  }

  $mode = if ($Expand) { "expand top $Top" } else { 'no expand' }
  Write-Line ("# Autocomplete report {0} | Naver ac + Google suggest (hl=ko, gl=kr) | {1} seed(s), {2}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm'), $unique.Count, $mode)

  foreach ($seed in $unique) {
    Write-Line ''
    Write-Line "=== $seed"
    $result = Get-Suggestions $seed
    Write-Result $result ''
    if ($Expand) {
      foreach ($candidate in (Get-ExpandCandidates $result $Top)) {
        Write-Line "  -> $candidate"
        Write-Result (Get-Suggestions $candidate) '     '
      }
    }
  }

  $strong = @($script:Seen.Values | Where-Object { ($_.Naver -and $_.Google) -or $_.Queries.Count -ge 2 } |
      Sort-Object -Property @{ Expression = { [int]($_.Naver -and $_.Google) }; Descending = $true },
                            @{ Expression = { $_.Queries.Count }; Descending = $true },
                            @{ Expression = { $_.Order }; Descending = $false })
  Write-Line ''
  Write-Line "=== Strong signals: in both engines or returned for 2+ queries ($($strong.Count) of $($script:Seen.Count) unique)"
  if ($strong.Count -eq 0) { Write-Line '(none)' }
  foreach ($entry in ($strong | Select-Object -First 60)) {
    $flag = $(if ($entry.Naver) { 'N' } else { '-' }) + $(if ($entry.Google) { 'G' } else { '-' })
    Write-Line ("[{0} {1}] {2}" -f $flag, $entry.Queries.Count, $entry.Text)
  }

  Write-Line ''
  Write-Line ("# Requests: Naver ok {0} / failed {1}, Google ok {2} / failed {3}" -f $script:Stats.NaverOk, $script:Stats.NaverFail, $script:Stats.GoogleOk, $script:Stats.GoogleFail)

  if ($OutFile) {
    $outPath = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutFile)
    [IO.File]::WriteAllLines($outPath, $script:Report.ToArray(), (New-Object System.Text.UTF8Encoding($true)))
    Write-Output "# Saved: $outPath"
  }

  if (($script:Stats.NaverOk + $script:Stats.GoogleOk) -eq 0) { exit 2 }
  exit 0
}
finally {
  if ($null -ne $PreviousConsoleEncoding) { try { [Console]::OutputEncoding = $PreviousConsoleEncoding } catch { } }
}
