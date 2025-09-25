# DeepGuard Frontend

A production-ready React frontend for the DeepGuard deepfake detection system, fully integrated with the FastAPI backend.

## Features

### 🔧 **Backend Integration**
- Real-time connection status monitoring
- Automatic health checks and model status validation
- Support for all backend endpoints (`/health`, `/supported-formats`, `/detect`)
- Comprehensive error handling with retry logic

### 📁 **Advanced File Upload**
- Drag-and-drop file upload with progress tracking
- Dynamic format validation based on backend capabilities
- Support for audio (.wav, .mp3, .flac, etc.) and image (.jpg, .png, etc.) files
- File size validation (100MB limit)
- Upload cancellation support

### 📊 **Detailed Results Visualization**
- Interactive charts for probability analysis (Pie charts, Bar charts)
- Technical metadata display (model architecture, device, processing time)
- Audio-specific analysis (raw logits, sigmoid outputs, uncertainty detection)
- Image-specific analysis (resolution, format, predicted classes)

### ⚙️ **Audio Model Calibration**
- Real-time threshold adjustment (0.1-0.9 range)
- Output interpretation flipping for model correction
- Uncertainty range configuration
- Preset configurations (Conservative, Balanced, Sensitive)
- Persistent settings via localStorage

### 🎨 **Modern UI/UX**
- Dark theme with professional design
- Responsive layout for all screen sizes
- Real-time status indicators
- Comprehensive error boundaries
- Accessibility features (ARIA labels, keyboard navigation)

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- DeepGuard backend running on `http://localhost:8000` (or configure `REACT_APP_API_BASE_URL`)

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Backend Connection
Ensure your DeepGuard FastAPI backend is running:
```bash
# In your backend directory
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
