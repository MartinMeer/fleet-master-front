@echo off
REM Start development environment with hot reload

echo.
echo 🚀 Starting FleetMaster in DEVELOPMENT mode...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Marketing Site: http://localhost:3000
echo Main App: http://localhost:3001
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

docker-compose -f docker-compose.dev.yml up --build

