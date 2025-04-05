@echo off
echo Starting Japan Planner...

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

:: Check if log directory exists and create if not
if not exist logs mkdir logs

:: Create a timestamped log file
set log_file=logs\japan-planner-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%%time:~6,2%.log
set log_file=%log_file: =0%

:: Start the Next.js development server in the background
echo Starting Next.js development server...
start /B cmd /c "npm run dev > %log_file% 2>&1"

:: Wait for the server to start
echo Waiting for server to start...
timeout /t 5 /nobreak > nul

:: Open the default browser to the app URL
echo Opening Japan Planner in your browser...
start http://localhost:3000

echo.
echo Japan Planner is running.
echo To close the application, close your browser window and press Ctrl+C in this window.
echo.
echo Press any key to close this window (this will NOT stop the app)...
pause > nul 