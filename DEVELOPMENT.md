# 📋 Development Guide

## 🛠️ Development Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm 7.x or higher
- Git

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Nardo86/pomodoro-youtube-timer.git
   cd pomodoro-youtube-timer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`

4. **Run tests**:
   ```bash
   npm test
   ```

5. **Build for production**:
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
pomodoro-youtube-timer/
├── public/
│   ├── index.html          # Main HTML template
│   ├── manifest.json       # PWA manifest
│   └── service-worker.js   # Service worker for offline support
├── src/
│   ├── App.js             # Main application component
│   ├── App.test.js        # Main component tests
│   ├── PomodoroTimer.js   # Timer functionality
│   ├── YouTubePlayer.js   # YouTube integration
│   └── index.js           # Application entry point
├── .github/
│   └── workflows/         # GitHub Actions CI/CD
│       ├── build-deploy.yml
│       ├── ci-cd.yml
│       └── lint.yml
├── DEPLOYMENT.md          # Deployment guide
└── README.md             # Project documentation
```

## 🧩 Component Architecture

### App.js
- **Purpose**: Main application container
- **State**: Dark/light mode, timer-video sync
- **Features**: Theme switching, responsive layout

### PomodoroTimer.js
- **Purpose**: Core timer functionality
- **State**: Timer status, settings, cycles
- **Features**: Work/break cycles, notifications, settings persistence

### YouTubePlayer.js
- **Purpose**: YouTube video integration
- **State**: Video URL, player status
- **Features**: Video ID extraction, embed player

## 🎨 Styling and Theming

### Material-UI Configuration
- **Theme**: Custom light/dark themes
- **Components**: MUI v7 with emotion styling
- **Responsive**: Mobile-first design approach

### Color Scheme
- **Primary**: Blue (#1976d2)
- **Secondary**: Pink (#dc004e)
- **Background**: Light (#fafafa) / Dark (#121212)
- **Surface**: White (#ffffff) / Grey (#1e1e1e)

## 🔧 Development Scripts

```json
{
  "start": "react-scripts start",        # Development server
  "build": "react-scripts build",        # Production build
  "test": "react-scripts test",          # Run tests
  "eject": "react-scripts eject"         # Eject from CRA (not recommended)
}
```

## 🧪 Testing

### Test Structure
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: Component interaction testing
- **Coverage**: Jest coverage reporting

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in CI mode
npm test -- --coverage --watchAll=false
```

### Test Files
- `src/App.test.js`: Main application tests
- Add more test files following the pattern `*.test.js`

## 📦 Build Process

### Development Build
- Fast rebuilds with hot reloading
- Source maps for debugging
- Unminified code

### Production Build
- Code minification and optimization
- Bundle splitting and lazy loading
- Asset optimization and compression
- Service worker for offline support

### Build Output
```
build/
├── static/
│   ├── js/
│   │   ├── main.[hash].js      # Main application bundle
│   │   └── [hash].chunk.js     # Vendor chunks
│   └── css/
│       └── main.[hash].css     # Application styles
├── index.html                  # Main HTML file
└── ...                         # Other static assets
```

## 🔄 State Management

### Local State
- **useState**: Component-level state
- **useEffect**: Side effects and lifecycle
- **useCallback**: Performance optimization

### Data Persistence
- **localStorage**: User settings persistence
- **Session Storage**: Temporary session data

### Props Drilling
- Minimal prop drilling
- Component composition patterns
- State lifting when needed

## 🎯 Key Features Implementation

### Pomodoro Timer
- **Configurable Durations**: Work, break, long break periods
- **Cycle Tracking**: Visual progress indicators
- **Auto-switching**: Automatic session transitions
- **Notifications**: Browser notifications for session ends

### YouTube Integration
- **URL Parsing**: Support for various YouTube URL formats
- **Embedded Player**: YouTube iframe API
- **Video Control**: Pause/resume based on timer state

### Theme System
- **System Preference**: Auto-detect OS theme
- **Manual Toggle**: User-controlled theme switching
- **Persistent Choice**: Theme preference saved to localStorage

## 🔍 Debugging

### Development Tools
- **React DevTools**: Component inspection
- **Browser DevTools**: Network, console, storage
- **Redux DevTools**: Not used (no Redux)

### Common Issues
- **YouTube API**: Check embed restrictions and HTTPS
- **Notifications**: Ensure browser permissions
- **Service Worker**: Clear cache for updates
- **Local Storage**: Check browser privacy settings

## 📈 Performance Optimization

### Bundle Optimization
- **Code Splitting**: Automatic with React.lazy
- **Tree Shaking**: Dead code elimination
- **Asset Optimization**: Image and font optimization

### Runtime Performance
- **useCallback**: Prevent unnecessary re-renders
- **useMemo**: Expensive calculations caching
- **React.memo**: Component memoization

### SEO and Accessibility
- **Meta Tags**: Proper HTML meta information
- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility

## 🚀 Deployment

### Automated Deployment
- **GitHub Actions**: CI/CD pipeline
- **Build Artifacts**: Automatic package creation
- **Nginx Ready**: Pre-configured deployment packages

### Manual Deployment
- **Build Process**: `npm run build`
- **File Upload**: Copy build folder to web server
- **Nginx Config**: Proper routing and caching

### Environment Variables
```bash
# .env file (not tracked in git)
REACT_APP_YOUTUBE_API_KEY=your_api_key_here
REACT_APP_ENVIRONMENT=production
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes and test
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open Pull Request

### Code Style
- **ESLint**: JavaScript linting (configured in package.json)
- **Prettier**: Code formatting (optional)
- **Conventional Commits**: Meaningful commit messages

### Pull Request Process
- Automated tests must pass
- Code review by maintainers
- Documentation updates if needed
- Version bump if required

## 🔧 Troubleshooting

### Common Development Issues

**Dependencies Issues**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Port Already in Use**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Build Failures**:
```bash
# Clear build cache
npm run build -- --reset-cache
```

### Performance Issues
- **Bundle Size**: Check bundle analyzer
- **Memory Leaks**: React DevTools Profiler
- **Slow Renders**: React.memo and useCallback

---

## 🎉 Happy Coding!

This is a React application built with Create React App, Material-UI, and modern web technologies. Follow this guide for smooth development and deployment experiences.

For deployment-specific instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).
