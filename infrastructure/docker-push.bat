@echo off
REM Push Docker images to DockerHub

REM Configuration
IF "%DOCKERHUB_USERNAME%"=="" SET DOCKERHUB_USERNAME=yourusername
IF "%IMAGE_VERSION%"=="" SET IMAGE_VERSION=latest

echo.
echo 🚀 Pushing FleetMaster images to DockerHub
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo Username: %DOCKERHUB_USERNAME%
echo Version: %IMAGE_VERSION%
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Check if logged in to DockerHub
docker info | findstr /C:"Username" >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Not logged in to DockerHub
    echo Please run: docker login
    exit /b 1
)

echo 📦 Building and tagging images...
echo.

REM Build and tag marketing site
echo Building marketing-site...
docker build -t %DOCKERHUB_USERNAME%/fleetmaster-marketing:%IMAGE_VERSION% -t %DOCKERHUB_USERNAME%/fleetmaster-marketing:latest --target production ../apps/marketing-site

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to build marketing-site
    exit /b 1
)

REM Build and tag main app
echo Building main-app...
docker build -t %DOCKERHUB_USERNAME%/fleetmaster-main:%IMAGE_VERSION% -t %DOCKERHUB_USERNAME%/fleetmaster-main:latest --target production ../apps/main-app

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to build main-app
    exit /b 1
)

echo.
echo ✅ Build complete!
echo.
echo 📤 Pushing images to DockerHub...
echo.

REM Push marketing site
echo Pushing marketing-site...
docker push %DOCKERHUB_USERNAME%/fleetmaster-marketing:%IMAGE_VERSION%
docker push %DOCKERHUB_USERNAME%/fleetmaster-marketing:latest

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to push marketing-site
    exit /b 1
)

REM Push main app
echo Pushing main-app...
docker push %DOCKERHUB_USERNAME%/fleetmaster-main:%IMAGE_VERSION%
docker push %DOCKERHUB_USERNAME%/fleetmaster-main:latest

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to push main-app
    exit /b 1
)

echo.
echo ✅ Successfully pushed all images to DockerHub!
echo.
echo Images available at:
echo   - https://hub.docker.com/r/%DOCKERHUB_USERNAME%/fleetmaster-marketing
echo   - https://hub.docker.com/r/%DOCKERHUB_USERNAME%/fleetmaster-main
echo.

