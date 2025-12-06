#!/bin/bash

# Doc2MD Development Script
# This script starts all services for local development
#
# Usage:
#   ./scripts/dev.sh           # Start backend + frontend
#   ./scripts/dev.sh -b        # Start backend only
#   ./scripts/dev.sh -f        # Start frontend only

set -e

# Parse arguments
BACKEND_ONLY=false
FRONTEND_ONLY=false

while getopts "bf" opt; do
    case $opt in
        b) BACKEND_ONLY=true ;;
        f) FRONTEND_ONLY=true ;;
        *) echo "Usage: $0 [-b backend only] [-f frontend only]"; exit 1 ;;
    esac
done

# If both flags, treat as default (start both)
if [ "$BACKEND_ONLY" = true ] && [ "$FRONTEND_ONLY" = true ]; then
    BACKEND_ONLY=false
    FRONTEND_ONLY=false
fi

echo "🚀 Starting Doc2MD development environment..."

# Start Backend
if [ "$FRONTEND_ONLY" = false ]; then
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi

    # Create .env files for backend if they don't exist
    echo "📝 Checking backend environment files..."

    if [ ! -f apps/backend/.env ]; then
        echo "Creating backend .env from example..."
        cp apps/backend/.env.example apps/backend/.env
    fi

    if [ ! -f apps/worker/.env ]; then
        echo "Creating worker .env from example..."
        cp apps/worker/.env.example apps/worker/.env
    fi

    # Start backend services (API + Worker + Redis)
    echo "🐳 Starting backend services with Docker Compose..."
    docker compose up -d

    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 5

    # Check service health
    echo "🏥 Checking service health..."
    docker compose ps

    echo ""
    echo "✅ Backend services are running!"
    echo ""
    echo "📊 Service URLs:"
    echo "  - Backend API: http://localhost:8100"
    echo "  - API Docs: http://localhost:8100/docs"
    echo "  - Redis: localhost:6380"
    echo ""
fi

# Start Frontend
if [ "$BACKEND_ONLY" = false ]; then
    # Create .env file for frontend if it doesn't exist
    if [ ! -f apps/frontend/.env.local ]; then
        echo "📝 Creating frontend .env.local from example..."
        cp apps/frontend/.env.example apps/frontend/.env.local
    fi

    echo "🎨 Starting frontend development server..."
    echo ""

    # Check if node_modules exists, install if needed
    if [ ! -d "apps/frontend/node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        (cd apps/frontend && pnpm install)
    fi

    # Start frontend (this will block the terminal)
    (cd apps/frontend && pnpm dev)
fi

# If backend only, show useful commands
if [ "$BACKEND_ONLY" = true ]; then
    echo "📋 Useful commands:"
    echo "  - View logs: bash scripts/logs.sh [service]"
    echo "  - Stop services: docker compose down"
    echo "  - Start frontend: bash scripts/dev.sh -f"
    echo ""
fi
