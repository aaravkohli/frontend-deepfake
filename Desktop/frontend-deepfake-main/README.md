# DeepGuard Frontend

A professional React-based web application for deepfake detection, providing an intuitive interface for analyzing audio and image files using advanced AI models.

## 🎯 Project Overview

DeepGuard is a sophisticated deepfake detection platform that integrates with a FastAPI backend to provide real-time analysis of potentially synthetic media. The frontend offers a clean, responsive interface with drag-and-drop file upload, real-time progress tracking, detailed results visualization, and advanced configuration options.

### Key Features

- **Multi-Modal Detection**: Support for both audio and image deepfake detection
- **Real-Time Analysis**: Live progress tracking and status updates during processing
- **Advanced Visualization**: Interactive charts and detailed metadata display using Recharts
- **Drag & Drop Interface**: Intuitive file upload with format validation
- **Audio Calibration**: Adjustable detection thresholds and uncertainty ranges
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Responsive Design**: Mobile-first responsive layout using Bootstrap
- **Environment Configuration**: Separate development and production API configurations

## 🏗️ Architecture

### Technology Stack

- **Frontend**: React 18 with JavaScript (ES6+)
- **State Management**: React Hooks + SWR for data fetching
- **HTTP Client**: Axios with retry logic and interceptors
- **UI Framework**: Bootstrap 5 with custom SCSS
- **Charts**: Recharts for data visualization
- **File Upload**: React Dropzone
- **Storage**: idb-keyval for persistent configuration
- **Error Handling**: React Error Boundary

### Project Structure

```
src/
├── components/           # React components
│   ├── AudioCalibration.js      # Audio detection settings
│   ├── ErrorBoundary.js         # Global error handling
│   ├── FileUpload.js           # Drag-drop file upload
│   ├── NavBar.js               # Navigation header
│   └── ResultsVisualization.js # Analysis results display
├── hooks/               # Custom React hooks
│   ├── useApi.js               # API integration hook
│   └── useAudioCalibration.js  # Audio settings persistence
├── services/            # External service integrations
│   └── api.js                  # Axios-based API service
├── styles/              # Styling files
│   ├── _custom-bootstrap.scss  # Bootstrap customizations
│   └── theme.css              # Global theme styles
├── types/               # Type definitions and constants
│   └── index.js               # Shared constants and types
├── App.js               # Main application component
└── index.js             # React app entry point
```

### Component Architecture

#### App.js
- **Central State Management**: Manages navigation state and backend connection
- **Route Handling**: Controls view switching between home, detector, results, settings
- **Props Distribution**: Passes data and handlers to child components
- **Backend Integration**: Monitors API health and enables/disables features

#### FileUpload Component
- **Drag & Drop**: React Dropzone integration with visual feedback
- **Format Validation**: Dynamic validation based on backend-supported formats
- **Progress Tracking**: Real-time upload and analysis progress display
- **Error Handling**: User-friendly error messages and retry options

#### ResultsVisualization Component
- **Multi-Model Results**: Displays both audio and image detection results
- **Interactive Charts**: Recharts-based confidence and probability visualizations
- **Technical Metadata**: Detailed model information and processing statistics
- **Responsive Layout**: Adaptive grid layout for different screen sizes

#### AudioCalibration Component
- **Threshold Controls**: Adjustable sensitivity and uncertainty ranges
- **Preset Management**: Quick-access presets for different use cases
- **Persistent Storage**: Settings saved to IndexedDB via idb-keyval
- **Real-time Preview**: Live updates of calibration effects

## 🚀 Setup & Installation

### Prerequisites

- Node.js 16+ and npm 8+
- DeepGuard FastAPI backend running (see backend documentation)

### Installation Steps

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd DeepGuard-main-2
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create `.env` for development:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:8000
   REACT_APP_ENV=development
   ```
   
   Create `.env.production` for production:
   ```env
   REACT_APP_API_BASE_URL=https://your-production-api.com
   REACT_APP_ENV=production
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

5. **Build for Production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API base URL | `http://localhost:8000` |
| `REACT_APP_ENV` | Environment identifier | `development` |

### Audio Calibration Settings

The application supports persistent audio calibration settings:

- **Detection Threshold**: Sensitivity level for deepfake detection (0-100%)
- **Uncertainty Range**: Acceptable uncertainty in predictions (0-50%)
- **Presets**: Quick configurations for different scenarios
  - Conservative: High threshold, low uncertainty
  - Balanced: Medium threshold, medium uncertainty  
  - Sensitive: Low threshold, high uncertainty

## 📡 API Integration

### Backend Endpoints

The frontend integrates with the following FastAPI endpoints:

#### Health Check
```
GET /health
Response: { "status": "healthy", "timestamp": "ISO-date" }
```

#### Supported Formats
```
GET /supported-formats
Response: {
  "audio": ["mp3", "wav", "flac", "m4a"],
  "image": ["jpg", "jpeg", "png", "bmp", "webp"]
}
```

#### Deepfake Detection
```
POST /detect
Content-Type: multipart/form-data
Body: { file: File, config?: AudioConfig }
Response: {
  "predictions": { /* model results */ },
  "processing_time": number,
  "file_info": { /* metadata */ }
}
```

### API Service Features

- **Automatic Retry**: Exponential backoff for failed requests
- **Request Cancellation**: Abort in-flight requests when needed
- **Progress Tracking**: Upload and processing progress callbacks
- **Error Handling**: Comprehensive error classification and messaging
- **Request Interceptors**: Automatic request/response logging and formatting

## 🎨 UI/UX Design

### Design System

- **Color Scheme**: Professional blue/gray palette with high contrast
- **Typography**: Bootstrap's native font stack for optimal readability
- **Spacing**: Consistent 8px grid system
- **Interactive Elements**: Hover states, loading spinners, and smooth transitions

### Responsive Breakpoints

- **Mobile**: < 576px - Single column layout, compact navigation
- **Tablet**: 576px - 992px - Two-column layout, collapsible sidebar
- **Desktop**: > 992px - Multi-column layout, expanded navigation

### Accessibility Features

- **Keyboard Navigation**: Full keyboard accessibility for all interactive elements
- **Screen Reader Support**: ARIA labels and semantic HTML structure  
- **High Contrast**: WCAG AA compliant color combinations
- **Error Announcements**: Live regions for dynamic error messages

## 🔍 Error Handling

### Error Boundary Implementation

The application includes a comprehensive error boundary that:

- **Catches React Errors**: Prevents app crashes from component errors
- **Logs Errors**: Detailed error logging for debugging
- **Fallback UI**: User-friendly error pages with recovery options
- **Error Reporting**: Integration points for external error tracking

### API Error Handling

- **Network Errors**: Retry logic with exponential backoff
- **HTTP Errors**: Status-code-based error classification
- **Validation Errors**: Field-level error display
- **Timeout Handling**: Configurable request timeout with user feedback

## 📊 Performance Considerations

### Optimization Strategies

- **Code Splitting**: Lazy loading of non-critical components
- **Memoization**: React.memo and useMemo for expensive computations
- **Bundle Analysis**: Webpack bundle analyzer for size optimization
- **Image Optimization**: WebP format support with fallbacks

### Loading States

- **Skeleton Loading**: Placeholder content during data fetching
- **Progress Indicators**: Real-time progress for long-running operations
- **Optimistic Updates**: Immediate UI feedback for user actions

## 🧪 Testing Strategy

### Recommended Testing Approach

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Component testing
npm test

# Coverage reporting
npm test -- --coverage
```

### Testing Categories

- **Unit Tests**: Individual component and hook testing
- **Integration Tests**: Component interaction and API integration
- **E2E Tests**: Full user workflow testing with Cypress/Playwright
- **Accessibility Tests**: Automated a11y testing with jest-axe

## 🚀 Deployment

### Production Build

```bash
# Create optimized production build
npm run build

# Preview production build locally
npx serve -s build
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints accessible
- [ ] HTTPS enabled for production
- [ ] Error tracking configured
- [ ] Analytics integration (if required)
- [ ] Performance monitoring setup

### Recommended Hosting Platforms

- **Static Hosting**: Netlify, Vercel, AWS S3 + CloudFront
- **Containerized**: Docker with nginx for custom deployments
- **CI/CD**: GitHub Actions, GitLab CI, or Jenkins pipelines

## 🛠️ Troubleshooting

### Common Issues

#### Backend Connection Issues
```
Error: Network Error - Unable to connect to API
```
**Solution**: Verify backend is running and CORS is configured properly

#### File Upload Failures  
```
Error: File format not supported
```
**Solution**: Check supported formats via `/supported-formats` endpoint

#### Audio Calibration Reset
```
Settings not persisting between sessions
```
**Solution**: Clear browser storage and reconfigure settings

### Debug Mode

Enable debug logging by setting:
```javascript
localStorage.setItem('debug', 'deepguard:*');
```

### Performance Issues

- Check Network tab for slow API requests
- Monitor React DevTools for unnecessary re-renders
- Verify file sizes aren't exceeding backend limits

## 📝 Development Workflow

### Adding New Features

1. **Component Creation**: Create new components in `src/components/`
2. **Hook Integration**: Add custom hooks in `src/hooks/` if needed
3. **API Integration**: Extend `src/services/api.js` for new endpoints
4. **Styling**: Add component-specific styles or extend theme
5. **Error Handling**: Integrate with error boundary system

### Code Style Guidelines

- **ES6+ Features**: Use modern JavaScript features (async/await, destructuring)
- **Functional Components**: Prefer hooks over class components
- **PropTypes**: Document component props (consider TypeScript migration)
- **Naming Conventions**: PascalCase for components, camelCase for functions

## 🔮 Future Enhancements

### Planned Features

- **Real-time Processing**: WebSocket integration for live analysis updates
- **Analytics Dashboard**: Historical analysis and trend visualization
- **User Management**: Authentication and user-specific settings
- **Batch Processing**: Multiple file upload and analysis
- **Export Functionality**: PDF reports and CSV data export
- **Advanced Filters**: Custom detection criteria and model selection

### Technical Improvements

- **TypeScript Migration**: Full type safety and better IDE support
- **PWA Support**: Offline capabilities and mobile app-like experience  
- **Component Library**: Shared component system with Storybook
- **Testing Coverage**: Comprehensive test suite with >90% coverage
- **Performance Monitoring**: Real user monitoring and error tracking

## 📄 License

[Specify your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the API documentation for backend integration

---

**DeepGuard Frontend** - Professional deepfake detection made accessible.
