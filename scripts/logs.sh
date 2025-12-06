#!/bin/bash

# Doc2MD Logs Viewer
# View logs from all services or a specific service
#
# Usage:
#   ./scripts/logs.sh              # View all services logs
#   ./scripts/logs.sh backend      # View backend logs only
#   ./scripts/logs.sh worker       # View worker logs only
#   ./scripts/logs.sh redis        # View Redis logs only
#   ./scripts/logs.sh -n 100       # View last 100 lines from all services

# Parse arguments
TAIL_LINES=""
SERVICE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -n)
            TAIL_LINES="--tail=$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [service] [-n lines]"
            echo ""
            echo "Available services:"
            echo "  backend    - Backend API service"
            echo "  worker     - Worker service(s)"
            echo "  redis      - Redis service"
            echo ""
            echo "Options:"
            echo "  -n LINES   - Number of lines to show from the end"
            echo "  -h, --help - Show this help message"
            exit 0
            ;;
        *)
            SERVICE="$1"
            shift
            ;;
    esac
done

# Check if Docker Compose is running
if ! docker compose ps | grep -q "Up"; then
    echo "⚠️  No services are currently running."
    echo "Start services with: bash scripts/dev.sh"
    exit 1
fi

# View logs
if [ -z "$SERVICE" ]; then
    echo "📋 Viewing logs from all services..."
    docker compose logs -f $TAIL_LINES
else
    echo "📋 Viewing logs from $SERVICE..."
    docker compose logs -f $TAIL_LINES "$SERVICE"
fi
