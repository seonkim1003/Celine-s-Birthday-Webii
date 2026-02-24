@echo off
cd /d "%~dp0"
echo Pulling from origin main...
git pull origin main
if errorlevel 1 (
  echo Pull had conflicts or failed. Check output above.
  pause
  exit /b 1
)
echo Pushing to origin main...
git push origin main
if errorlevel 1 (
  echo Push failed. Check output above.
  pause
  exit /b 1
)
echo Done.
pause
