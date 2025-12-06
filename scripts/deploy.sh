#!/bin/bash

# Doc2MD Backend Deployment Script
# This script is triggered by CI/CD to deploy the backend services
#
# Note: Frontend is deployed separately on Vercel

set -e

echo "🚀 Starting Doc2MD backend deployment..."

# Navigate to project directory
cd "$(dirname "$0")/.." || exit 1

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# Stop existing services
echo "🛑 Stopping existing backend services..."
docker compose down

# Remove old images
echo "🧹 Cleaning up old images..."
docker image prune -f

# Build and start backend services only
echo "🏗️  Building and starting backend services (API + Worker + Redis)..."
docker compose up -d --build

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
    echo "  - Backend API: http://localhost:8100"
    echo "  - API Docs: http://localhost:8100/docs"
    echo "  - Redis: localhost:6380"
else
    echo "❌ Deployment failed! Some services are not running."
    echo "📋 Recent logs:"
    docker compose logs --tail=50
    exit 1
fi

# Clean up
echo "🧹 Cleaning up unused Docker resources..."
docker system prune -f

echo ""
echo "✅ Backend deployment completed successfully!"
echo ""
echo "ℹ️  Note: Frontend is deployed separately on Vercel"
