#!/bin/bash

# Doc2MD Backend Deployment Script
# This script is triggered by CI/CD to deploy the backend services
#
# Usage:
#   ./scripts/deploy.sh           # Development mode
#   ./scripts/deploy.sh prod      # Production mode
#
# Note: Frontend is deployed separately on Vercel

set -e

# Check if running in production mode
# Parse arguments
FAST_MODE=false

# Loop through all arguments
for arg in "$@"; do
    case $arg in
        -f|--fast)
        FAST_MODE=true
        shift # Remove --fast from processing
        ;;
        prod|production)
        ENV_MODE="prod"
        shift
        ;;
    esac
done

if [ "$ENV_MODE" = "prod" ] || [ "$ENV_MODE" = "production" ]; then
    echo "🚀 Starting Doc2MD backend deployment (PRODUCTION MODE)..."
    ENV_FILE="--env-file docker/.env.prod"

    # Check if production config exists
    if [ ! -f "docker/.env.prod" ]; then
        echo "❌ Error: docker/.env.prod not found!"
        echo "Please create it from docker/.env.production template"
        exit 1
    fi
else
    echo "🚀 Starting Doc2MD backend deployment (DEVELOPMENT MODE)..."
fi

if [ "$FAST_MODE" = "true" ]; then
    echo "⚡ FAST MODE: Skipping cleanup and extra checks."
fi

# Navigate to project directory
cd "$(dirname "$0")/.." || exit 1

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# Note: We rely on Docker's smart build caching and restart policies.
# We do NOT run 'docker compose down' to avoid downtime and unnecessary container reconstruction.

# Build and start backend services only
echo "🏗️  Building and starting backend services (API + Worker + Redis)..."
docker compose $ENV_FILE up -d --build

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
if docker compose ps | grep -q "Up"; then
    echo "✅ Backend deployment successful!"
    echo ""
    echo "📊 Running services:"
    docker compose ps
    echo ""
    echo "📊 Service URLs:"
    echo "  - Backend API: http://localhost:8200"
    echo "  - API Docs: http://localhost:8200/docs"
    echo "  - Redis: localhost:6380"
else
    echo "❌ Deployment failed! Some services are not running."
    echo "📋 Recent logs:"
    docker compose logs --tail=50
    exit 1
fi

# Clean up (Skipped in fast mode)
if [ "$FAST_MODE" = "false" ]; then
    echo "🧹 Cleaning up unused Docker resources..."
    docker image prune -f
else
    echo "⚡ FAST MODE: Skipping image pruning."
fi

echo ""
echo "✅ Backend deployment completed successfully!"
echo ""
echo "ℹ️  Note: Frontend is deployed separately on Vercel"
