@echo off
title SZI Optimization Server
echo Starting SZI Optimization Server...
echo Address: http://127.0.0.1:9934
echo.
:: Attempt to install dependencies if not present (with proxy bypass)
.venv\Scripts\python.exe -m pip install fastapi uvicorn pydantic python-multipart numpy pulp --proxy="" >nul 2>&1

:: Run the server
.venv\Scripts\python.exe app.py
pause
