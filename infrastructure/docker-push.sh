#!/bin/bash
# Push Docker images to DockerHub

# Configuration
DOCKERHUB_USERNAME="${DOCKERHUB_USERNAME:-yourusername}"
IMAGE_VERSION="${IMAGE_VERSION:-latest}"

echo ""
echo "🚀 Pushing FleetMaster images to DockerHub"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Username: $DOCKERHUB_USERNAME"
echo "Version: $IMAGE_VERSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if logged in to DockerHub
if ! docker info | grep -q "Username"; then
    echo "❌ Not logged in to DockerHub"
    echo "Please run: docker login"
    exit 1
fi

echo "📦 Building and tagging images..."
echo ""

# Build and tag marketing site
echo "Building marketing-site..."
docker build -t ${DOCKERHUB_USERNAME}/fleetmaster-marketing:${IMAGE_VERSION} \
             -t ${DOCKERHUB_USERNAME}/fleetmaster-marketing:latest \
             --target production \
             ../apps/marketing-site

if [ $? -ne 0 ]; then
    echo "❌ Failed to build marketing-site"
    exit 1
fi

# Build and tag main app
echo "Building main-app..."
docker build -t ${DOCKERHUB_USERNAME}/fleetmaster-main:${IMAGE_VERSION} \
             -t ${DOCKERHUB_USERNAME}/fleetmaster-main:latest \
             --target production \
             ../apps/main-app

if [ $? -ne 0 ]; then
    echo "❌ Failed to build main-app"
    exit 1
fi

echo ""
echo "✅ Build complete!"
echo ""
echo "📤 Pushing images to DockerHub..."
echo ""

# Push marketing site
echo "Pushing marketing-site..."
docker push ${DOCKERHUB_USERNAME}/fleetmaster-marketing:${IMAGE_VERSION}
docker push ${DOCKERHUB_USERNAME}/fleetmaster-marketing:latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to push marketing-site"
    exit 1
fi

# Push main app
echo "Pushing main-app..."
docker push ${DOCKERHUB_USERNAME}/fleetmaster-main:${IMAGE_VERSION}
docker push ${DOCKERHUB_USERNAME}/fleetmaster-main:latest

if [ $? -ne 0 ]; then
    echo "❌ Failed to push main-app"
    exit 1
fi

echo ""
echo "✅ Successfully pushed all images to DockerHub!"
echo ""
echo "Images available at:"
echo "  - https://hub.docker.com/r/${DOCKERHUB_USERNAME}/fleetmaster-marketing"
echo "  - https://hub.docker.com/r/${DOCKERHUB_USERNAME}/fleetmaster-main"
echo ""

