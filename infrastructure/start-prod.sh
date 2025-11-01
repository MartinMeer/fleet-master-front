#!/bin/bash
# Start production environment

echo ""
echo "🚀 Starting FleetMaster in PRODUCTION mode..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Access via Gateway: http://localhost"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

docker-compose -f docker-compose.yml up --build

