@echo off
echo Starting Japan Planner Desktop App...

:: Change to the directory of the batch file
cd /d "%~dp0"

:: Kill any processes using port 3000
echo Checking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
  echo Found process with PID: %%a using port 3000
  echo Terminating process...
  taskkill /F /PID %%a
  echo Process terminated.
)
echo Port 3000 is now free.

:: Run the diagnostic app with the desktop title
npx electron -r ./simple-desktop.js

echo.
echo The Japan Planner Desktop App has closed.
echo.
echo Press any key to exit...
pause > nul 