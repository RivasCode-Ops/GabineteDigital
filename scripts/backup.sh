#!/bin/sh
# Daily backup script — runs inside Docker container
# Usage: backup.sh [--s3]

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
FILENAME="gabinete_${TIMESTAMP}"
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-gabinete}"
DB_NAME="${DB_NAME:-gabinete_digital}"

mkdir -p "$BACKUP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup: $FILENAME"

# 1. Dump PostgreSQL
PGPASSWORD="${DB_PASS}" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-acl \
  -f "${BACKUP_DIR}/${FILENAME}.dump"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] DB dump complete: ${FILENAME}.dump ($(ls -lh "${BACKUP_DIR}/${FILENAME}.dump" | awk '{print $5}'))"

# 2. Export as SQL for portability
PGPASSWORD="${DB_PASS}" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --no-acl \
  -f "${BACKUP_DIR}/${FILENAME}.sql"

gzip -f "${BACKUP_DIR}/${FILENAME}.sql"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] SQL backup complete"

# 3. Rotate — keep last 7 days
find "$BACKUP_DIR" -name "gabinete_*.dump" -mtime +7 -delete
find "$BACKUP_DIR" -name "gabinete_*.sql.gz" -mtime +7 -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup rotation complete (kept 7 days)"

# 4. Optional: S3 sync
if [ "$1" = "--s3" ] && [ -n "$AWS_S3_BUCKET" ]; then
  if command -v aws >/dev/null 2>&1; then
    aws s3 sync "$BACKUP_DIR" "s3://${AWS_S3_BUCKET}/backups/" --exclude "*" --include "*.dump" --include "*.sql.gz"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Synced to S3: s3://${AWS_S3_BUCKET}/backups/"
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] AWS CLI not found, skipping S3 sync"
  fi
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete: $FILENAME"
