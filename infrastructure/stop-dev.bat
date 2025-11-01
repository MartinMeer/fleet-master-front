@echo off
REM Stop development environment

echo.
echo 🛑 Stopping development environment...
docker-compose -f docker-compose.dev.yml down
echo Done!

