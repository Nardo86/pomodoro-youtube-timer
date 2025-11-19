# 🚀 Deployment Guide

## Automated Build & Deployment

This project now includes automated GitHub Actions workflows that build the application and create deployment packages ready for nginx.

### 🔄 What Happens Automatically

When you push to `main`/`master` branch or create a pull request:

1. **CI Pipeline** (`.github/workflows/ci-cd.yml`):
   - ✅ Tests on Node.js 18.x and 20.x
   - 🔍 Security vulnerability scanning
   - 📊 Bundle size analysis
   - 🏗️ Production build

2. **Build & Deploy** (`.github/workflows/build-deploy.yml`):
   - 📦 Creates nginx-ready deployment packages
   - 📋 Generates deployment instructions
   - 🎯 Preview environments for pull requests

### 📦 Getting the Deployment Package

#### Option 1: GitHub Actions (Recommended)
1. Go to your repository's **Actions** tab
2. Select the latest workflow run
3. Download the `nginx-deployment-package` artifact
4. Extract and deploy to nginx

#### Option 2: Manual Build
```bash
# Clone and build
git clone https://github.com/Nardo86/pomodoro-youtube-timer.git
cd pomodoro-youtube-timer
npm install
npm run build

# The build/ folder contains everything you need
```

## 🛠️ Nginx Deployment

### Quick Deployment

1. **Download the deployment package** from GitHub Actions
2. **Extract to nginx directory**:
   ```bash
   # Extract the downloaded package
   tar -xzf pomodoro-timer-nginx-*.tar.gz -C /var/www/html/
   
   # Set permissions
   chown -R www-data:www-data /var/www/html/
   chmod -R 755 /var/www/html/
   ```

3. **Configure nginx** (if not already configured):
   ```bash
   # Download nginx config from GitHub Actions
   # Or use the example below
   ```

### Nginx Configuration

Use the provided `nginx.conf` from the deployment package or create your own:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service worker
    location = /service-worker.js {
        expires off;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### Automated Deployment Script

The deployment package includes a `deploy.sh` script for automated deployment:

```bash
# Make it executable and run with sudo
chmod +x deploy.sh
sudo ./deploy.sh
```

## 🔄 CI/CD Pipeline Features

### ✅ Quality Assurance
- **Multi-version testing**: Node.js 18.x and 20.x
- **Security scanning**: Automated vulnerability detection
- **Code coverage**: Test coverage reporting
- **Bundle analysis**: Size optimization tracking

### 📊 Build Information
Each build provides:
- Bundle size analysis
- Security audit results
- Test coverage reports
- Deployment-ready packages

### 🎯 Environments
- **Production**: Built from `main`/`master` branch
- **Preview**: Built from pull requests for testing
- **Artifacts**: 90-day retention for deployment packages

## 🔧 Requirements

### Build Requirements
- Node.js 18.x or 20.x
- npm 7.x or higher
- Git

### Deployment Requirements
- Nginx web server
- SSL certificate (recommended for production)
- Domain name (optional)

## 📝 Manual Deployment Steps

If you prefer manual deployment:

1. **Build the application**:
   ```bash
   npm install
   npm run build
   ```

2. **Copy files to nginx**:
   ```bash
   sudo cp -r build/* /var/www/html/
   sudo chown -R www-data:www-data /var/www/html/
   sudo chmod -R 755 /var/www/html/
   ```

3. **Reload nginx**:
   ```bash
   sudo systemctl reload nginx
   ```

## 🌐 Testing the Deployment

After deployment, test:
- Home page loads correctly
- Dark/light mode toggle works
- Pomodoro timer functions
- YouTube video integration works
- Service worker registration (in browser dev tools)

## 🔍 Troubleshooting

### Common Issues

1. **404 errors on refresh**: Ensure nginx `try_files` directive is configured
2. **Static assets not loading**: Check file permissions and nginx configuration
3. **YouTube videos not playing**: Verify HTTPS is enabled (required for YouTube embeds)
4. **Service worker issues**: Clear browser cache and re-register

### Debug Commands
```bash
# Check nginx status
sudo systemctl status nginx

# Test nginx configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify file permissions
ls -la /var/www/html/
```

## 📈 Performance Optimization

The build includes:
- Code splitting and lazy loading
- Asset minification and compression
- Browser caching headers
- Service worker for offline support

For additional optimization:
- Enable Brotli compression in nginx
- Implement CDN for static assets
- Use HTTP/2 if available
- Monitor Core Web Vitals

---

## 🎉 Ready to Deploy!

Your Pomodoro Timer is now ready for production deployment with:
- ✅ Automated builds and testing
- ✅ Security scanning
- ✅ Performance optimization
- ✅ Nginx-ready packages
- ✅ Comprehensive deployment guides

Push your changes to trigger the automated pipeline! 🚀
