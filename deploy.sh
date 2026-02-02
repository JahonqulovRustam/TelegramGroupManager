#!/bin/bash
set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
CURRENT_DEPLOY="$BACKUP_DIR/current"
PREVIOUS_DEPLOY="$BACKUP_DIR/previous"
DOCKER_IMAGE="${DOCKER_IMAGE:-telegram-group-crm}"
DOCKER_TAG="${DOCKER_TAG:-latest}"
CONTAINER_NAME="telegram-group-crm"
PORT="${PORT:-3000}"

# Functions
log() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

create_backup() {
  log "Creating backup..."
  mkdir -p "$BACKUP_DIR"
  
  # Backup current if it exists
  if [ -d "$CURRENT_DEPLOY" ]; then
    rm -rf "$PREVIOUS_DEPLOY"
    mv "$CURRENT_DEPLOY" "$PREVIOUS_DEPLOY"
    log "Previous deployment backed up to $PREVIOUS_DEPLOY"
  fi
  
  mkdir -p "$CURRENT_DEPLOY"
}

build_image() {
  log "Building Docker image..."
  docker build -t "$DOCKER_IMAGE:$DOCKER_TAG" .
  if [ $? -eq 0 ]; then
    log "Image built successfully"
  else
    error "Failed to build Docker image"
    exit 1
  fi
}

health_check() {
  local max_attempts=30
  local attempt=1
  
  log "Performing health checks..."
  while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:$PORT > /dev/null 2>&1; then
      log "Health check passed"
      return 0
    fi
    echo "  Attempt $attempt/$max_attempts..."
    sleep 1
    attempt=$((attempt + 1))
  done
  
  error "Health check failed"
  return 1
}

deploy() {
  log "Stopping old container..."
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm $CONTAINER_NAME 2>/dev/null || true
  
  log "Starting new container..."
  docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:3000 \
    --restart unless-stopped \
    "$DOCKER_IMAGE:$DOCKER_TAG"
  
  sleep 2
  
  if health_check; then
    log "Deployment successful!"
    return 0
  else
    error "Deployment health check failed"
    rollback
    exit 1
  fi
}

rollback() {
  error "Rolling back to previous deployment..."
  
  if [ ! -d "$PREVIOUS_DEPLOY" ]; then
    error "No previous deployment to rollback to"
    exit 1
  fi
  
  docker stop $CONTAINER_NAME 2>/dev/null || true
  docker rm $CONTAINER_NAME 2>/dev/null || true
  
  # Re-run previous image (you'd need to save image tags or use registry)
  warn "Manual rollback needed: restore from backup at $PREVIOUS_DEPLOY"
  exit 1
}

# Main execution
log "Starting deployment process..."
create_backup
build_image
deploy

log "Deployment complete!"
