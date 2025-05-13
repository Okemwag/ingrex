#!/bin/sh
set -e

# Function to wait for service to be ready
wait_for_service() {
    local host="$1"
    local port="$2"
    local service="$3"
    local timeout="${4:-30}"
    local waited=0

    echo "Waiting for $service at $host:$port..."
    while ! nc -z "$host" "$port" > /dev/null 2>&1; do
        if [ "$waited" -ge "$timeout" ]; then
            echo "Error: Timed out waiting for $service at $host:$port"
            exit 1
        fi
        sleep 1
        waited=$((waited+1))
        echo "Still waiting for $service... ($waited s)"
    done

    echo "$service is available at $host:$port"
}

# Run database migrations if required
run_migrations() {
    if [ "$RUN_MIGRATIONS" = "true" ]; then
        echo "Running database migrations..."
        npx typeorm migration:run -d dist/database/data-source.js
        echo "Migrations complete!"
    fi
}

# Wait for dependent services if needed
if [ "$WAIT_FOR_SERVICES" = "true" ]; then
    # Wait for PostgreSQL
    if [ -n "$POSTGRES_HOST" ] && [ -n "$POSTGRES_PORT" ]; then
        wait_for_service "$POSTGRES_HOST" "$POSTGRES_PORT" "PostgreSQL" 60
    fi

    # Wait for Redis
    if [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PORT" ]; then
        wait_for_service "$REDIS_HOST" "$REDIS_PORT" "Redis" 30
    fi

    # Wait for Elasticsearch
    if [ -n "$ELASTICSEARCH_HOST" ] && [ -n "$ELASTICSEARCH_PORT" ]; then
        wait_for_service "$ELASTICSEARCH_HOST" "$ELASTICSEARCH_PORT" "Elasticsearch" 90
    fi
    
    # Wait for any other services here...
fi

# Run migrations if configured
run_migrations

# Determine startup command based on environment
if [ "$NODE_ENV" = "development" ]; then
    echo "Starting application in development mode..."
    npx nest start --watch
elif [ "$NODE_ENV" = "test" ]; then
    echo "Starting application in test mode..."
    npm run test
else
    # Production mode
    if [ "$CLUSTERING_ENABLED" = "true" ]; then
        echo "Starting application in production mode with clustering..."
        node dist/main-cluster.js
    else
        echo "Starting application in production mode..."
        node dist/main.js
    fi
fi