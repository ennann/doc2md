#!/bin/bash

# Doc2MD Cleanup Script
# This script stops all services and cleans up resources
#
# Usage:
#   ./scripts/clean.sh           # Clean everything (Docker + frontend + cache)
#   ./scripts/clean.sh -d        # Clean Docker only (containers, images, volumes)
#   ./scripts/clean.sh -f        # Clean frontend only (build artifacts, node_modules)
#   ./scripts/clean.sh -c        # Clean cache only (Python cache)

set -e

# Parse arguments
DOCKER_ONLY=false
FRONTEND_ONLY=false
CACHE_ONLY=false
CLEAN_ALL=true

while getopts "dfc" opt; do
    case $opt in
        d) DOCKER_ONLY=true; CLEAN_ALL=false ;;
        f) FRONTEND_ONLY=true; CLEAN_ALL=false ;;
        c) CACHE_ONLY=true; CLEAN_ALL=false ;;
        *) echo "Usage: $0 [-d docker] [-f frontend] [-c cache]"; exit 1 ;;
    esac
done

echo "🧹 Cleaning up Doc2MD environment..."

# Clean Docker resources
if [ "$CLEAN_ALL" = true ] || [ "$DOCKER_ONLY" = true ]; then
    echo "🐳 Cleaning Docker resources..."

    # Stop and remove containers
    echo "  🛑 Stopping and removing containers..."
    docker compose down -v 2>/dev/null || true

    # Remove images
    echo "  🗑️  Removing Docker images..."
    docker compose down --rmi all 2>/dev/null || true

    # Clean up Docker system
    echo "  🧼 Cleaning up Docker system..."
    docker system prune -af --volumes 2>/dev/null || true

    echo "  ✅ Docker cleanup completed!"
fi

# Clean frontend build artifacts
if [ "$CLEAN_ALL" = true ] || [ "$FRONTEND_ONLY" = true ]; then
    echo "🎨 Cleaning frontend build artifacts..."

    if [ -d "apps/frontend/.next" ]; then
        rm -rf apps/frontend/.next
        echo "  - Removed .next directory"
    fi

    if [ -d "apps/frontend/node_modules" ]; then
        rm -rf apps/frontend/node_modules
        echo "  - Removed node_modules"
    fi

    echo "  ✅ Frontend cleanup completed!"
fi

# Clean Python cache
if [ "$CLEAN_ALL" = true ] || [ "$CACHE_ONLY" = true ]; then
    echo "🐍 Cleaning Python cache..."
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -type f -name "*.pyc" -delete 2>/dev/null || true
    echo "  ✅ Cache cleanup completed!"
fi

echo ""
echo "✅ Cleanup completed!"
