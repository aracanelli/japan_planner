@echo off
echo Starting Japan Planner...

:: Navigate to the app directory
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

:: Start the Next.js development server in the background
echo Starting Next.js development server...
start cmd /c "npm run dev"

:: Wait for server to start
echo Waiting for server to start...
timeout /t 5 /nobreak > nul

:: Open the browser
start http://localhost:3000

echo.
echo Japan Planner has been started! Open your browser if it hasn't opened automatically.
echo.
echo Press any key to close this window (the app will continue running)...
pause > nul 