#!/bin/bash
set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

install_deps() {
    print_status "Installing dependencies..."
    npm install --legacy-peer-deps > /dev/null 2>&1
    print_success "Dependencies installed!"
}

start_database() {
    print_status "Starting PostgreSQL database..."
    docker-compose up -d postgres

    print_status "Waiting for database to be ready..."
    until docker exec atithi-postgres pg_isready -U postgres > /dev/null 2>&1; do
        sleep 1
    done
    print_success "Database is ready!"
}

run_migrations() {
    print_status "Running database migrations..."
    cd apps/api && npm run build > /dev/null 2>&1 && npm run db:migrate && cd ../..
    print_success "Migrations completed!"
}

start_apps() {
    print_status "Starting all applications with Turbo..."
    npm run dev:only
}

main() {
    print_status "Setting up development environment..."
    check_docker
    install_deps
    start_database
    # run_migrations  # Uncomment after first migration is created
    start_apps
    print_success "Development environment is ready!"
}

case "${1:-all}" in
    "deps") install_deps ;;
    "db") check_docker && start_database ;;
    "migrate") run_migrations ;;
    "apps") start_apps ;;
    "all"|*) main ;;
esac
