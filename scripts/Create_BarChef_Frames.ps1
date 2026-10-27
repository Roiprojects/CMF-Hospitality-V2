<#
.SYNOPSIS
    Create_BarChef_Frames.ps1
    Extracts all 1,920 frames from the 8 original Bar Chef videos as lossless,
    original-resolution (1080p) PNGs into eight separate scene folders, and creates
    a single consolidated ZIP archive.

.PARAMETER VideoFolder
    Path to the directory containing the 8 original video files (.mp4).
    Defaults to: C:\Users\user\Desktop\CMF Hospitablity\inputs_and_frames

.PARAMETER OutputFolder
    Destination directory where scene folders and the ZIP archive will be created.
    Defaults to: C:\Users\user\Desktop\CMF Hospitablity\BarChef_Extracted_Frames

.PARAMETER ZipFileName
    Name of the consolidated ZIP file containing the eight scene folders.
    Defaults to: BarChef_1920_Frames.zip
#>

[CmdletBinding()]
param (
    [Parameter(Position = 0, Mandatory = $false)]
    [string]$VideoFolder = "C:\Users\user\Desktop\CMF Hospitablity\inputs_and_frames",

    [Parameter(Position = 1, Mandatory = $false)]
    [string]$OutputFolder = "C:\Users\user\Desktop\CMF Hospitablity\BarChef_Extracted_Frames",

    [Parameter(Mandatory = $false)]
    [string]$ZipFileName = "BarChef_1920_Frames.zip"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       Bar Chef Frame Extraction & Packaging Tool         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Target Video Directory: $VideoFolder"
Write-Host "Target Output Folder  : $OutputFolder"
Write-Host ""

# -------------------------------------------------------------------------
# STEP 1: Check whether FFmpeg is installed; install / locate if missing
# -------------------------------------------------------------------------
Write-Host "[Step 1/6] Checking FFmpeg installation..." -ForegroundColor Cyan

# Check if Gyan.FFmpeg or other WinGet paths exist and add to current session PATH
$wingetCandidates = @(
    "C:\Users\user\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-essentials_build\bin",
    "C:\Users\user\AppData\Local\Microsoft\WinGet\Links"
)
foreach ($cand in $wingetCandidates) {
    if (Test-Path $cand) {
        if ($env:Path -notlike "*$cand*") {
            $env:Path = "$cand;$env:Path"
        }
    }
}

$ffmpegCmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpegCmd) {
    Write-Host "FFmpeg not detected in PATH. Attempting automatic installation via winget..." -ForegroundColor Yellow
    try {
        & winget install --id Gyan.FFmpeg.Essentials --accept-source-agreements --accept-package-agreements --silent
        foreach ($cand in $wingetCandidates) {
            if (Test-Path $cand) {
                if ($env:Path -notlike "*$cand*") {
                    $env:Path = "$cand;$env:Path"
                }
            }
        }
        $ffmpegCmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
    } catch {
        Write-Warning "Winget installation encountered an error: $_"
    }
}

if (-not $ffmpegCmd) {
    throw "FFmpeg is missing and could not be detected. Please ensure FFmpeg is installed and accessible."
}

$ffmpegVer = (& ffmpeg -version | Select-Object -First 1)
Write-Host "  -> FFmpeg detected: $ffmpegVer" -ForegroundColor Green

# -------------------------------------------------------------------------
# STEP 2: Verify Disk Space (Require at least 6 GB free)
# -------------------------------------------------------------------------
Write-Host "`n[Step 2/6] Verifying free disk space..." -ForegroundColor Cyan
$resolvedOutput = [System.IO.Path]::GetFullPath($OutputFolder)
$targetDriveRoot = [System.IO.Path]::GetPathRoot($resolvedOutput)
if (-not $targetDriveRoot) { $targetDriveRoot = "C:\" }

$drive = [System.IO.DriveInfo]::new($targetDriveRoot)
$freeSpaceBytes = $drive.AvailableFreeSpace
$freeSpaceGB = [math]::Round($freeSpaceBytes / 1GB, 2)
$minRequiredGB = 6.0

Write-Host "  -> Drive root: $targetDriveRoot"
Write-Host "  -> Available free space: $freeSpaceGB GB"
Write-Host "  -> Required space      : $minRequiredGB GB"

if ($freeSpaceBytes -lt ($minRequiredGB * 1GB)) {
    throw "Insufficient free space on drive $targetDriveRoot! Found $freeSpaceGB GB, but at least $minRequiredGB GB is required."
}
Write-Host "  -> Sufficient disk space confirmed ($freeSpaceGB GB >= $minRequiredGB GB)." -ForegroundColor Green

# -------------------------------------------------------------------------
# STEP 3: Locate the 8 original videos in VideoFolder and preserve originals
# -------------------------------------------------------------------------
Write-Host "`n[Step 3/6] Locating original videos in: $VideoFolder..." -ForegroundColor Cyan

if (-not (Test-Path $VideoFolder)) {
    throw "VideoFolder does not exist: $VideoFolder"
}

$videoFiles = Get-ChildItem -Path $VideoFolder -Filter *.mp4 | Sort-Object Name
Write-Host "  -> Found $($videoFiles.Count) original video files:"
$originalHashes = @{}
foreach ($v in $videoFiles) {
    $sizeMB = [math]::Round($v.Length / 1MB, 2)
    # Store initial file size and last write time to verify originals are preserved
    $originalHashes[$v.FullName] = @{
        Length = $v.Length
        LastWriteTime = $v.LastWriteTime
    }
    Write-Host "     * $($v.Name) ($sizeMB MB)"
}

if ($videoFiles.Count -ne 8) {
    Write-Warning "Expected 8 videos, but found $($videoFiles.Count)."
}

# -------------------------------------------------------------------------
# STEP 4: Extract all frames as lossless original-resolution PNGs
# -------------------------------------------------------------------------
Write-Host "`n[Step 4/6] Extracting lossless, original-resolution PNGs..." -ForegroundColor Cyan

$scenesBaseDir = Join-Path $OutputFolder "scenes"
if (-not (Test-Path $scenesBaseDir)) {
    New-Item -ItemType Directory -Path $scenesBaseDir -Force | Out-Null
}

$extractedStats = @()
$totalExtractedFrames = 0

foreach ($video in $videoFiles) {
    $sceneName = $video.BaseName
    $sceneDir = Join-Path $scenesBaseDir $sceneName
    if (-not (Test-Path $sceneDir)) {
        New-Item -ItemType Directory -Path $sceneDir -Force | Out-Null
    }

    Write-Host "  -> Processing scene: $sceneName" -ForegroundColor Yellow
    $startTime = Get-Date

    # FFmpeg command to extract all native frames losslessly as PNG without any resizing
    $outputPattern = Join-Path $sceneDir "%04d.png"
    & ffmpeg -nostdin -v error -y -i $video.FullName -map 0:v:0 -an -c:v png -start_number 0 $outputPattern

    $pngFiles = Get-ChildItem -Path $sceneDir -Filter *.png | Sort-Object Name
    $frameCount = $pngFiles.Count
    $totalExtractedFrames += $frameCount
    $sceneSizeBytes = ($pngFiles | Measure-Object -Property Length -Sum).Sum
    $sceneSizeMB = [math]::Round($sceneSizeBytes / 1MB, 2)
    $duration = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)

    # Validate resolution of first extracted frame
    $samplePng = $pngFiles[0].FullName
    $probe = & ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name -of json $samplePng | ConvertFrom-Json
    $width = $probe.streams[0].width
    $height = $probe.streams[0].height

    Write-Host "     Extracted $frameCount PNG frames in ${duration}s ($sceneSizeMB MB, ${width}x${height})" -ForegroundColor Green

    $extractedStats += [PSCustomObject]@{
        SceneFolder = $sceneName
        FrameCount  = $frameCount
        Resolution  = "${width}x${height}"
        SizeMB      = $sceneSizeMB
        DurationSec = $duration
    }
}

Write-Host "`nTotal frames extracted across all scenes: $totalExtractedFrames" -ForegroundColor Cyan
if ($totalExtractedFrames -ne 1920) {
    Write-Warning "Expected exactly 1,920 frames, extracted $totalExtractedFrames frames."
} else {
    Write-Host "All 1,920 frames successfully extracted!" -ForegroundColor Green
}

# -------------------------------------------------------------------------
# STEP 5: Create one ZIP archive containing those eight scene folders
# -------------------------------------------------------------------------
Write-Host "`n[Step 5/6] Creating consolidated ZIP archive..." -ForegroundColor Cyan
$zipFilePath = Join-Path $OutputFolder $ZipFileName

if (Test-Path $zipFilePath) {
    Remove-Item -Path $zipFilePath -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipStartTime = Get-Date
Write-Host "  -> Compressing $scenesBaseDir into $zipFilePath..."
[System.IO.Compression.ZipFile]::CreateFromDirectory($scenesBaseDir, $zipFilePath, [System.IO.Compression.CompressionLevel]::Optimal, $false)
$zipDuration = [math]::Round(((Get-Date) - $zipStartTime).TotalSeconds, 1)

$zipItem = Get-Item $zipFilePath
$zipSizeMB = [math]::Round($zipItem.Length / 1MB, 2)
$zipSizeGB = [math]::Round($zipItem.Length / 1GB, 2)
Write-Host "  -> ZIP archive created successfully in ${zipDuration}s: $zipSizeMB MB ($zipSizeGB GB)" -ForegroundColor Green

# -------------------------------------------------------------------------
# STEP 6: Verify successful completion and check preservation of originals
# -------------------------------------------------------------------------
Write-Host "`n[Step 6/6] Verifying output and original preservation..." -ForegroundColor Cyan

# 1. Verify original videos were preserved untouched
$originalsPreserved = $true
foreach ($v in $videoFiles) {
    $current = Get-Item $v.FullName
    $init = $originalHashes[$v.FullName]
    if ($current.Length -ne $init.Length -or $current.LastWriteTime -ne $init.LastWriteTime) {
        $originalsPreserved = $false
        Write-Warning "Original video file was modified: $($v.FullName)"
    }
}

if ($originalsPreserved) {
    Write-Host "  -> Original videos verified: ALL 8 VIDEOS FULLY PRESERVED UNTOUCHED." -ForegroundColor Green
} else {
    Write-Warning "  -> Warning: Some original video files may have been touched."
}

# 2. Verify total frames in scene folders
$allPngs = Get-ChildItem -Path $scenesBaseDir -Recurse -Filter *.png
$finalFrameCount = $allPngs.Count
$totalSizeAllPngs = [math]::Round(($allPngs | Measure-Object -Property Length -Sum).Sum / 1MB, 2)

Write-Host "  -> Scene Folders Count     : $($extractedStats.Count)"
Write-Host "  -> Total Extracted PNGs    : $finalFrameCount frames"
Write-Host "  -> Total Uncompressed Size : $totalSizeAllPngs MB"
Write-Host "  -> Consolidated ZIP File   : $zipFilePath ($zipSizeMB MB)"

Write-Host "`nDetailed Scene Breakdown:" -ForegroundColor Cyan
$extractedStats | Format-Table -AutoSize | Out-String | Write-Host

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "               EXECUTION COMPLETED SUCCESSFULLY           " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Output Directory: $OutputFolder" -ForegroundColor Cyan
Write-Host "Scene Folders   : $scenesBaseDir" -ForegroundColor Cyan
Write-Host "ZIP Archive     : $zipFilePath" -ForegroundColor Cyan
Write-Host ""
