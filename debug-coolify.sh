#!/bin/bash

# Coolify Deployment Debug Script
# Run this script on your Coolify server or use the commands individually

echo "=================================="
echo "FastBite Coolify Deployment Debug"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Find the FastBite container
echo "1. Finding FastBite container..."
CONTAINER_ID=$(docker ps -a | grep fastbite | grep -v grep | awk '{print $1}' | head -1)

if [ -z "$CONTAINER_ID" ]; then
    echo -e "${RED}ERROR: No FastBite container found!${NC}"
    echo "Try: docker ps -a | grep fastbite"
    exit 1
fi

echo -e "${GREEN}Found container: $CONTAINER_ID${NC}"
echo ""

# Check if container is running
echo "2. Checking container status..."
STATUS=$(docker inspect -f '{{.State.Status}}' $CONTAINER_ID)
echo "Status: $STATUS"

if [ "$STATUS" != "running" ]; then
    echo -e "${YELLOW}WARNING: Container is not running!${NC}"
fi
echo ""

# Check container logs
echo "3. Recent container logs (last 50 lines)..."
echo "-------------------------------------------"
docker logs --tail 50 $CONTAINER_ID
echo "-------------------------------------------"
echo ""

# Check if server.js exists
echo "4. Checking if server.js exists..."
docker exec $CONTAINER_ID ls -la /app/server.js 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ server.js exists${NC}"
else
    echo -e "${RED}✗ server.js NOT FOUND${NC}"
fi
echo ""

# Check environment variables (critical ones)
echo "5. Checking critical environment variables..."
echo "-------------------------------------------"
docker exec $CONTAINER_ID printenv | grep -E "CONVEX|LOGTO|PORT|NODE_ENV" | sort
echo "-------------------------------------------"
echo ""

# Check if process is running
echo "6. Checking running processes..."
docker exec $CONTAINER_ID ps aux 2>/dev/null || echo "Cannot access container processes"
echo ""

# Test internal health endpoint
echo "7. Testing internal health endpoint..."
docker exec $CONTAINER_ID wget -qO- http://localhost:3000/api/health 2>/dev/null || echo -e "${RED}Health endpoint not responding${NC}"
echo ""

# Check port bindings
echo "8. Checking port bindings..."
docker port $CONTAINER_ID 2>/dev/null || echo "No ports exposed"
echo ""

# Check container restart count
echo "9. Checking container restart count..."
RESTART_COUNT=$(docker inspect -f '{{.RestartCount}}' $CONTAINER_ID)
echo "Restart count: $RESTART_COUNT"
if [ "$RESTART_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}WARNING: Container has restarted $RESTART_COUNT times!${NC}"
fi
echo ""

echo "=================================="
echo "Debug Information Summary"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Check the logs above for error messages"
echo "2. Verify all CONVEX_* environment variables are set"
echo "3. Ensure CONVEX_WEBHOOK_SIGNING_SECRET is present"
echo "4. Check if external services are accessible:"
echo "   - curl https://backend.usa-solarenergy.com"
echo "   - curl https://auth.usa-solarenergy.com/.well-known/openid-configuration"
echo ""
echo "If you see 'CONVEX_WEBHOOK_SIGNING_SECRET is required' in logs:"
echo "→ Add this to Coolify environment variables:"
echo "   CONVEX_WEBHOOK_SIGNING_SECRET=08f30d1a46c8abff1109fc7d03f03d8850d81e7003e1fa60210bf8329d887d8d"
echo ""
