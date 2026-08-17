@echo off
setlocal
echo =======================================================
echo  Hostel Management System - 1-Click Push to GitHub
echo =======================================================
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/hostel-management-system.git): "

if "%REPO_URL%"=="" (
    echo No URL provided. Aborting.
    pause
    exit /b
)

set GIT_PATH=C:\Users\moksh\.gemini\antigravity\scratch\mingit\cmd\git.exe

echo.
echo Linking repository to %REPO_URL%...
"%GIT_PATH%" remote remove origin 2>nul
"%GIT_PATH%" remote add origin %REPO_URL%
"%GIT_PATH%" branch -M main

echo.
echo Pushing code to GitHub...
"%GIT_PATH%" push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo =======================================================
    echo  SUCCESS: Code pushed to GitHub!
    echo  Now deploy 24/7 on https://render.com for free!
    echo =======================================================
) else (
    echo.
    echo Push failed. Please check your GitHub repository URL or credentials.
)

pause
