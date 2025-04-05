@echo off
echo Starting Japan Planner Diagnostic Tool...

:: Change to the directory of the batch file
cd /d "%~dp0"

:: Check if log directory exists and create if not
if not exist logs mkdir logs

:: Create a timestamped log file
set log_file=logs\diagnostic-%date:~-4,4%%date:~-7,2%%date:~-10,2%-%time:~0,2%%time:~3,2%%time:~6,2%.log
set log_file=%log_file: =0%

:: Redirect output to log file
echo Japan Planner Diagnostic Log - %date% %time% > %log_file%
echo --------------------------------------------- >> %log_file%

:: Run the electron diagnostic app with output to log
echo Running the diagnostic tool (check %log_file% for details)
echo.
npx electron simple-app.js >> %log_file% 2>&1

:: Check for errors
if %errorlevel% neq 0 (
  echo Error: The diagnostic tool crashed or failed to start.
  echo Check the log file at %log_file% for details.
  echo.
  echo Press any key to exit...
  pause > nul
) else (
  echo.
  echo The diagnostic tool has closed.
  echo.
  echo Press any key to exit...
  pause > nul
) 