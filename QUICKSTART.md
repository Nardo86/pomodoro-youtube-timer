# 🚀 Quick Start Guide

## Build and Test Locally

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Test the build locally
npx serve -s build
```

## Deploy with GitHub Actions

1. **Push your code** to trigger the automated pipeline:
   ```bash
   git add .
   git commit -m "Add automated deployment"
   git push origin main
   ```

2. **Monitor the build** in GitHub Actions tab

3. **Download artifacts** from the completed workflow

4. **Deploy to nginx**:
   ```bash
   # Extract the deployment package
   tar -xzf pomodoro-youtube-timer-nginx-*.tar.gz -C /var/www/html/
   
   # Set permissions
   sudo chown -R www-data:www-data /var/www/html/
   sudo chmod -R 755 /var/www/html/
   
   # Reload nginx
   sudo systemctl reload nginx
   ```

## Manual Deployment

```bash
# Build
npm run build

# Deploy with the included script
sudo ./deploy.sh

# Or manually copy files
sudo cp -r build/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo systemctl reload nginx
```

## What's Included

✅ **Automated CI/CD** with GitHub Actions  
✅ **Multi-environment testing** (Node.js 18.x & 20.x)  
✅ **Security scanning** and vulnerability detection  
✅ **Bundle size analysis** and optimization  
✅ **Nginx-ready packages** with configuration  
✅ **Deployment scripts** for easy deployment  
✅ **Comprehensive documentation**  

## 🌐 Access Your App

After deployment, access your Pomodoro YouTube Timer at:
- Local: `http://localhost:3000`
- Production: `http://your-domain.com`

---

**📖 For detailed instructions, see:**
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup and architecture
