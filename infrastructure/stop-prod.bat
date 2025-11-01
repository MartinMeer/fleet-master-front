@echo off
REM Stop production environment

echo.
echo 🛑 Stopping production environment...
docker-compose -f docker-compose.yml down
echo Done!

