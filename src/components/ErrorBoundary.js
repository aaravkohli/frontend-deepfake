import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="bg-main text-heading" style={{ minHeight: '100vh' }}>
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="bg-card border-subtle shadow">
              <Card.Body className="text-center p-5">
                <AlertTriangle size={64} className="text-danger mb-4" />
                <h2 className="text-heading mb-3">Oops! Something went wrong</h2>
                <p className="text-muted mb-4">
                  We encountered an unexpected error. This has been logged and our team will look into it.
                </p>
                
                {process.env.NODE_ENV === 'development' && (
                  <Alert variant="danger" className="text-start mb-4">
                    <Alert.Heading>Error Details (Development Mode)</Alert.Heading>
                    <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                      {error.message}
                      {error.stack && '\n\n' + error.stack}
                    </pre>
                  </Alert>
                )}

                <div className="d-flex gap-3 justify-content-center">
                  <Button 
                    className="btn-gradient"
                    onClick={resetErrorBoundary}
                  >
                    <RefreshCw size={16} className="me-2" />
                    Try Again
                  </Button>
                  
                  <Button 
                    className="btn-secondary-custom"
                    onClick={() => window.location.href = '/'}
                  >
                    <Home size={16} className="me-2" />
                    Go Home
                  </Button>
                </div>

                <div className="mt-4 text-muted small">
                  <p>
                    If this problem persists, please contact support with the error details above.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export function AppErrorBoundary({ 
  children, 
  fallback: FallbackComponent = ErrorFallback,
  onError 
}) {
  const handleError = (error, errorInfo) => {
    // Log error to console
    console.error('🔥 React Error Boundary caught an error:', error, errorInfo);
    
    // Log to external service in production (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { errorInfo } });
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={handleError}
      onReset={() => {
        // Reload the page on reset to clear any corrupted state
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Lightweight error boundary for smaller components
function ComponentErrorFallback({ 
  error, 
  resetErrorBoundary,
  fallbackMessage = "This component encountered an error",
  showDetails = false 
}) {
  return (
    <Alert variant="danger" className="m-3">
      <Alert.Heading className="h6">
        <AlertTriangle size={16} className="me-2" />
        {fallbackMessage}
      </Alert.Heading>
      
      {showDetails && process.env.NODE_ENV === 'development' && (
        <details className="mt-2">
          <summary className="cursor-pointer">Error Details</summary>
          <pre className="mt-2 small" style={{ fontSize: '11px' }}>
            {error.message}
          </pre>
        </details>
      )}

      <div className="mt-2">
        <Button size="sm" variant="outline-danger" onClick={resetErrorBoundary}>
          <RefreshCw size={14} className="me-1" />
          Retry
        </Button>
      </div>
    </Alert>
  );
}

export function ComponentErrorBoundary({ 
  children, 
  fallbackMessage,
  showDetails = false 
}) {
  return (
    <ReactErrorBoundary
      FallbackComponent={(props) => (
        <ComponentErrorFallback 
          {...props} 
          fallbackMessage={fallbackMessage}
          showDetails={showDetails}
        />
      )}
      onError={(error, errorInfo) => {
        console.warn('⚠️ Component Error:', error, errorInfo);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

export default AppErrorBoundary;