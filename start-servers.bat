@echo off
echo ========================================
echo   Starting Animora Web Services
echo ========================================
echo.

echo Starting Backend API Server...
start "Animora Backend" cmd /k "cd animora-ai\backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Web Server...
start "Animora Web" cmd /k "node server.js"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo Main Website: http://localhost:8080
echo Admin Panel:  http://localhost:8080/admin/
echo AI Chat:      http://localhost:8080/animora-ai/chat.html
echo Backend API:  http://localhost:4001
echo.
echo Press any key to open the website...
pause >nul
start http://localhost:8080
