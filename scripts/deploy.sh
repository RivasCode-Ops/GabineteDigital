#!/bin/sh
# Deploy script — runs on the VPS after CI/CD pushes the image
set -e

cd /opt/gabinete-digital || {
  echo "Directory /opt/gabinete-digital not found"
  exit 1
}

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Pulling latest image..."
docker compose -f docker-compose.prod.yml pull app

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Running database migrations..."
docker compose -f docker-compose.prod.yml run --rm app npx prisma migrate deploy

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Restarting app..."
docker compose -f docker-compose.prod.yml up -d --no-deps --force-recreate app

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Waiting for health check..."
sleep 10

HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health/live)
if [ "$HEALTH" = "200" ]; then
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ✅ Deploy successful (health: $HEALTH)"
else
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Health check failed (status: $HEALTH)"
  docker compose -f docker-compose.prod.yml logs --tail=20 app
  exit 1
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cleaning old images..."
docker image prune -f
