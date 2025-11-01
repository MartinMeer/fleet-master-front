#!/bin/bash
# Make all shell scripts executable

echo ""
echo "🔧 Making all shell scripts executable..."
echo ""

chmod +x start-dev.sh
chmod +x start-prod.sh
chmod +x stop-dev.sh
chmod +x stop-prod.sh
chmod +x docker-push.sh

echo "✅ All scripts are now executable!"
echo ""
echo "You can now run:"
echo "  ./start-dev.sh   - Start development mode"
echo "  ./start-prod.sh  - Start production mode"
echo "  ./stop-dev.sh    - Stop development"
echo "  ./stop-prod.sh   - Stop production"
echo "  ./docker-push.sh - Push images to DockerHub"
echo ""

