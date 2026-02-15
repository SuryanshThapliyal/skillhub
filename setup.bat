@echo off
REM SkillHub Setup Script for Windows

echo.
echo ====================================
echo   SkillHub Setup Script
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found!
echo.

REM Install dependencies
echo Installing dependencies...
echo.
call npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ====================================
echo   ✓ Setup Complete!
echo ====================================
echo.
echo To start the server, run:
echo   npm start
echo.
echo Then open in your browser:
echo   - Main Site: http://localhost:3000/index.html
echo   - Admin Dashboard: http://localhost:3000/admin.html
echo.
pause
