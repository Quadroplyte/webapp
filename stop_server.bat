@echo off
title Stop SZI Server
echo Stopping SZI Optimization Server (port 9934)...

:: Find process ID using the port and kill it
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9934 ^| findstr LISTENING') do (
    taskkill /f /pid %%a
    echo Process %%a stopped.
)

echo.
echo Server should be closed now.
pause
