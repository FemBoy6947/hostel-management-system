@echo off
setlocal
echo =======================================================
echo   Pushing to https://github.com/FemBoy6947/hostel-management-system
echo =======================================================

set GIT_PATH=C:\Users\moksh\.gemini\antigravity\scratch\mingit\cmd\git.exe

echo.
echo Pushing all files to main branch on GitHub...
"%GIT_PATH%" push -u origin main --force

if %ERRORLEVEL% equ 0 (
    echo.
    echo =======================================================
    echo  SUCCESS! All code is now live on your GitHub repo!
    echo =======================================================
) else (
    echo.
    echo Please follow the GitHub sign-in prompt.
)

pause
