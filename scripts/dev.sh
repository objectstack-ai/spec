#!/usr/bin/env bash
# ObjectStack Development Helper Script
# Simplifies common development tasks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored messages
info() { echo -e "${BLUE}ℹ ${NC}$1"; }
success() { echo -e "${GREEN}✓ ${NC}$1"; }
warning() { echo -e "${YELLOW}⚠ ${NC}$1"; }
error() { echo -e "${RED}✗ ${NC}$1"; }

# Show help
show_help() {
    cat << EOF
${BLUE}ObjectStack Development Helper${NC}

${GREEN}Usage:${NC}
  ./scripts/dev.sh <command> [options]

${GREEN}Commands:${NC}
  setup           - Initialize development environment
  dev [package]   - Start development mode (watch mode)
  build [package] - Build package(s)
  test [package]  - Run tests for package(s)
  clean           - Clean all build artifacts
  doctor          - Check development environment health
  create <type>   - Create new package/plugin/example
  link            - Link all workspace packages
  help            - Show this help message

${GREEN}Examples:${NC}
  ./scripts/dev.sh setup              # Setup development environment
  ./scripts/dev.sh dev spec           # Watch mode for @objectstack/spec
  ./scripts/dev.sh build cli          # Build @objectstack/cli
  ./scripts/dev.sh test spec          # Test @objectstack/spec
  ./scripts/dev.sh create plugin      # Create new plugin from template
  ./scripts/dev.sh doctor             # Check environment health

EOF
}

# Check environment health
check_health() {
    info "Running environment health check..."
    echo ""

    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        success "Node.js: $NODE_VERSION"
    else
        error "Node.js not found. Please install Node.js >= 18.0.0"
        exit 1
    fi

    # Check pnpm
    if command -v pnpm &> /dev/null; then
        PNPM_VERSION=$(pnpm -v)
        success "pnpm: $PNPM_VERSION"
    else
        error "pnpm not found. Please install: npm install -g pnpm@10.28.1"
        exit 1
    fi

    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        success "Dependencies installed"
    else
        warning "Dependencies not installed. Run: pnpm install"
    fi

    # Check if packages are built
    if [ -d "packages/spec/dist" ]; then
        success "Core packages built"
    else
        warning "Core packages not built. Run: pnpm build"
    fi

    echo ""
    success "Environment health check completed"
}

# Setup development environment
setup_dev() {
    info "Setting up development environment..."
    echo ""

    # Install dependencies
    info "Installing dependencies..."
    pnpm install

    # Build core packages
    info "Building core packages..."
    pnpm --filter @objectstack/spec build

    # Link packages
    info "Linking workspace packages..."
    pnpm install

    echo ""
    success "Development environment ready!"
    info "Next steps:"
    echo "  - Run './scripts/dev.sh dev spec' to start watch mode"
    echo "  - Run './scripts/dev.sh test spec' to run tests"
    echo "  - Run './scripts/dev.sh doctor' to check health"
}

# Start development mode
start_dev() {
    local PACKAGE=$1
    
    if [ -z "$PACKAGE" ]; then
        info "Starting development mode for all packages..."
        pnpm dev
    else
        info "Starting development mode for @objectstack/$PACKAGE..."
        pnpm --filter "@objectstack/$PACKAGE" dev
    fi
}

# Build packages
build_packages() {
    local PACKAGE=$1
    
    if [ -z "$PACKAGE" ]; then
        info "Building all packages..."
        pnpm build
    else
        info "Building @objectstack/$PACKAGE..."
        pnpm --filter "@objectstack/$PACKAGE" build
    fi
}

# Run tests
run_tests() {
    local PACKAGE=$1
    
    if [ -z "$PACKAGE" ]; then
        info "Running all tests..."
        pnpm test
    else
        info "Running tests for @objectstack/$PACKAGE..."
        pnpm --filter "@objectstack/$PACKAGE" test
    fi
}

# Clean build artifacts
clean_all() {
    info "Cleaning all build artifacts..."
    pnpm clean
    success "Clean completed"
}

# Create new package/plugin/example
create_new() {
    local TYPE=$1
    
    case $TYPE in
        plugin)
            info "Creating new plugin..."
            pnpm --filter @objectstack/cli create plugin
            ;;
        example)
            info "Creating new example..."
            pnpm --filter @objectstack/cli create example
            ;;
        package)
            info "Creating new package..."
            pnpm --filter @objectstack/cli create package
            ;;
        *)
            error "Unknown type: $TYPE"
            echo "Available types: plugin, example, package"
            exit 1
            ;;
    esac
}

# Link workspace packages
link_packages() {
    info "Linking workspace packages..."
    pnpm install
    success "Packages linked"
}

# Main command router
case "${1:-help}" in
    setup)
        setup_dev
        ;;
    dev)
        start_dev "$2"
        ;;
    build)
        build_packages "$2"
        ;;
    test)
        run_tests "$2"
        ;;
    clean)
        clean_all
        ;;
    doctor)
        check_health
        ;;
    create)
        create_new "$2"
        ;;
    link)
        link_packages
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
