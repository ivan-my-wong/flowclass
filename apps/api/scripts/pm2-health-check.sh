#!/bin/bash
# PM2 Health Check Script
# This script checks if the application is healthy by calling the health endpoint
# PM2 will restart the application if this script exits with a non-zero code

APP_PORT=${APP_PORT:-5000}
HEALTH_URL="http://localhost:${APP_PORT}/health"
MAX_RETRIES=3
RETRY_DELAY=2

for i in $(seq 1 $MAX_RETRIES); do
  # Check if the health endpoint responds successfully
  if curl -f -s -m 5 "$HEALTH_URL" > /dev/null 2>&1; then
    exit 0
  fi
  
  if [ $i -lt $MAX_RETRIES ]; then
    sleep $RETRY_DELAY
  fi
done

# If all retries failed, exit with error code
echo "Health check failed: Application is not responding at $HEALTH_URL"
exit 1

