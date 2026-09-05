@echo off
echo ===================================================
echo Starting CollegeConnect (Backend + Frontend)
echo ===================================================

echo [1/2] Launching Backend Server on port 5000...
start "CollegeConnect Backend (Port 5000)" cmd /k "cd /d %~dp0server && node index.js"

timeout /t 2 >nul

echo [2/2] Launching Frontend Dev Server on port 5173...
start "CollegeConnect Frontend (Port 5173)" cmd /k "cd /d %~dp0 && npm run dev"

timeout /t 2 >nul

echo Opening browser at http://localhost:5173...
start http://localhost:5173

echo ===================================================
echo CollegeConnect is running!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:5000
echo ===================================================
pause
