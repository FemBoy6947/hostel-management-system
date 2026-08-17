@echo off
setlocal
echo =======================================================
echo   Pushing to https://github.com/FemBoy6947/hostel-management-system
echo =======================================================

set GIT_PATH=C:\Users\moksh\.gemini\antigravity\scratch\mingit\cmd\git.exe

echo.
echo Pushing code to main branch on GitHub...
"%GIT_PATH%" push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo =======================================================
    echo  SUCCESS! All code is now live on your GitHub repo!
    echo  Go to https://render.com to deploy it 24/7 for free!
    echo =======================================================
) else (
    echo.
    echo If prompted, please enter your GitHub Username and Password/Personal Access Token.
)

pause
