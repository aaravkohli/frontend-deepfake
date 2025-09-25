import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card, Navbar, Nav, Alert, Spinner, Form } from 'react-bootstrap';
import { Home as HomeIcon, Search, BarChart3, Info, HelpCircle, AlertTriangle, Settings, CheckCircle } from 'lucide-react';

// Components
import AppErrorBoundary from './components/ErrorBoundary';
import FileUpload from './components/FileUpload';
import ResultsVisualization from './components/ResultsVisualization';
import AudioCalibration from './components/AudioCalibration';

// Hooks and services
import { useBackendStatus, useFileAnalysis, useAudioCalibration } from './hooks/useApi';
import { FileType } from './types/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const { status: backendStatus, isConnected, error: backendError, modelsStatus } = useBackendStatus();
  const { analyzeFile, resetAnalysis, cancelAnalysis, canCancel, ...analysisState } = useFileAnalysis();
  const { config: audioConfig } = useAudioCalibration();
  const [showCalibration, setShowCalibration] = useState(false);

  // Handle file analysis
  const handleFileSelect = async (file) => {
    // Use audio calibration config for audio files
    const config = file.type.startsWith('audio/') ? audioConfig : undefined;
    await analyzeFile(file, config);
    setCurrentPage('result');
  };

  const handleFileRemove = () => {
    resetAnalysis();
    setCurrentPage('detector');
  };

  // Navigation Bar with Backend Status
  const Navigation = () => (
    <Navbar className="bg-main border-subtle" variant="dark" expand="md">
      <Container>
        <Navbar.Brand className="text-primary-accent fw-bold d-flex align-items-center">
          DeepGuard
          <div className="ms-3 d-flex align-items-center">
            {backendStatus === 'connected' && (
              <CheckCircle size={16} className="text-success me-1" title="Backend Connected" />
            )}
            {backendStatus === 'connecting' && (
              <Spinner animation="border" size="sm" className="me-1" />
            )}
            {backendStatus === 'disconnected' && (
              <AlertTriangle size={16} className="text-danger me-1" title="Backend Disconnected" />
            )}
            <span className={`small ${isConnected ? 'text-success' : 'text-danger'}`}>
              {backendStatus}
            </span>
          </div>
        </Navbar.Brand>
        
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="ms-auto">
            <Nav.Link 
              className={currentPage === 'home' ? 'text-primary-accent' : 'text-heading'} 
              onClick={() => setCurrentPage('home')}
            >
              <HomeIcon size={16} className="me-1" />
              Home
            </Nav.Link>
            <Nav.Link 
              className={currentPage === 'detector' ? 'text-primary-accent' : 'text-heading'} 
              onClick={() => setCurrentPage('detector')}
              disabled={!isConnected}
            >
              <Search size={16} className="me-1" />
              Detector
            </Nav.Link>
            <Nav.Link 
              className={currentPage === 'settings' ? 'text-primary-accent' : 'text-heading'} 
              onClick={() => setCurrentPage('settings')}
            >
              <Settings size={16} className="me-1" />
              Settings
            </Nav.Link>
            <Nav.Link 
              className={currentPage === 'about' ? 'text-primary-accent' : 'text-heading'} 
              onClick={() => setCurrentPage('about')}
            >
              <Info size={16} className="me-1" />
              About
            </Nav.Link>
            <Nav.Link 
              className={currentPage === 'help' ? 'text-primary-accent' : 'text-heading'} 
              onClick={() => setCurrentPage('help')}
            >
              <HelpCircle size={16} className="me-1" />
              Help
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );

  // Backend Status Alert
  const BackendStatusAlert = () => {
    if (isConnected) return null;
    
    return (
      <Alert variant="danger" className="mx-4 mt-3">
        <AlertTriangle size={16} className="me-2" />
        <strong>Backend Disconnected:</strong> {backendError || 'Unable to connect to DeepGuard backend.'}
        <div className="mt-2 text-muted">
          Please ensure the backend is running at the configured URL and try refreshing the page.
        </div>
      </Alert>
    );
  };

  // Home Page with Backend Status
  const HomePage = () => (
    <div className="bg-main text-heading" style={{ minHeight: '100vh' }}>
      <Container className="py-5">
        <Row className="text-center mb-5">
          <Col>
            <h1 className="text-heading">
              Detect <span className="text-primary-accent">DeepFakes</span>
            </h1>
            <p className="text-muted">Production-ready deepfake detection with RawNetLite audio models and EfficientNet-B0 image analysis.</p>
            
            {isConnected ? (
              <Button 
                className="btn-gradient" 
                size="lg" 
                onClick={() => setCurrentPage('detector')}
              >
                <Search size={20} className="me-2" />
                Start Detection
              </Button>
            ) : (
              <Button 
                variant="outline-secondary" 
                size="lg" 
                disabled
              >
                Backend Offline
              </Button>
            )}
          </Col>
        </Row>
        
        {/* System Status */}
        {modelsStatus && (
          <Row className="mb-4">
            <Col>
              <Card className="bg-card border-subtle shadow">
                <Card.Header>
                  <Card.Title className="text-heading mb-0">System Status</Card.Title>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={4} className="text-center">
                      <div className={`mb-2 ${modelsStatus.audio ? 'text-success' : 'text-danger'}`}>
                        {modelsStatus.audio ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                      </div>
                      <div className="text-heading">Audio Model</div>
                      <div className="text-muted small">RawNetLite</div>
                      <div className={modelsStatus.audio ? 'text-success' : 'text-danger'}>
                        {modelsStatus.audio ? 'Ready' : 'Not Loaded'}
                      </div>
                    </Col>
                    <Col md={4} className="text-center">
                      <div className={`mb-2 ${modelsStatus.image ? 'text-success' : 'text-danger'}`}>
                        {modelsStatus.image ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                      </div>
                      <div className="text-heading">Image Model</div>
                      <div className="text-muted small">EfficientNet-B0</div>
                      <div className={modelsStatus.image ? 'text-success' : 'text-danger'}>
                        {modelsStatus.image ? 'Ready' : 'Not Loaded'}
                      </div>
                    </Col>
                    <Col md={4} className="text-center">
                      <div className={`mb-2 ${modelsStatus.video ? 'text-success' : 'text-danger'}`}>
                        {modelsStatus.video ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                      </div>
                      <div className="text-heading">Video Model</div>
                      <div className="text-muted small">Coming Soon</div>
                      <div className="text-warning">
                        Not Available
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
        
        <Row className="mb-5">
          <Col lg={8} className="mx-auto">
            <Card className="bg-card border-subtle mb-3 shadow">
              <Card.Body>
                <Card.Title className="text-primary-accent">Advanced Multi-Modal Detection</Card.Title>
                <Card.Text className="text-muted">
                  DeepGuard employs state-of-the-art deep learning architectures specifically designed for deepfake detection:
                </Card.Text>
                <ul className="text-muted">
                  <li><strong>Audio:</strong> RawNetLite with 1D convolutions, residual blocks, and bidirectional GRU</li>
                  <li><strong>Images:</strong> EfficientNet-B0 backbone with custom classifier layers</li>
                  <li><strong>Calibration:</strong> Advanced uncertainty detection and threshold tuning</li>
                  <li><strong>Performance:</strong> Optimized for Apple Silicon (MPS) and CPU fallback</li>
                </ul>
              </Card.Body>
            </Card>
            
            <Card className="bg-card border-subtle mb-3 shadow">
              <Card.Body>
                <Card.Title className="text-heading">Why DeepFake Detection Matters</Card.Title>
                <Card.Text className="text-muted">
                  As AI-generated content becomes increasingly sophisticated, reliable detection systems are crucial for:
                  protecting against misinformation, preventing identity fraud, maintaining content authenticity, 
                  and preserving digital trust in media.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );

  // Detector Page with Real Backend Integration
  const DetectorPage = () => (
    <div className="bg-main text-heading" style={{ minHeight: '100vh' }}>
      <Container className="py-5">
        <Row className="text-center mb-4">
          <Col>
            <h1 className="text-heading">DeepFake Detector</h1>
            <p className="text-muted">Upload audio or image files to analyze for AI-generated content</p>
          </Col>
        </Row>
        
        <Row>
          <Col lg={8} className="mx-auto">
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              uploadedFile={analysisState.uploadedFile}
              isAnalyzing={analysisState.isAnalyzing}
              progress={analysisState.progress}
              error={analysisState.error}
              result={analysisState.result ? {
                detection_result: analysisState.result.detection_result,
                confidence_score: analysisState.result.confidence_score,
                file_type: analysisState.result.file_type
              } : undefined}
              disabled={!isConnected}
            />
            
            {canCancel && (
              <div className="text-center mt-3">
                <Button 
                  variant="outline-danger" 
                  onClick={cancelAnalysis}
                >
                  Cancel Analysis
                </Button>
              </div>
            )}
          </Col>
        </Row>
        
        {/* Audio Calibration Panel for Audio Files */}
        {analysisState.uploadedFile?.type?.startsWith('audio/') && (
          <Row className="mt-4">
            <Col lg={8} className="mx-auto">
              <AudioCalibration 
                showAdvanced={true}
                className="mb-4"
              />
            </Col>
          </Row>
        )}
        
        {/* Feature Cards */}
        <Row className="mt-5">
          <Col md={4}>
            <Card className="bg-card border-subtle mb-3 shadow">
              <Card.Body className="text-center">
                <Card.Title className="text-primary-accent">Audio Analysis</Card.Title>
                <Card.Text className="text-muted">
                  RawNetLite architecture with 1D convolutions and bidirectional GRU
                </Card.Text>
                <div className={`mt-2 ${modelsStatus?.audio ? 'text-success' : 'text-danger'}`}>
                  {modelsStatus?.audio ? <CheckCircle size={16} className="me-1" /> : <AlertTriangle size={16} className="me-1" />}
                  {modelsStatus?.audio ? 'Ready' : 'Not Available'}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="bg-card border-subtle mb-3 shadow">
              <Card.Body className="text-center">
                <Card.Title className="text-primary-accent">Image Analysis</Card.Title>
                <Card.Text className="text-muted">
                  EfficientNet-B0 backbone with custom deepfake classification layers
                </Card.Text>
                <div className={`mt-2 ${modelsStatus?.image ? 'text-success' : 'text-danger'}`}>
                  {modelsStatus?.image ? <CheckCircle size={16} className="me-1" /> : <AlertTriangle size={16} className="me-1" />}
                  {modelsStatus?.image ? 'Ready' : 'Not Available'}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="bg-card border-subtle mb-3 shadow">
              <Card.Body className="text-center">
                <Card.Title className="text-primary-accent">Advanced Features</Card.Title>
                <Card.Text className="text-muted">
                  Uncertainty detection, calibration controls, and real-time processing
                </Card.Text>
                <div className="mt-2 text-info">
                  <Settings size={16} className="me-1" />
                  Available
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );

  // Results Page with Advanced Visualization
  const ResultPage = () => {
    if (!analysisState.result) {
      return (
        <div className="bg-main text-heading d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
          <Container className="text-center py-5">
            <h2 className="text-heading">No analysis results available</h2>
            <p className="text-muted">Please upload and analyze a file first.</p>
            <Button className="btn-gradient mt-4" onClick={() => setCurrentPage('detector')}>
              Go to Detector
            </Button>
          </Container>
        </div>
      );
    }

    return (
      <div className="bg-main text-heading" style={{ minHeight: '100vh' }}>
        <Container className="py-5">
          <Row className="text-center mb-4">
            <Col>
              <h1 className="text-heading">Analysis Results</h1>
              <p className="text-muted">
                Detailed analysis report with technical metadata and confidence metrics
              </p>
            </Col>
          </Row>
          
          <ResultsVisualization 
            result={analysisState.result}
            className="mb-4"
          />
          
          <Row>
            <Col className="text-center">
              <Button 
                className="btn-gradient me-2" 
                onClick={() => {
                  resetAnalysis();
                  setCurrentPage('detector');
                }}
              >
                <Search size={16} className="me-2" />
                Analyze Another File
              </Button>
              <Button 
                className="btn-secondary-custom" 
                onClick={() => setCurrentPage('settings')}
              >
                <Settings size={16} className="me-2" />
                Adjust Settings
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  };
  
  // Settings Page
  const SettingsPage = () => (
    <div className="bg-main text-heading" style={{ minHeight: '100vh' }}>
      <Container className="py-5">
        <Row className="text-center mb-4">
          <Col>
            <h1 className="text-heading">Settings</h1>
            <p className="text-muted">Configure detection models and calibration parameters</p>
          </Col>
        </Row>
        
        <Row>
          <Col lg={8} className="mx-auto">
            <AudioCalibration 
              showAdvanced={true}
              className="mb-4"
            />
          </Col>
        </Row>
        
        <Row>
          <Col lg={8} className="mx-auto">
            <Card className="bg-card border-subtle shadow">
              <Card.Header>
                <Card.Title className="text-heading mb-0">
                  <Info size={18} className="me-2" />
                  System Information
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <strong className="text-heading">Backend Status:</strong>
                  <span className={`ms-2 ${isConnected ? 'text-success' : 'text-danger'}`}>
                    {backendStatus}
                  </span>
                </div>
                
                {modelsStatus && (
                  <div className="mb-3">
                    <strong className="text-heading">Model Status:</strong>
                    <div className="ms-3 mt-2">
                      <div className={`mb-1 ${modelsStatus.audio ? 'text-success' : 'text-danger'}`}>
                        Audio Model (RawNetLite): {modelsStatus.audio ? 'Loaded' : 'Not Available'}
                      </div>
                      <div className={`mb-1 ${modelsStatus.image ? 'text-success' : 'text-danger'}`}>
                        Image Model (EfficientNet-B0): {modelsStatus.image ? 'Loaded' : 'Not Available'}
                      </div>
                      <div className={`mb-1 ${modelsStatus.video ? 'text-success' : 'text-warning'}`}>
                        Video Model: {modelsStatus.video ? 'Loaded' : 'Not Implemented'}
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <strong className="text-heading">Environment:</strong>
                  <span className="ms-2 text-muted">
                    {process.env.REACT_APP_ENV || 'development'}
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );


  // About Us Page
  const AboutPage = () => (
    <div className="bg-main text-heading" style={{ minHeight: '100vh' }}>
      <Container className="py-5">
        <Row className="text-center mb-4">
          <Col>
            <h1 className="text-heading">About DeepGuard</h1>
            <p className="text-muted">Leading the fight against malicious AI-generated content</p>
          </Col>
        </Row>
        <Card className="bg-card border-subtle mb-4 shadow">
          <Card.Body>
            <h2 className="text-heading">Our Mission</h2>
            <p className="text-muted">
             DeepGuard is committed to preserving trust and authenticity in the digital age by providing a reliable and scalable multimodal deepfake detection framework. Our mission is to empower cybersecurity, journalism, law enforcement, and social media platforms with advanced AI-driven tools that detect manipulated images, videos, and audio. By continuously adapting to emerging generative models, enabling real-time analysis, and optimizing for diverse devices, we strive to safeguard individuals and organizations from misinformation, fraud, and digital threats while ensuring the integrity of online information.
            </p>
            <h2 className="text-heading">Our Technology</h2>
            <p className="text-muted">
              We use advanced deep learning models, specifically a ResNext-based CNN for spatial analysis and an LSTM for sequence modeling, trained on both real and AI-generated samples. Our implementation leverages Python along with frameworks and libraries such as PyTorch, TensorFlow, OpenCV, NumPy, Pandas, and Librosa for audio processing. The system is deployed through a Django-based web interface and containerized using Docker for scalability and portability. For training and evaluation, we utilize the DFDC (Deepfake Detection Challenge) dataset along with curated multimodal datasets to ensure robust performance across diverse scenarios.
            </p>
          </Card.Body>
        </Card>
        <Row>
          {[
            {
              name: "Aarav Kohli",
              role: "Developer",
              description: "Backend, data handling and model integration & deplyoment.",
              image: "🧑‍💻"
            },
            {
              name: "Naman Jain",
              role: "Developer",
              description: "Frontend with UI/UX design, model  and deployment.",
              image: "🧑‍💻"
            }
          ].map((member, idx) => (
            <Col md={6} key={idx}>
              <Card className="bg-card border-subtle mb-3 shadow text-center">
                <Card.Body>
                  <div style={{ fontSize: '2.5rem' }}>{member.image}</div>
                  <Card.Title className="text-primary-accent">{member.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-primary-accent">{member.role}</Card.Subtitle>
                  <Card.Text className="text-muted">{member.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );

  // Help Page
  const HelpPage = () => (
    <div className="bg-main text-heading" style={{ minHeight: '100vh' }}>
      <Container className="py-5">
        <Row className="text-center mb-4">
          <Col>
            <h1 className="text-heading">Help & Support</h1>
            <p className="text-muted">Find answers to common questions or contact our support team</p>
          </Col>
        </Row>
        <Card className="bg-card border-subtle mb-4 shadow">
          <Card.Body>
            <h2 className="text-heading">Frequently Asked Questions</h2>
            <ul>
              <li className="text-muted"><strong>How does DeepGuard detect deepfakes?</strong><br />DeepGuard uses deep learning models to analyze images, videos, and audio for signs of manipulation.</li>
              <li className="text-muted"><strong>What media formats are supported?</strong><br />JPG, PNG, MP4, AVI, WAV, MP3.</li>
              <li className="text-muted"><strong>Is my data secure?</strong><br />Uploaded files are processed securely and not shared.</li>
              <li className="text-muted"><strong>How accurate is the detection?</strong><br />Accuracy is beginner-level (around 86%) and improving as the project develops.</li>
            </ul>
          </Card.Body>
        </Card>
        <Card className="bg-card border-subtle mb-4 shadow">
          <Card.Body>
            <h2 className="text-heading">Contact Support</h2>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="text-heading">Email address</Form.Label>
                <Form.Control type="email" className="bg-main text-muted border-subtle" placeholder="Enter email" />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="text-heading">Your Question</Form.Label>
                <Form.Control as="textarea" rows={3} className="bg-main text-muted border-subtle" />
              </Form.Group>
              <Button className="btn-gradient" type="submit">
                Submit
              </Button>
            </Form>
          </Card.Body>
        </Card>
        <Card className="bg-card border-subtle mb-3 shadow">
          <Card.Body>
            <h2 className="text-heading">Additional Resources</h2>
            <ul>
              <li><a href="https://cyble.com/knowledge-hub/deepfake-threats-india-security-strategies/" target="_blank" rel="noopener noreferrer">DeepFake Awareness Guide</a></li>
              <li><a href="https://share.google/LQYK74Cj6OCceFBvn" className="text-primary-accent" target="_blank" rel="noopener noreferrer">Media Authenticity Tips</a></li>
            </ul>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );

  // Routing logic
  let pageComponent;
  switch (currentPage) {
    case 'home': 
      pageComponent = <HomePage />; 
      break;
    case 'detector': 
      pageComponent = <DetectorPage />; 
      break;
    case 'result': 
      pageComponent = <ResultPage />; 
      break;
    case 'settings': 
      pageComponent = <SettingsPage />; 
      break;
    case 'about': 
      pageComponent = <AboutPage />; 
      break;
    case 'help': 
      pageComponent = <HelpPage />; 
      break;
    default: 
      pageComponent = <HomePage />;
  }

  return (
    <AppErrorBoundary>
      <Navigation />
      <BackendStatusAlert />
      {pageComponent}
      <footer className="bg-main text-muted text-center py-3 border-subtle">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <span>DeepGuard &copy; {new Date().getFullYear()}</span>
            <div className="d-flex align-items-center">
              <span className="me-3">Status:</span>
              <span className={isConnected ? 'text-success' : 'text-danger'}>
                {backendStatus}
              </span>
            </div>
          </div>
        </Container>
      </footer>
    </AppErrorBoundary>
  );
}

export default App;