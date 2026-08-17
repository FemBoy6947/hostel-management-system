# Automated GitHub Push Script for Hostel Management System
param(
    [string]$RepoUrl
)

$git = "C:\Users\moksh\.gemini\antigravity\scratch\mingit\cmd\git.exe"

if (-not $RepoUrl) {
    $RepoUrl = Read-Host "Enter your GitHub Repository URL (e.g. https://github.com/your-username/hostel-management-system.git)"
}

if (-not $RepoUrl) {
    Write-Host "No repository URL provided. Aborted." -ForegroundColor Red
    Exit
}

Write-Host "Linking remote origin..." -ForegroundColor Cyan
& $git remote remove origin 2>$null
& $git remote add origin $RepoUrl
& $git branch -M main

Write-Host "Pushing all files to GitHub repository..." -ForegroundColor Yellow
& $git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCCESS! All files pushed to GitHub." -ForegroundColor Green
    Write-Host "Now go to https://render.com or https://vercel.com to deploy with 1-click!" -ForegroundColor Green
} else {
    Write-Host "Push failed. Make sure you created the empty repository on GitHub first and have authentication permission." -ForegroundColor Red
}
