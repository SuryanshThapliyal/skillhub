@echo off
REM SkillHub Start Script

echo.
echo ====================================
echo   Starting SkillHub Server
echo ====================================
echo.
echo Server will start on: http://localhost:3000
echo.
echo Access:
echo   - Main Site: http://localhost:3000/index.html
echo   - Admin Dashboard: http://localhost:3000/admin.html
echo.
echo Press Ctrl+C to stop the server
echo.
echo ====================================
echo.

call npm start
