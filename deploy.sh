#!/bin/bash

# 🚀 Pomodoro Timer - Nginx Deployment Script
# This script deploys the built application to nginx

set -e

# Configuration
NGINX_ROOT="/var/www/html"
BACKUP_DIR="/var/backups/pomodoro-timer"
SERVICE_NAME="nginx"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# Check if nginx is installed
check_nginx() {
    if ! command -v nginx &> /dev/null; then
        log_error "nginx is not installed. Please install nginx first."
        exit 1
    fi
    
    if ! systemctl is-active --quiet nginx; then
        log_warning "nginx is not running. Starting nginx..."
        systemctl start nginx
    fi
}

# Backup current deployment
backup_current() {
    if [ -d "$NGINX_ROOT" ] && [ "$(ls -A $NGINX_ROOT 2>/dev/null)" ]; then
        log_info "Creating backup of current deployment..."
        mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="backup-$(date +%Y%m%d_%H%M%S)"
        cp -r "$NGINX_ROOT" "$BACKUP_DIR/$BACKUP_NAME"
        log_success "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    else
        log_info "No existing deployment to backup"
    fi
}

# Deploy new files
deploy_files() {
    log_info "Deploying new files..."
    
    # Clear nginx directory
    rm -rf "$NGINX_ROOT"/*
    
    # Copy new files
    cp -r build/* "$NGINX_ROOT/"
    
    # Set correct permissions
    chown -R www-data:www-data "$NGINX_ROOT/"
    chmod -R 755 "$NGINX_ROOT/"
    
    log_success "Files deployed successfully"
}

# Test nginx configuration
test_nginx_config() {
    log_info "Testing nginx configuration..."
    if nginx -t; then
        log_success "Nginx configuration is valid"
    else
        log_error "Nginx configuration test failed"
        exit 1
    fi
}

# Reload nginx
reload_nginx() {
    log_info "Reloading nginx..."
    if systemctl reload nginx; then
        log_success "Nginx reloaded successfully"
    else
        log_error "Failed to reload nginx"
        exit 1
    fi
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check if index.html exists
    if [ -f "$NGINX_ROOT/index.html" ]; then
        log_success "index.html found"
    else
        log_error "index.html not found"
        exit 1
    fi
    
    # Check if static files exist
    if [ -d "$NGINX_ROOT/static" ]; then
        log_success "Static files directory found"
    else
        log_error "Static files directory not found"
        exit 1
    fi
    
    # Check service worker
    if [ -f "$NGINX_ROOT/service-worker.js" ]; then
        log_success "Service worker found"
    else
        log_warning "Service worker not found (optional)"
    fi
}

# Show deployment summary
show_summary() {
    echo ""
    echo "🎉 Deployment Summary"
    echo "===================="
    echo "📁 Deployed to: $NGINX_ROOT"
    echo "🌐 Access URL: http://$(hostname -I | awk '{print $1}')"
    echo "🔧 Nginx Status: $(systemctl is-active nginx)"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Configure your domain name to point to this server"
    echo "2. Set up SSL certificate (recommended)"
    echo "3. Configure firewall if needed"
    echo "4. Test the application in your browser"
    echo ""
    echo "🔄 Rollback Command:"
    echo "sudo $0 rollback"
    echo ""
}

# Rollback function
rollback() {
    log_info "Rolling back to previous deployment..."
    
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        log_error "No backup found for rollback"
        exit 1
    fi
    
    log_info "Restoring from backup: $LATEST_BACKUP"
    
    # Clear current deployment
    rm -rf "$NGINX_ROOT"/*
    
    # Restore from backup
    cp -r "$BACKUP_DIR/$LATEST_BACKUP/"* "$NGINX_ROOT/"
    
    # Set permissions
    chown -R www-data:www-data "$NGINX_ROOT/"
    chmod -R 755 "$NGINX_ROOT/"
    
    # Reload nginx
    systemctl reload nginx
    
    log_success "Rollback completed successfully"
}

# Main deployment function
deploy() {
    log_info "Starting Pomodoro Timer deployment..."
    
    check_root
    check_nginx
    backup_current
    deploy_files
    test_nginx_config
    reload_nginx
    verify_deployment
    show_summary
    
    log_success "🚀 Deployment completed successfully!"
}

# Parse command line arguments
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [deploy|rollback|help]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy the application (default)"
        echo "  rollback - Rollback to previous deployment"
        echo "  help     - Show this help message"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac
