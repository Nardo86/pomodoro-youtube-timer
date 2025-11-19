# 🚀 GitHub Actions Workflows

This directory contains the automated CI/CD workflows for the Pomodoro Timer project.

## 📋 Workflow Files

### 1. `build-deploy.yml`
**Purpose**: Build application and create deployment packages
**Triggers**: Push to main/master, pull requests, manual dispatch
**Features**:
- Multi-node testing
- Automated builds
- Artifact creation
- Deployment summaries
- Preview environments for PRs

### 2. `ci-cd.yml`
**Purpose**: Comprehensive CI/CD pipeline with quality checks
**Triggers**: Push to main/master/develop, pull requests
**Features**:
- Multi-version Node.js testing (18.x, 20.x)
- Security vulnerability scanning
- Code coverage reporting
- Bundle size analysis
- Nginx package creation
- Automated deployment scripts

### 3. `lint.yml`
**Purpose**: Code quality and formatting checks
**Triggers**: Push to any branch, pull requests
**Features**:
- ESLint configuration checking
- Prettier formatting validation
- Automated code style enforcement

## 🔄 Workflow Process

### On Push to Main/Master
```
1. lint.yml → Code quality checks
2. ci-cd.yml → Full CI/CD pipeline
   ├── Test on Node.js 18.x & 20.x
   ├── Security audit
   ├── Build application
   ├── Create nginx package
   └── Upload artifacts
3. build-deploy.yml → Deployment package creation
```

### On Pull Request
```
1. lint.yml → Code quality checks
2. ci-cd.yml → Testing and preview builds
3. build-deploy.yml → Preview environment
```

## 📦 Artifacts Generated

### Build Artifacts
- `build-files/`: Complete build output
- `deployment/`: Tar.gz packages
- Retention: 30 days

### Deployment Artifacts
- `nginx-deployment-package/`: Ready-to-deploy tar.gz
- `nginx-config/`: Nginx configuration files
- Retention: 90 days

## 🔧 Configuration

### Environment Variables
All workflows use standard GitHub Actions environment:
- `GITHUB_TOKEN`: Automatically provided
- `NODE_VERSION`: Specified in workflows (20.x)

### Secrets Required
No additional secrets required for basic functionality.
Optional secrets for enhanced features:
- `CODECOV_TOKEN`: For code coverage reporting

## 📊 Monitoring and Reporting

### Build Summaries
Each workflow generates detailed GitHub step summaries including:
- Build status and duration
- Bundle size analysis
- Security audit results
- Test coverage reports
- Deployment instructions

### Notifications
- GitHub status checks
- Pull request comments
- Workflow run notifications

## 🛠️ Local Development

### Testing Workflows Locally
```bash
# Install act for local GitHub Actions testing
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow locally
act pull_request
```

### Workflow Linting
```bash
# Install actionlint
go install github.com/rhysd/actionlint/cmd/actionlint@latest

# Lint workflows
actionlint .github/workflows/*.yml
```

## 🚀 Deployment Process

### Automated Deployment
1. **Code Push** → Triggers workflows
2. **Build & Test** → Quality assurance
3. **Package Creation** → Nginx-ready packages
4. **Artifact Upload** → Available for download
5. **Deployment** → Manual or automated nginx deployment

### Manual Deployment
1. Download artifacts from Actions tab
2. Extract deployment package
3. Run provided deployment script
4. Configure nginx if needed

## 🔍 Troubleshooting

### Common Issues
- **Node.js Version**: Ensure specified versions are available
- **Cache Issues**: Clear cache if dependencies fail
- **Permissions**: Check artifact download permissions
- **Timeouts**: Increase timeout values for large builds

### Debug Commands
```bash
# Check workflow syntax
actionlint .github/workflows/*.yml

# Test specific job
act -j build

# View workflow logs
gh run list
gh run view <run-id>
```

## 📈 Performance

### Optimization Features
- **Caching**: npm dependencies cached between runs
- **Parallel Jobs**: Multiple Node.js versions tested simultaneously
- **Matrix Strategy**: Efficient multi-environment testing
- **Conditional Runs**: Jobs run only when needed

### Metrics Tracked
- Build duration and success rate
- Bundle size changes over time
- Security vulnerability trends
- Test coverage improvements

---

## 🎯 Best Practices

These workflows follow GitHub Actions best practices:
- ✅ Semantic versioning
- ✅ Minimal permissions
- ✅ Caching strategies
- ✅ Error handling
- ✅ Comprehensive logging
- ✅ Security scanning
- ✅ Artifact retention policies

For deployment instructions, see [DEPLOYMENT.md](../DEPLOYMENT.md).
